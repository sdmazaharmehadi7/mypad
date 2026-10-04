'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

/**
 * Generates a lightweight, unique client identifier for this tab/session.
 * Used exclusively for loop prevention and conflict coordination.
 */
function createClientId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'client_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

/**
 * ============================================================================
 * Hook: usePadSocket
 * ============================================================================
 * 
 * Provides an isolated real-time collaboration layer for a given pad path.
 * 
 * DESIGN PRINCIPLES:
 * - Deterministic Last-Write-Wins (LWW) synchronization model.
 * - Loop prevention: Client ignores echoed updates matching its own clientId.
 * - Non-destructive: Socket updates never wipe out active, uncommitted local edits.
 * - Isolated abstraction: Can be swapped for CRDT (Yjs) or OT in the future
 *   without modifying PadEditor or the UI.
 * 
 * @param {Object} params
 * @param {string} params.canonicalPath - The normalized pad path (e.g. "/college/ml")
 * @param {Function} params.onRemoteUpdate - Callback invoked when a remote client updates content
 * @returns {{
 *   connectionState: 'Connecting...' | 'Connected' | 'Reconnecting...' | 'Offline',
 *   presenceCount: number,
 *   sendUpdate: (content: string) => void,
 *   clientId: string
 * }}
 */
export function usePadSocket({ canonicalPath, onRemoteUpdate }) {
  const [connectionState, setConnectionState] = useState('Connecting...');
  const [presenceCount, setPresenceCount] = useState(1);

  // Stable Client ID for loop prevention (lazy ref initialized outside render)
  const clientIdRef = useRef(null);
  const getClientId = useCallback(() => {
    if (clientIdRef.current === null) {
      clientIdRef.current = createClientId();
    }
    return clientIdRef.current;
  }, []);

  // Socket instance ref
  const socketRef = useRef(null);

  // Callback ref to always call the freshest handler without re-running socket setup
  const onRemoteUpdateRef = useRef(onRemoteUpdate);
  useEffect(() => {
    onRemoteUpdateRef.current = onRemoteUpdate;
  }, [onRemoteUpdate]);

  // Track the most recent timestamp received to enforce deterministic LWW order
  const lastUpdateTimestampRef = useRef(0);

  /**
   * Broadcasts a local text change to other clients in the room
   */
  const sendUpdate = useCallback((newContent) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      return;
    }

    const now = Date.now();
    lastUpdateTimestampRef.current = Math.max(lastUpdateTimestampRef.current, now);

    socket.emit('pad:update', {
      type: 'pad:update',
      path: canonicalPath,
      content: newContent,
      clientId: getClientId(),
      timestamp: now,
    });
  }, [canonicalPath, getClientId]);

  useEffect(() => {
    let isMounted = true;

    // Optional environment variable for external Socket.IO server; in browser defaults to current origin (production-safe)
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '');

    async function initializeSocket() {
      // Warm up Next.js Pages API endpoint to ensure Socket.IO is initialized on the server
      try {
        await fetch('/api/socket').catch(() => {});
      } catch {
        // Continue even if warm-up fetch fails; socket.io will attempt direct upgrade
      }

      if (!isMounted) return;

      const socket = io(socketUrl, {
        path: '/api/socket.io',
        // Prioritize pure WebSockets on Vercel Fluid Compute, fall back to polling if needed
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      socketRef.current = socket;

      const myClientId = getClientId();

      socket.on('connect', () => {
        if (!isMounted) return;
        setConnectionState('Connected');

        // Join the canonical pad room
        socket.emit('pad:join', {
          path: canonicalPath,
          clientId: myClientId,
        });
      });

      socket.on('pad:joined', (data) => {
        if (!isMounted) return;
        if (typeof data?.presenceCount === 'number') {
          setPresenceCount(data.presenceCount);
        }
      });

      socket.on('presence:update', (data) => {
        if (!isMounted) return;
        if (typeof data?.count === 'number') {
          setPresenceCount(data.count);
        }
      });

      // Handle real-time content updates from peers
      socket.on('pad:update', (payload) => {
        if (!isMounted || !payload) return;

        // Loop prevention: Ignore updates originating from ourselves
        if (payload.clientId && payload.clientId === myClientId) {
          return;
        }

        // LWW Timestamp ordering: ignore strictly older timestamps if simultaneous
        const incomingTime = payload.timestamp || 0;
        if (incomingTime && incomingTime < lastUpdateTimestampRef.current) {
          return;
        }

        lastUpdateTimestampRef.current = Math.max(lastUpdateTimestampRef.current, incomingTime);

        if (typeof payload.content === 'string' && onRemoteUpdateRef.current) {
          onRemoteUpdateRef.current(payload.content, payload);
        }
      });

      socket.on('disconnect', (reason) => {
        if (!isMounted) return;
        if (reason === 'io server disconnect') {
          // Explicit disconnect by server, reconnect manually
          socket.connect();
        }
        setConnectionState('Reconnecting...');
      });

      socket.on('connect_error', () => {
        if (!isMounted) return;
        setConnectionState('Reconnecting...');
      });

      socket.on('reconnect', () => {
        if (!isMounted) return;
        setConnectionState('Connected');
        // Re-join the canonical pad room on reconnect
        socket.emit('pad:join', {
          path: canonicalPath,
          clientId: myClientId,
        });
      });

      // Browser offline/online listeners for responsive connection badge
      const handleOnline = () => {
        if (!socket.connected) {
          setConnectionState('Connecting...');
          socket.connect();
        }
      };

      const handleOffline = () => {
        setConnectionState('Offline');
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    initializeSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [canonicalPath, getClientId]);

  return {
    connectionState,
    presenceCount,
    sendUpdate,
  };
}
