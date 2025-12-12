import db from '../../db.js';

export default function chatHandler(io, socket) {
  // Send a chat message
  socket.on('send_message', async ({ roomCode, communityId, content }) => {
    try {
      if (!content || content.trim().length === 0) {
        return;
      }

      const roomId = `${communityId}_${roomCode}`;

      // Save message to database (optional persistence)
      const result = await db.query(
        `INSERT INTO room_messages (room_code, community_id, user_id, content)
         VALUES ($1, $2, $3, $4)
         RETURNING message_id, created_at`,
        [roomCode, communityId, socket.userId, content.trim()]
      );

      const message = {
        messageId: result.rows[0].message_id,
        userId: socket.userId,
        userName: socket.userName,
        content: content.trim(),
        createdAt: result.rows[0].created_at
      };

      // Broadcast to all users in the room including sender
      io.to(roomId).emit('new_message', message);

      console.log(`Message sent in room ${roomId} by ${socket.userId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Get message history
  socket.on('get_messages', async ({ roomCode, communityId, limit = 50 }) => {
    try {
      const messages = await db.query(
        `SELECT 
          rm.message_id,
          rm.user_id,
          rm.content,
          rm.created_at,
          u.username,
          u.profile_picture
         FROM room_messages rm
         JOIN users u ON rm.user_id = u.user_id
         WHERE rm.room_code = $1 AND rm.community_id = $2
         ORDER BY rm.created_at DESC
         LIMIT $3`,
        [roomCode, communityId, limit]
      );

      socket.emit('message_history', messages.rows.reverse());
    } catch (error) {
      console.error('Error getting messages:', error);
      socket.emit('error', { message: 'Failed to get messages' });
    }
  });
}
