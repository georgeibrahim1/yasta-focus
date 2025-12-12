import db from '../../db.js';

export default function sessionHandler(io, socket) {
  // Start a study session
  socket.on('start_session', async ({ roomCode, communityId, subjectName, taskTitle }) => {
    try {
      const roomId = `${communityId}_${roomCode}`;
      const sessionName = `study_room_${socket.userId}_${Date.now()}`;

      // Validate subject if provided
      if (subjectName) {
        const subjectCheck = await db.query(
          'SELECT subject_name FROM subject WHERE user_id = $1 AND subject_name = $2',
          [socket.userId, subjectName]
        );

        if (subjectCheck.rows.length === 0) {
          socket.emit('error', { message: 'Subject not found' });
          return;
        }
      }

      // Validate and update task if provided
      if (taskTitle && subjectName) {
        const taskCheck = await db.query(
          'SELECT task_title, status FROM task WHERE user_id = $1 AND subject_name = $2 AND task_title = $3',
          [socket.userId, subjectName, taskTitle]
        );

        if (taskCheck.rows.length === 0) {
          socket.emit('error', { message: 'Task not found' });
          return;
        }

        // Update task status to 'In Progress' if it's 'Not Started'
        if (taskCheck.rows[0].status === 'Not Started') {
          await db.query(
            'UPDATE task SET status = $1 WHERE user_id = $2 AND subject_name = $3 AND task_title = $4',
            ['In Progress', socket.userId, subjectName, taskTitle]
          );
        }
      }

      // Create session with proper timestamps
      const now = new Date().toISOString();
      await db.query(
        `INSERT INTO session (session_name, user_id, type, subject_name, task_title, status, elapsed_time, created_at, time_stamp)
         VALUES ($1, $2, 'study_room', $3, $4, 'active', 0, $5, $5)`,
        [sessionName, socket.userId, subjectName || null, taskTitle || null, now]
      );

      // Link session to room
      await db.query(
        `INSERT INTO SRSessions_Members (student_ID, session_Name, room_Code, community_ID)
         VALUES ($1, $2, $3, $4)`,
        [socket.userId, sessionName, roomCode, communityId]
      );

      const sessionData = {
        sessionName,
        userId: socket.userId,
        userName: socket.userName,
        subjectName,
        taskTitle,
        elapsedTime: 0,
        status: 'active',
        createdAt: new Date()
      };

      // Store session info in socket
      socket.activeSession = sessionName;

      // Broadcast to all users in the room
      io.to(roomId).emit('session_started', sessionData);

      console.log(`Session ${sessionName} started by ${socket.userId} in room ${roomId}`);
    } catch (error) {
      console.error('Error starting session:', error);
      socket.emit('error', { message: 'Failed to start session' });
    }
  });

  // Update session (timer progress)
  socket.on('update_session', async ({ sessionName, elapsedTime }) => {
    try {
      if (!socket.currentRoom || !sessionName) {
        return;
      }

      // Update session in database
      await db.query(
        `UPDATE session 
         SET elapsed_time = $1, time_stamp = NOW()
         WHERE session_name = $2 AND user_id = $3`,
        [elapsedTime, sessionName, socket.userId]
      );

      // Broadcast update to room
      io.to(socket.currentRoom).emit('session_updated', {
        sessionName,
        userId: socket.userId,
        elapsedTime
      });
    } catch (error) {
      console.error('Error updating session:', error);
    }
  });

  // Pause session
  socket.on('pause_session', async ({ sessionName }) => {
    try {
      if (!socket.currentRoom || !sessionName) {
        return;
      }

      await db.query(
        `UPDATE session 
         SET status = 'paused'
         WHERE session_name = $1 AND user_id = $2`,
        [sessionName, socket.userId]
      );

      io.to(socket.currentRoom).emit('session_paused', {
        sessionName,
        userId: socket.userId
      });
    } catch (error) {
      console.error('Error pausing session:', error);
    }
  });

  // Resume session
  socket.on('resume_session', async ({ sessionName }) => {
    try {
      if (!socket.currentRoom || !sessionName) {
        return;
      }

      await db.query(
        `UPDATE session 
         SET status = 'active'
         WHERE session_name = $1 AND user_id = $2`,
        [sessionName, socket.userId]
      );

      io.to(socket.currentRoom).emit('session_resumed', {
        sessionName,
        userId: socket.userId
      });
    } catch (error) {
      console.error('Error resuming session:', error);
    }
  });

  // End session
  socket.on('end_session', async ({ sessionName, elapsedTime }) => {
    try {
      if (!socket.currentRoom || !sessionName) {
        return;
      }

      // Update session as completed
      await db.query(
        `UPDATE session 
         SET status = 'completed', elapsed_time = $1, ended_at = NOW()
         WHERE session_name = $2 AND user_id = $3`,
        [elapsedTime, sessionName, socket.userId]
      );

      // Remove from active sessions
      socket.activeSession = null;

      // Broadcast to room
      io.to(socket.currentRoom).emit('session_ended', {
        sessionName,
        userId: socket.userId,
        userName: socket.userName,
        elapsedTime
      });

      console.log(`Session ${sessionName} ended by ${socket.userId}`);
    } catch (error) {
      console.error('Error ending session:', error);
      socket.emit('error', { message: 'Failed to end session' });
    }
  });

  // Handle disconnection - end active session
  socket.on('disconnecting', async () => {
    if (socket.activeSession && socket.currentRoom) {
      try {
        await db.query(
          `UPDATE session 
           SET status = 'completed', ended_at = NOW()
           WHERE session_name = $1 AND user_id = $2`,
          [socket.activeSession, socket.userId]
        );

        socket.to(socket.currentRoom).emit('session_ended', {
          sessionName: socket.activeSession,
          userId: socket.userId,
          userName: socket.userName,
          disconnected: true
        });
      } catch (error) {
        console.error('Error ending session on disconnect:', error);
      }
    }
  });
}
