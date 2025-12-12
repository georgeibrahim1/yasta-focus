import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import roomHandler from './handlers/roomHandler.js';
import chatHandler from './handlers/chatHandler.js';
import sessionHandler from './handlers/sessionHandler.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace('Bearer ', '');
      
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userName = decoded.user_name || decoded.username;
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Register handlers
    roomHandler(io, socket);
    chatHandler(io, socket);
    sessionHandler(io, socket);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
