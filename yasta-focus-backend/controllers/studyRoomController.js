import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get all study rooms for a community with optional search
export const getCommunityRooms = catchAsync(async (req, res, next) => {
  const { communityId } = req.params;
  const { search } = req.query;

  let queryText = `
    SELECT 
      sr.*,
      json_build_object(
        'user_id', u.user_id,
        'username', u.username,
        'profile_pic', u.profile_picture
      ) as creator,
      COALESCE(
        json_agg(
          json_build_object(
            'user_id', mu.user_id,
            'username', mu.username,
            'profile_pic', mu.profile_picture
          )
        ) FILTER (WHERE mu.user_id IS NOT NULL), 
        '[]'
      ) as members
    FROM studyRoom sr
    LEFT JOIN users u ON sr.student_Creator = u.user_id
    LEFT JOIN studyRoom_Members srm ON sr.room_Code = srm.room_Code AND sr.community_ID = srm.community_ID
    LEFT JOIN users mu ON srm.student_ID = mu.user_id
    WHERE sr.community_ID = $1
  `;

  const params = [communityId];

  if (search) {
    queryText += ` AND sr.room_Name ILIKE $2`;
    params.push(`%${search}%`);
  }

  queryText += ` GROUP BY sr.room_Code, sr.community_ID, sr.room_Name, sr.student_Creator, u.user_id, u.username, u.profile_picture`;

  const result = await db.query(queryText, params);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      rooms: result.rows
    }
  });
});

