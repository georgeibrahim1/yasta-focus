import pool from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get platform-wide statistics
export const getPlatformStats = catchAsync(async (req, res, next) => {
  // Ensure user is admin (role 0)
  if (req.user.role !== 0) {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  // Total users count
  const totalUsersResult = await pool.query(
    'SELECT COUNT(*) as count FROM users'
  );
  const totalUsers = parseInt(totalUsersResult.rows[0].count);

  // Total communities count
  const totalCommunitiesResult = await pool.query(
    'SELECT COUNT(*) as count FROM community'
  );
  const totalCommunities = parseInt(totalCommunitiesResult.rows[0].count);

  // Total study sessions count
  const totalSessionsResult = await pool.query(
    'SELECT COUNT(*) as count FROM session'
  );
  const totalSessions = parseInt(totalSessionsResult.rows[0].count);

  // Total study time (in hours)
  const totalStudyTimeResult = await pool.query(
    `SELECT COALESCE(SUM(elapsed_time), 0) as total_seconds FROM session`
  );
  const totalStudyHours = Math.floor(totalStudyTimeResult.rows[0].total_seconds / 3600);

  // Active users (users with at least one session in last 7 days)
  const activeUsersResult = await pool.query(
    `SELECT COUNT(DISTINCT user_id) as count 
     FROM session 
     WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`
  );
  const activeUsers = parseInt(activeUsersResult.rows[0].count);

  // Total tasks count
  const totalTasksResult = await pool.query(
    'SELECT COUNT(*) as count FROM task'
  );
  const totalTasks = parseInt(totalTasksResult.rows[0].count);

  // Total flashcards count
  const totalFlashcardsResult = await pool.query(
    'SELECT COUNT(*) as count FROM flash_card'
  );
  const totalFlashcards = parseInt(totalFlashcardsResult.rows[0].count);

  // Total notes count
  const totalNotesResult = await pool.query(
    'SELECT COUNT(*) as count FROM note'
  );
  const totalNotes = parseInt(totalNotesResult.rows[0].count);

  res.status(200).json({
    status: 'success',
    data: {
      totalUsers,
      totalCommunities,
      totalSessions,
      totalStudyHours,
      activeUsers,
      totalTasks,
      totalFlashcards,
      totalNotes
    }
  });
});

// Get top users by XP
export const getTopUsers = catchAsync(async (req, res, next) => {
  // Ensure user is admin (role 0)
  if (req.user.role !== 0) {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  const limit = parseInt(req.query.limit) || 10;

  const topUsersResult = await pool.query(
    `SELECT user_id, username, email, profile_picture, xp, role, created_at
     FROM users
     ORDER BY xp DESC
     LIMIT $1`,
    [limit]
  );

  res.status(200).json({
    status: 'success',
    data: {
      users: topUsersResult.rows
    }
  });
});

// Get recent users
export const getRecentUsers = catchAsync(async (req, res, next) => {
  // Ensure user is admin (role 0)
  if (req.user.role !== 0) {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  const limit = parseInt(req.query.limit) || 10;

  const recentUsersResult = await pool.query(
    `SELECT user_id, username, email, profile_picture, xp, role, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );

  res.status(200).json({
    status: 'success',
    data: {
      users: recentUsersResult.rows
    }
  });
});

// Get most active communities
export const getActiveCommunities = catchAsync(async (req, res, next) => {
  // Ensure user is admin (role 0)
  if (req.user.role !== 0) {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  const limit = parseInt(req.query.limit) || 10;

  const activeCommunitiesResult = await pool.query(
    `SELECT 
      c.community_id,
      c.community_name,
      c.community_description,
      u.username as creator_name,
      COUNT(DISTINCT cp.user_id) as member_count,
      COUNT(DISTINCT sr.room_code) as room_count
     FROM community c
     LEFT JOIN users u ON c.community_creator = u.user_id
     LEFT JOIN community_participants cp ON c.community_id = cp.community_id AND cp.member_status = 'Accepted'
     LEFT JOIN studyroom sr ON c.community_id = sr.community_id
     GROUP BY c.community_id, c.community_name, c.community_description, u.username
     ORDER BY member_count DESC
     LIMIT $1`,
    [limit]
  );

  res.status(200).json({
    status: 'success',
    data: {
      communities: activeCommunitiesResult.rows
    }
  });
});

// Get user growth statistics (users registered per day for last 30 days)
export const getUserGrowth = catchAsync(async (req, res, next) => {
  // Ensure user is admin (role 0)
  if (req.user.role !== 0) {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  const growthResult = await pool.query(
    `SELECT 
      DATE(created_at) as date,
      COUNT(*) as count
     FROM users
     WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
     GROUP BY DATE(created_at)
     ORDER BY date ASC`
  );

  res.status(200).json({
    status: 'success',
    data: {
      growth: growthResult.rows
    }
  });
});

// Get study activity statistics (sessions per day for last 30 days)
export const getStudyActivity = catchAsync(async (req, res, next) => {
  // Ensure user is admin (role 0)
  if (req.user.role !== 0) {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  const activityResult = await pool.query(
    `SELECT 
      DATE(created_at) as date,
      COUNT(*) as session_count,
      COALESCE(SUM(elapsed_time), 0) / 3600 as total_hours
     FROM session
     WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
     GROUP BY DATE(created_at)
     ORDER BY date ASC`
  );

  res.status(200).json({
    status: 'success',
    data: {
      activity: activityResult.rows
    }
  });
});

// Get all users with filters and pagination
export const getAllUsers = catchAsync(async (req, res, next) => {
  // Ensure user is admin (role 0)
  if (req.user.role !== 0) {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  let query = `
    SELECT user_id, username, email, profile_picture, bio, xp, role, created_at
    FROM users
  `;
  let countQuery = 'SELECT COUNT(*) as count FROM users';
  const values = [];

  if (search) {
    query += ' WHERE username ILIKE $1 OR email ILIKE $1';
    countQuery += ' WHERE username ILIKE $1 OR email ILIKE $1';
    values.push(`%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
  values.push(limit, offset);

  const usersResult = await pool.query(query, values);
  
  const countValues = search ? [`%${search}%`] : [];
  const totalResult = await pool.query(countQuery, countValues);
  const total = parseInt(totalResult.rows[0].count);

  res.status(200).json({
    status: 'success',
    data: {
      users: usersResult.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// Get reports
export const getReports = catchAsync(async (req, res, next) => {
  // Ensure user is admin (role 0)
  if (req.user.role !== 0) {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  const reportsResult = await pool.query(
    `SELECT 
      r.reporterid,
      r.reporteeid,
      r.title,
      r.description,
      r.status,
      r.created_at,
      u1.username as reporter_name,
      u2.username as reported_name
     FROM reports r
     JOIN users u1 ON r.reporterid = u1.user_id
     JOIN users u2 ON r.reporteeid = u2.user_id
     ORDER BY r.created_at DESC`
  );

  res.status(200).json({
    status: 'success',
    data: {
      reports: reportsResult.rows
    }
  });
});

// Update user role
export const updateUserRole = catchAsync(async (req, res, next) => {
  // Ensure user is admin (role 0)
  if (req.user.role !== 0) {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  const { userId } = req.params;
  const { role } = req.body;

  // Validate role (0=admin, 1=student)
  if (![0, 1].includes(role)) {
    return next(new AppError('Invalid role. Must be 0 (admin) or 1 (student)', 400));
  }

  // Prevent admin from changing their own role
  if (userId === req.user.user_id) {
    return next(new AppError('Cannot change your own role', 400));
  }

  // Update user role
  const updateResult = await pool.query(
    `UPDATE users 
     SET role = $1, updated_at = NOW() 
     WHERE user_id = $2 
     RETURNING user_id, username, email, role, updated_at`,
    [role, userId]
  );

  if (updateResult.rows.length === 0) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updateResult.rows[0]
    }
  });
});
