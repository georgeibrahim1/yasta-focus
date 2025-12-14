import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get leaderboard with top 100 users by study time (with time period filter)
export const getLeaderboard = catchAsync(async (req, res, next) => {
  const currentUserId = req.user?.user_id;
  const { period = 'all' } = req.query; // all, daily, weekly, monthly

  // Determine time filter based on period
  let timeFilter = '';
  if (period === 'daily') {
    timeFilter = `AND s.created_at >= CURRENT_DATE`;
  } else if (period === 'weekly') {
    timeFilter = `AND s.created_at >= DATE_TRUNC('week', CURRENT_DATE)`;
  } else if (period === 'monthly') {
    timeFilter = `AND s.created_at >= DATE_TRUNC('month', CURRENT_DATE)`;
  }

  const query = `
    WITH user_study_time AS (
      SELECT 
        s.user_id,
        SUM(EXTRACT(EPOCH FROM (s.time_stamp - s.created_at))) as total_study_seconds
      FROM session s
      WHERE 1=1 ${timeFilter}
      GROUP BY s.user_id
    ),
    user_top_subject AS (
      SELECT DISTINCT ON (s.user_id)
        s.user_id,
        s.subject_name as most_studied_subject,
        SUM(EXTRACT(EPOCH FROM (s.time_stamp - s.created_at))) as subject_time
      FROM session s
      WHERE s.subject_name IS NOT NULL ${timeFilter}
      GROUP BY s.user_id, s.subject_name
      ORDER BY s.user_id, subject_time DESC
    ),
    user_interests AS (
      SELECT 
        studentid as user_id,
        ARRAY_AGG(DISTINCT interest ORDER BY interest) as interests
      FROM studentinterests
      GROUP BY studentid
    )
    SELECT 
      u.user_id,
      u.username,
      u.profile_picture,
      u.xp,
      COALESCE(ust.total_study_seconds, 0) as total_study_time,
      uts.most_studied_subject,
      COALESCE(ui.interests, ARRAY[]::VARCHAR[]) as interests,
      CASE 
        WHEN f.status = 'Accepted' THEN 'friends'
        WHEN f.status = 'Pending' AND f.requesterid = $1 THEN 'pending_sent'
        WHEN f.status = 'Pending' AND f.requesteeid = $1 THEN 'pending_received'
        ELSE 'none'
      END as friendship_status,
      ROW_NUMBER() OVER (ORDER BY COALESCE(ust.total_study_seconds, 0) DESC) as rank
    FROM users u
    LEFT JOIN user_study_time ust ON u.user_id = ust.user_id
    LEFT JOIN user_top_subject uts ON u.user_id = uts.user_id
    LEFT JOIN user_interests ui ON u.user_id = ui.user_id
    LEFT JOIN friendship f ON (
      (f.requesterid = $1 AND f.requesteeid = u.user_id) OR
      (f.requesteeid = $1 AND f.requesterid = u.user_id)
    )
    WHERE u.role != 0
    ORDER BY total_study_time DESC
    LIMIT 100
  `;

  const result = await db.query(query, [currentUserId || null]);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      leaderboard: result.rows
    }
  });
});

// Check if user has already given XP to a specific user today
export const getCheckInStatus = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { toUserId } = req.query;
  const today = new Date().toISOString().split('T')[0];

  if (!toUserId) {
    return next(new AppError('Target user ID is required', 400));
  }

  const result = await db.query(
    'SELECT * FROM daily_checkin WHERE user_id = $1 AND checkin_date = $2 AND to_user_id = $3',
    [userId, today, toUserId]
  );

  res.status(200).json({
    status: 'success',
    data: {
      hasCheckedIn: result.rows.length > 0
    }
  });
});

