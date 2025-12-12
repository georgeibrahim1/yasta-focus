import db from '../../db.js';

export default function roomHandler(io, socket) {
  // Join a study room
  socket.on('join_room', async ({ roomCode, communityId }) => {
    try {
      const roomId = `${communityId}_${roomCode}`;
      
      // Check if user is a member of the room
      const memberCheck = await db.query(
        `SELECT * FROM studyRoom_Members 
         WHERE room_Code = $1 AND community_ID = $2 AND student_ID = $3`,
        [roomCode, communityId, socket.userId]
      );

      if (memberCheck.rows.length === 0) {
        socket.emit('error', { message: 'Not a member of this room' });
        return;
      }

      // Join the socket room
      socket.join(roomId);
      socket.currentRoom = roomId;
      socket.roomCode = roomCode;
      socket.communityId = communityId;

      // Get all current members
      const members = await db.query(
        `SELECT srm.student_ID, u.username, u.profile_picture, u.xp
         FROM studyRoom_Members srm
         JOIN users u ON srm.student_ID = u.user_id
         WHERE srm.room_Code = $1 AND srm.community_ID = $2`,
        [roomCode, communityId]
      );

      // Get active sessions
      const activeSessions = await db.query(
        `SELECT 
          s.session_name,
          s.user_id,
          s.subject_name,
          s.task_title,
          s.created_at,
          s.elapsed_time,
          s.status,
          u.username,
          u.profile_picture
         FROM SRSessions_Members srm
         JOIN session s ON srm.student_ID = s.user_id AND srm.session_Name = s.session_name
         JOIN users u ON s.user_id = u.user_id
         WHERE srm.room_Code = $1 AND srm.community_ID = $2 AND s.status = 'active'`,
        [roomCode, communityId]
      );

      // Send current state to the joining user
      socket.emit('room_state', {
        members: members.rows,
        activeSessions: activeSessions.rows
      });

      // Notify others in the room
      socket.to(roomId).emit('user_joined', {
        userId: socket.userId,
        userName: socket.userName
      });

      console.log(`User ${socket.userId} joined room ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Leave a study room
  socket.on('leave_room', ({ roomCode, communityId }) => {
    try {
      const roomId = `${communityId}_${roomCode}`;
      
      socket.leave(roomId);
      socket.to(roomId).emit('user_left', {
        userId: socket.userId,
        userName: socket.userName
      });

      socket.currentRoom = null;
      socket.roomCode = null;
      socket.communityId = null;

      console.log(`User ${socket.userId} left room ${roomId}`);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnecting', () => {
    if (socket.currentRoom) {
      socket.to(socket.currentRoom).emit('user_left', {
        userId: socket.userId,
        userName: socket.userName
      });
    }
  });
}
