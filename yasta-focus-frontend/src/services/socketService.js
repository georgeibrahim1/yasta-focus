import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    // If already connected, return existing socket
    if (this.socket?.connected) {
      console.log('Already connected, reusing socket');
      return this.socket;
    }

    // If socket exists but disconnected, disconnect and recreate
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('Creating new socket connection');
    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // Room methods
  joinRoom(roomCode, communityId) {
    if (this.socket) {
      this.socket.emit('join_room', { roomCode, communityId });
    }
  }

  leaveRoom(roomCode, communityId) {
    if (this.socket) {
      this.socket.emit('leave_room', { roomCode, communityId });
    }
  }

  // Chat methods
  sendMessage(roomCode, communityId, content) {
    if (this.socket) {
      this.socket.emit('send_message', { roomCode, communityId, content });
    }
  }

  getMessages(roomCode, communityId, limit = 50) {
    if (this.socket) {
      this.socket.emit('get_messages', { roomCode, communityId, limit });
    }
  }

  // Session methods
  startSession(roomCode, communityId, subjectName, taskTitle = null) {
    if (this.socket) {
      this.socket.emit('start_session', { roomCode: parseInt(roomCode), communityId, subjectName, taskTitle });
    }
  }

  updateSession(sessionName, elapsedTime) {
    if (this.socket) {
      this.socket.emit('update_session', { sessionName, elapsedTime });
    }
  }

  pauseSession(sessionName) {
    if (this.socket) {
      this.socket.emit('pause_session', { sessionName });
    }
  }

  resumeSession(sessionName) {
    if (this.socket) {
      this.socket.emit('resume_session', { sessionName });
    }
  }

  endSession(sessionName, elapsedTime) {
    if (this.socket) {
      this.socket.emit('end_session', { sessionName, elapsedTime });
    }
  }

  // Event listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();