// Give XP to a user on the leaderboard
export const giveXP = catchAsync(async (req, res, next) => {
  const giverId = req.user.user_id;
  const { userId, rank } = req.body;
  const today = new Date().toISOString().split('T')[0];

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  if (giverId === userId) {
    return next(new AppError('You cannot give XP to yourself', 400));
  }

  // Check if user has already given XP to this specific user today
  const existingCheckIn = await db.query(
    'SELECT * FROM daily_checkin WHERE user_id = $1 AND checkin_date = $2 AND to_user_id = $3',
    [giverId, today, userId]
  );

  if (existingCheckIn.rows.length > 0) {
    return next(new AppError('You have already given XP to this user today', 400));
  }

  // Determine XP amount based on rank
  let xpAmount = 1;
  if (rank === 1) xpAmount = 20;
  else if (rank === 2) xpAmount = 10;
  else if (rank === 3) xpAmount = 5;

  // Start transaction
  await db.query('BEGIN');

  try {
    // Insert daily check-in record
    await db.query(
      'INSERT INTO daily_checkin (user_id, checkin_date, to_user_id, xp_awarded) VALUES ($1, $2, $3, $4)',
      [giverId, today, userId, xpAmount]
    );

    // Give XP to receiver (giver's XP remains unchanged)
    const updateQuery = `
      UPDATE users 
      SET xp = xp + $1 
      WHERE user_id = $2 
      RETURNING xp
    `;
    const updateResult = await db.query(updateQuery, [xpAmount, userId]);

    // Commit transaction
    await db.query('COMMIT');

    // Get updated giver data
    const giverUpdated = await db.query(
      'SELECT xp FROM users WHERE user_id = $1',
      [giverId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        receiverNewXP: updateResult.rows[0].xp,
        giverNewXP: giverUpdated.rows[0].xp,
        amountGiven: xpAmount
      }
    });
  } catch (error) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    throw error;
  }
});

// Send friend request
export const sendFriendRequest = catchAsync(async (req, res, next) => {
  const requesterId = req.user.user_id;
  const { userId } = req.body;

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  if (requesterId === userId) {
    return next(new AppError('You cannot send a friend request to yourself', 400));
  }

  // Check if friendship already exists
  const checkQuery = `
    SELECT * FROM friendship 
    WHERE (requesterid = $1 AND requesteeid = $2) OR (requesterid = $2 AND requesteeid = $1)
  `;
  const checkResult = await db.query(checkQuery, [requesterId, userId]);

  if (checkResult.rows.length > 0) {
    return next(new AppError('Friend request already exists or you are already friends', 400));
  }

  const query = `
    INSERT INTO friendship (requesterid, requesteeid, status, created_at)
    VALUES ($1, $2, 'Pending', NOW())
    RETURNING *
  `;
  const result = await db.query(query, [requesterId, userId]);

  res.status(201).json({
    status: 'success',
    data: {
      friendship: result.rows[0]
    }
  });
});

// Report user
export const reportUser = catchAsync(async (req, res, next) => {
  const reporterId = req.user.user_id;
  const { userId, title, description } = req.body;

  if (!userId || !title || !description) {
    return next(new AppError('User ID, title, and description are required', 400));
  }

  if (reporterId === userId) {
    return next(new AppError('You cannot report yourself', 400));
  }

  // Check if already reported
  const checkQuery = `
    SELECT * FROM reports 
    WHERE reporterid = $1 AND reporteeid = $2
  `;
  const checkResult = await db.query(checkQuery, [reporterId, userId]);

  if (checkResult.rows.length > 0) {
    return next(new AppError('You have already reported this user', 400));
  }

  const query = `
    INSERT INTO reports (reporterid, reporteeid, title, description, status, created_at)
    VALUES ($1, $2, $3, $4, 'Under review by the team', NOW())
    RETURNING *
  `;
  const result = await db.query(query, [reporterId, userId, title, description]);

  res.status(201).json({
    status: 'success',
    message: 'Report submitted successfully',
    data: {
      report: result.rows[0]
    }
  });
});
