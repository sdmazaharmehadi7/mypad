import { Server as SocketIOServer } from 'socket.io';
import { parsePadPath } from './pad-path';

/**
 * ============================================================================
 * MyPad Real-time Collaborative Socket.IO Server Module
 * ============================================================================
 * 
 * ARCHITECTURAL DESIGN & VERCEL FLUID COMPUTE CONSIDERATIONS:
 * 
 * 1. Persistent Source of Truth:
 *    MongoDB remains the durable database for pad content. Socket.IO serves
 *    solely as the ephemeral real-time broadcast transport between active clients.
 *    Content is NEVER stored permanently in WebSocket server memory.
 * 
 * 2. Room Model:
 *    Every pad maps to a validated, normalized canonical room key (e.g. "college/ml").
 *    All client-provided paths are strictly normalized, parsed, and validated
 *    using parsePadPath() before any socket is allowed to join.
 * 
 * 3. Loop Prevention & Conflict Resolution:
 *    Updates are broadcast via `socket.to(room).emit('pad:update', payload)`,
 *    which inherently excludes the originating sender socket.
 *    Each message carries a `clientId` and `timestamp`. The synchronization
 *    follows a deterministic Last-Write-Wins (LWW) model.
 *    NOTE ON CRDT / OT: This initial version does not implement full CRDT or
 *    Operational Transformation. Edits are synced via deterministic LWW.
 *    The contract is isolated behind this module and usePadSocket hook so a
 *    future CRDT/OT implementation can drop in without UI rewrites.
 * 
 * 4. IMPORTANT VERCEL SCALING LIMITATION:
 *    Under Vercel's Fluid Compute WebSocket model, each WebSocket connection
 *    pins to a function instance. In-memory Socket.IO rooms and presence
 *    counters are local to that running function instance. They do NOT form
 *    a globally synchronized pub/sub across separate serverless instances
 *    without an external adapter (e.g., Redis). This implementation is fully
 *    self-contained and zero-external-dependency for Vercel demo/project use.
 * ============================================================================
 */

const MAX_PAYLOAD_BYTES = 500 * 1024; // 500 KB safety limit per update

/**
 * Initializes or retrieves the singleton Socket.IO server attached to an HTTP server.
 * @param {import('http').Server} httpServer
 * @returns {SocketIOServer}
 */
export function getSocketServer(httpServer) {
  if (!httpServer) {
    throw new Error('An active HTTP server instance is required to initialize Socket.IO.');
  }

  // Reuse existing instance if already attached
  if (httpServer.io) {
    return httpServer.io;
  }

  const io = new SocketIOServer(httpServer, {
    path: '/api/socket.io',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    // Support pure WebSockets (recommended on Vercel Fluid Compute) as well as polling
    transports: ['websocket', 'polling'],
    maxHttpBufferSize: MAX_PAYLOAD_BYTES,
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    // Track current room for this socket
    socket.data.currentRoom = null;
    socket.data.clientId = null;

    /**
     * Client requests to join a pad room
     */
    socket.on('pad:join', (data) => {
      try {
        const rawPath = data?.path;
        const clientId = typeof data?.clientId === 'string' ? data.clientId.slice(0, 100) : null;

        if (!rawPath || typeof rawPath !== 'string' || rawPath.length > 500) {
          socket.emit('pad:error', { error: 'Invalid or oversized pad path.' });
          return;
        }

        // Validate and normalize path through canonical utilities
        const parsed = parsePadPath(rawPath);
        if (!parsed.isValid) {
          socket.emit('pad:error', { error: parsed.error || 'Invalid pad path.' });
          return;
        }

        const roomKey = parsed.room;

        // If previously in a different room, leave it and notify
        if (socket.data.currentRoom && socket.data.currentRoom !== roomKey) {
          const oldRoom = socket.data.currentRoom;
          socket.leave(oldRoom);
          const oldRoomCount = io.sockets.adapter.rooms.get(oldRoom)?.size || 0;
          io.to(oldRoom).emit('presence:update', { room: oldRoom, count: oldRoomCount });
        }

        // Join canonical room
        socket.join(roomKey);
        socket.data.currentRoom = roomKey;
        socket.data.clientId = clientId;

        // Calculate active presence in room
        const roomSize = io.sockets.adapter.rooms.get(roomKey)?.size || 1;

        // Acknowledge join to sender
        socket.emit('pad:joined', {
          room: roomKey,
          canonicalPath: parsed.path,
          presenceCount: roomSize,
        });

        // Broadcast presence update to everyone in this room
        io.to(roomKey).emit('presence:update', {
          room: roomKey,
          count: roomSize,
        });
      } catch (err) {
        console.error('Socket error on pad:join:', err);
        socket.emit('pad:error', { error: 'Internal server error while joining pad.' });
      }
    });

    /**
     * Real-time content edit event from a client
     */
    socket.on('pad:update', (payload) => {
      try {
        if (!payload || typeof payload !== 'object') {
          return;
        }

        const { path, content, clientId, timestamp } = payload;

        if (typeof content !== 'string' || content.length > MAX_PAYLOAD_BYTES) {
          socket.emit('pad:error', { error: 'Payload exceeds size limits.' });
          return;
        }

        if (!path || typeof path !== 'string' || path.length > 500) {
          return;
        }

        const parsed = parsePadPath(path);
        if (!parsed.isValid) {
          return;
        }

        const roomKey = parsed.room;

        // Ensure socket is actually joined to this room
        if (socket.data.currentRoom !== roomKey) {
          return;
        }

        const updateMessage = {
          type: 'pad:update',
          path: parsed.path,
          room: roomKey,
          content,
          clientId: typeof clientId === 'string' ? clientId : socket.data.clientId,
          timestamp: typeof timestamp === 'number' ? timestamp : Date.now(),
        };

        // Broadcast ONLY to other sockets in this room (sender excluded to prevent loops)
        socket.to(roomKey).emit('pad:update', updateMessage);
      } catch (err) {
        console.error('Socket error on pad:update:', err);
      }
    });

    /**
     * Socket disconnect lifecycle
     */
    socket.on('disconnecting', () => {
      const currentRoom = socket.data.currentRoom;
      if (currentRoom) {
        // Compute count after this socket leaves
        const roomSet = io.sockets.adapter.rooms.get(currentRoom);
        const count = roomSet ? Math.max(0, roomSet.size - 1) : 0;
        socket.to(currentRoom).emit('presence:update', {
          room: currentRoom,
          count,
        });
      }
    });
  });

  httpServer.io = io;
  return io;
}
