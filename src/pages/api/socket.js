import { getSocketServer } from '@/lib/socket-server';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Socket.IO Initialization Endpoint for Next.js.
 * Attaches the Socket.IO instance to the underlying HTTP server.
 */
export default function handler(req, res) {
  if (!res.socket?.server) {
    res.status(500).json({ error: 'Underlying server instance not accessible.' });
    return;
  }

  getSocketServer(res.socket.server);
  res.status(200).json({ status: 'ok', socket: true });
}