// Create a new study room
export const createRoom = catchAsync(async (req, res, next) => {
  const { communityId } = req.params;
  const { room_name } = req.body;
  const userId = req.user.user_id;

  // Check if user is a member of the community
  const memberCheck = await db.query(
    'SELECT * FROM community_Participants WHERE community_ID = $1 AND user_ID = $2 AND Member_Status = \'Accepted\'',
    [communityId, userId]
  );

  if (memberCheck.rows.length === 0) {
    return next(new AppError('You must be a member of this community to create a room', 403));
  }

  // Check if user has at least 100 XP
  const userResult = await db.query(
    'SELECT xp FROM users WHERE user_id = $1',
    [userId]
  );

  if (userResult.rows.length === 0 || userResult.rows[0].xp < 100) {
    return next(new AppError('You need at least 100 XP to create a study room', 403));
  }

  // Generate unique room code (integer)
  const room_code = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 10000);

  // Create the study room
  const roomResult = await db.query(
    `INSERT INTO studyRoom (room_Code, community_ID, room_Name, student_Creator)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [room_code, communityId, room_name, userId]
  );

  const room = roomResult.rows[0];

  // Get creator info
  const creatorResult = await db.query(
    'SELECT user_id, username, profile_picture FROM users WHERE user_id = $1',
    [userId]
  );

  room.creator = creatorResult.rows[0];

  // Automatically add creator as a member (include community_id)
  await db.query(
    'INSERT INTO studyRoom_Members (room_Code, community_ID, student_ID) VALUES ($1, $2, $3)',
    [room_code, communityId, userId]
  );

  res.status(201).json({
    status: 'success',
    data: {
      room
    }
  });
});

// Delete a study room (only creator can delete)
export const deleteRoom = catchAsync(async (req, res, next) => {
  const { roomCode } = req.params;
  const userId = req.user.user_id;

  // Check if room exists and user is the creator
  const roomResult = await db.query(
    'SELECT * FROM studyRoom WHERE room_Code = $1',
    [roomCode]
  );

  if (roomResult.rows.length === 0) {
    return next(new AppError('Study room not found', 404));
  }

  const room = roomResult.rows[0];

  if (room.student_creator !== userId) {
    return next(new AppError('Only the room creator can delete this room', 403));
  }

  // Delete all dependent records first (foreign key constraints)
  // Delete room messages
  await db.query('DELETE FROM room_messages WHERE room_code = $1 AND community_id = $2', [roomCode, room.community_id]);
  
  // Delete session members
  await db.query('DELETE FROM srsessions_members WHERE room_code = $1 AND community_id = $2', [roomCode, room.community_id]);
  
  // Delete room members
  await db.query('DELETE FROM studyRoom_Members WHERE room_Code = $1 AND community_ID = $2', [roomCode, room.community_id]);

  // Delete the room
  await db.query('DELETE FROM studyRoom WHERE room_Code = $1 AND community_ID = $2', [roomCode, room.community_id]);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Join a study room
export const joinRoom = catchAsync(async (req, res, next) => {
  const { roomCode } = req.params;
  const userId = req.user.user_id;

  // Check if room exists
  const roomResult = await db.query(
    'SELECT * FROM studyRoom WHERE room_Code = $1',
    [roomCode]
  );

  if (roomResult.rows.length === 0) {
    return next(new AppError('Study room not found', 404));
  }

  const room = roomResult.rows[0];

  // Check if user is a member of the community and if they are a manager
  const memberCheck = await db.query(
    `SELECT cp.*, cm.moderator_id
     FROM community_Participants cp
     LEFT JOIN communityManagers cm ON cp.community_ID = cm.community_ID AND cp.user_ID = cm.moderator_id
     WHERE cp.community_ID = $1 AND cp.user_ID = $2 AND cp.Member_Status = 'Accepted'`,
    [room.community_id, userId]
  );

  if (memberCheck.rows.length === 0) {
    return next(new AppError('You must be a member of this community to join this room', 403));
  }

  const isManager = memberCheck.rows[0].moderator_id !== null;

  // Check if already a member of THIS room
  const existingMember = await db.query(
    'SELECT * FROM studyRoom_Members WHERE room_Code = $1 AND community_ID = $2 AND student_ID = $3',
    [roomCode, room.community_id, userId]
  );

  if (existingMember.rows.length > 0) {
    return next(new AppError('You are already a member of this room', 400));
  }

  // Check if user is a member of ANY other room (skip for managers)
  if (!isManager) {
    const otherRoomCheck = await db.query(
      `SELECT srm.room_Code, srm.community_ID, sr.room_name
       FROM studyRoom_Members srm
       JOIN studyRoom sr ON srm.room_Code = sr.room_Code AND srm.community_ID = sr.community_ID
       WHERE srm.student_ID = $1 
         AND (srm.room_Code != $2 OR srm.community_ID != $3)
       LIMIT 1`,
      [userId, roomCode, room.community_id]
    );

    if (otherRoomCheck.rows.length > 0) {
      const otherRoom = otherRoomCheck.rows[0];
      return next(new AppError(`You are already a member of room "${otherRoom.room_name}" (Code: ${otherRoom.room_code}). Please leave that room before joining another one.`, 400));
    }
  }

  // Add user to room
  await db.query(
    'INSERT INTO studyRoom_Members (room_Code, community_ID, student_ID) VALUES ($1, $2, $3)',
    [roomCode, room.community_id, userId]
  );

  res.status(200).json({
    status: 'success',
    message: 'Successfully joined the study room'
  });
});

// Leave a study room
export const leaveRoom = catchAsync(async (req, res, next) => {
  const { roomCode } = req.params;
  const userId = req.user.user_id;

  // Check if room exists
  const roomResult = await db.query(
    'SELECT * FROM studyRoom WHERE room_Code = $1',
    [roomCode]
  );

  if (roomResult.rows.length === 0) {
    return next(new AppError('Study room not found', 404));
  }

  const room = roomResult.rows[0];

  // Room creator cannot leave their own room
  if (room.student_creator === userId) {
    return next(new AppError('Room creators cannot leave their own room. Please delete the room instead.', 400));
  }

  // Remove user from room
  await db.query(
    'DELETE FROM studyRoom_Members WHERE room_Code = $1 AND community_ID = $2 AND student_ID = $3',
    [roomCode, room.community_id, userId]
  );

  res.status(200).json({
    status: 'success',
    message: 'Successfully left the study room'
  });
});
