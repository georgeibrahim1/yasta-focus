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

// Update report status
export const updateReportStatus = catchAsync(async (req, res, next) => {
  // Ensure user is admin (role 0)
  if (req.user.role !== 0) {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  const { reporterId, reportedId } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['Under review by the team', 'Resolved', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  const result = await pool.query(
    `UPDATE reports 
     SET status = $1 
     WHERE reporterid = $2 AND reporteeid = $3
     RETURNING *`,
    [status, reporterId, reportedId]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Report not found', 404));
  }

  // Log the report status update
  try {
    await import('../utils/logHelper.js').then(({ insertLog }) => insertLog({
      user_id: req.user.user_id,
      action_type: 'ADMIN_UPDATE_REPORT_STATUS',
      action_content: `Updated report status: reporter ${reporterId}, reported ${reportedId}, new status: ${status}`,
      actor_type: 'admin',
    }));
  } catch (logErr) {
    console.error('Failed to log report status update:', logErr);
  }

  res.status(200).json({
    status: 'success',
    data: {
      report: result.rows[0]
    }
  });
});

// Delete report
export const deleteReport = catchAsync(async (req, res, next) => {
  // Ensure user is admin (role 0)
  if (req.user.role !== 0) {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  const { reporterId, reportedId } = req.params;

  const result = await pool.query(
    `DELETE FROM reports 
     WHERE reporterid = $1 AND reporteeid = $2
     RETURNING *`,
    [reporterId, reportedId]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Report not found', 404));
  }

  // Log the report deletion
  try {
    await import('../utils/logHelper.js').then(({ insertLog }) => insertLog({
      user_id: req.user.user_id,
      action_type: 'ADMIN_DELETE_REPORT',
      action_content: `Deleted report: reporter ${reporterId}, reported ${reportedId}`,
      actor_type: 'admin',
    }));
  } catch (logErr) {
    console.error('Failed to log report deletion:', logErr);
  }

  res.status(204).json({
    status: 'success',
    data: null
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

  // Log the user role update
  try {
    await import('../utils/logHelper.js').then(({ insertLog }) => insertLog({
      user_id: req.user.user_id,
      action_type: 'ADMIN_UPDATE_USER_ROLE',
      action_content: `Updated user role: user ${userId}, new role: ${role}`,
      actor_type: 'admin',
    }));
  } catch (logErr) {
    console.error('Failed to log user role update:', logErr);
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updateResult.rows[0]
    }
  });
});

// Delete user
export const deleteUser = catchAsync(async (req, res, next) => {
  // Ensure user is admin (role 0)
  if (req.user.role !== 0) {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  const { userId } = req.params;

  // Prevent admin from deleting themselves
  if (userId === req.user.user_id) {
    return next(new AppError('Cannot delete your own account', 400));
  }

  // Check if user exists
  const userResult = await pool.query(
    'SELECT user_id, username FROM users WHERE user_id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    return next(new AppError('User not found', 404));
  }

  try {
    // Get all subjects for this user first
    let subjectNames = [];
    try {
      const subjectsResult = await pool.query(
        'SELECT subject_name FROM subject WHERE user_id = $1',
        [userId]
      );
      subjectNames = subjectsResult.rows.map(row => row.subject_name);
    } catch (err) {
      console.log('Error fetching subjects:', err.message);
    }

    // Get all decks for this user's subjects
    let deckTitles = [];
    try {
      if (subjectNames.length > 0) {
        const decksResult = await pool.query(
          'SELECT deck_title FROM deck WHERE subject_name = ANY($1::text[])',
          [subjectNames]
        );
        deckTitles = decksResult.rows.map(row => row.deck_title);
      }
    } catch (err) {
      console.log('Error fetching decks:', err.message);
    }

    // Get all communities owned by this user
    let communityIds = [];
    try {
      const communitiesResult = await pool.query(
        'SELECT community_ID FROM community WHERE community_Creator = $1',
        [userId]
      );
      communityIds = communitiesResult.rows.map(row => row.community_id);
    } catch (err) {
      console.log('Error fetching communities:', err.message);
    }

    // Delete in proper order of dependencies with error handling

    // 1. Delete flashcard reviews
    try {
      if (deckTitles.length > 0) {
        await pool.query(
          'DELETE FROM flashcard_review WHERE card_id IN (SELECT card_id FROM flash_card WHERE deck_title = ANY($1::text[]))',
          [deckTitles]
        );
      }
    } catch (err) {
      console.log('Error deleting flashcard_review, continuing...', err.message);
    }

    // 2. Delete flashcards
    try {
      if (deckTitles.length > 0) {
        await pool.query('DELETE FROM flash_card WHERE deck_title = ANY($1::text[])', [deckTitles]);
      }
    } catch (err) {
      console.log('Error deleting flash_card, continuing...', err.message);
    }

    // 3. Delete decks
    try {
      if (subjectNames.length > 0) {
        await pool.query('DELETE FROM deck WHERE subject_name = ANY($1::text[])', [subjectNames]);
      }
    } catch (err) {
      console.log('Error deleting deck, continuing...', err.message);
    }

    // 4. Delete tasks
    try {
      if (subjectNames.length > 0) {
        await pool.query('DELETE FROM task WHERE subject_name = ANY($1::text[])', [subjectNames]);
      }
    } catch (err) {
      console.log('Error deleting task, continuing...', err.message);
    }

    // 5. Delete notes
    try {
      if (subjectNames.length > 0) {
        await pool.query('DELETE FROM note WHERE subject_name = ANY($1::text[])', [subjectNames]);
      }
    } catch (err) {
      console.log('Error deleting note, continuing...', err.message);
    }

    // 6. Delete sessions
    try {
      await pool.query('DELETE FROM session WHERE user_id = $1', [userId]);
    } catch (err) {
      console.log('Error deleting session, continuing...', err.message);
    }

    // 7. Delete subjects
    try {
      await pool.query('DELETE FROM subject WHERE user_id = $1', [userId]);
    } catch (err) {
      console.log('Error deleting subject, continuing...', err.message);
    }

    // 8. Delete community-related data
    try {
      await pool.query('DELETE FROM studyRoom_Members WHERE student_ID = $1', [userId]);
    } catch (err) {
      console.log('Error deleting studyRoom_Members, continuing...', err.message);
    }

    try {
      if (communityIds.length > 0) {
        await pool.query('DELETE FROM studyRoom WHERE community_ID = ANY($1::integer[])', [communityIds]);
      }
    } catch (err) {
      console.log('Error deleting studyRoom, continuing...', err.message);
    }

    try {
      await pool.query('DELETE FROM community_Participants WHERE user_id = $1', [userId]);
    } catch (err) {
      console.log('Error deleting community_Participants, continuing...', err.message);
    }

    try {
      await pool.query('DELETE FROM community WHERE community_Creator = $1', [userId]);
    } catch (err) {
      console.log('Error deleting community, continuing...', err.message);
    }

    // 9. Delete events and competitions
    try {
      await pool.query('DELETE FROM event WHERE eventCreator = $1', [userId]);
    } catch (err) {
      console.log('Error deleting event, continuing...', err.message);
    }

    try {
      await pool.query('DELETE FROM CompetitionParticipants WHERE user_id = $1', [userId]);
    } catch (err) {
      console.log('Error deleting CompetitionParticipants, continuing...', err.message);
    }

    // 10. Delete friendships
    try {
      await pool.query('DELETE FROM friendship WHERE requesterid = $1 OR requesteeid = $1', [userId]);
    } catch (err) {
      console.log('Error deleting friendship, continuing...', err.message);
    }

    // 11. Delete reports
    try {
      await pool.query('DELETE FROM reports WHERE reporterid = $1 OR reporteeid = $1', [userId]);
    } catch (err) {
      console.log('Error deleting reports, continuing...', err.message);
    }

    // 12. Delete announcements
    try {
      await pool.query('DELETE FROM announcement WHERE moderator_id = $1', [userId]);
    } catch (err) {
      console.log('Error deleting announcement, continuing...', err.message);
    }

    // 13. Delete daily check-ins
    try {
      await pool.query('DELETE FROM daily_checkin WHERE user_id = $1 OR to_user_id = $1', [userId]);
    } catch (err) {
      console.log('Error deleting daily_checkin, continuing...', err.message);
    }

    // 14. Delete user achievements
    try {
      await pool.query('DELETE FROM user_achievements WHERE user_id = $1', [userId]);
    } catch (err) {
      console.log('Error deleting user_achievements, continuing...', err.message);
    }

    // 15. Finally, delete the user
    await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);

    // Log the user deletion
    try {
      await import('../utils/logHelper.js').then(({ insertLog }) => insertLog({
        user_id: req.user.user_id,
        action_type: 'ADMIN_DELETE_USER',
        action_content: `Deleted user: ${userResult.rows[0].username} (ID: ${userId})`,
        actor_type: 'admin',
      }));
    } catch (logErr) {
      console.error('Failed to log user deletion:', logErr);
    }

    res.status(200).json({
      status: 'success',
      message: `User ${userResult.rows[0].username} and all related data have been deleted`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    return next(new AppError(`Failed to delete user: ${error.message}`, 500));
  }
});

// Get system logs with filters
export const getLogs = catchAsync(async (req, res, next) => {
  // Ensure user is admin (role 0)
  if (req.user.role !== 0) {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  const {
    page = 1,
    limit = 50,
    action_type = '',
    actor_type = '',
    user_id = '',
    start_date = '',
    end_date = '',
    order_by = 'desc'
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Build query conditions
  let conditions = [];
  let params = [];
  let paramCount = 0;

  if (action_type && action_type !== 'all') {
    paramCount++;
    conditions.push(`l.action_type = $${paramCount}`);
    params.push(action_type);
  }

  if (actor_type && actor_type !== 'all') {
    paramCount++;
    conditions.push(`l.actor_type = $${paramCount}`);
    params.push(actor_type);
  }

  if (user_id) {
    paramCount++;
    conditions.push(`l.user_id = $${paramCount}`);
    params.push(user_id);
  }

  if (start_date) {
    paramCount++;
    conditions.push(`l.created_at >= $${paramCount}`);
    params.push(start_date);
  }

  if (end_date) {
    paramCount++;
    conditions.push(`l.created_at <= $${paramCount}`);
    params.push(end_date);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Validate and set order direction
  const orderDirection = (order_by?.toLowerCase() === 'asc') ? 'ASC' : 'DESC';
  console.log('Order by param:', order_by, 'Order direction:', orderDirection);

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM log l
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].total);

  // Get logs with user information
  paramCount++;
  params.push(parseInt(limit));
  paramCount++;
  params.push(offset);

  const logsQuery = `
    SELECT 
      l.log_no,
      l.user_id,
      l.action_type,
      l.action_content,
      l.actor_type,
      l.created_at,
      u.username,
      u.email,
      u.profile_picture
    FROM log l
    LEFT JOIN users u ON l.user_id = u.user_id
    ${whereClause}
    ORDER BY l.created_at ${orderDirection}
    LIMIT $${paramCount - 1} OFFSET $${paramCount}
  `;

  const logsResult = await pool.query(logsQuery, params);

  res.status(200).json({
    status: 'success',
    data: {
      logs: logsResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

// Get session statistics (managerial report)
export const getSessionStats = catchAsync(async (req, res, next) => {
  // Ensure user is admin (role 0)
  if (req.user.role !== 0) {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  // Calculate session duration statistics
  const sessionStatsResult = await pool.query(`
    SELECT 
      COALESCE(AVG(elapsed_time), 0) as avg_duration,
      COALESCE(MAX(elapsed_time), 0) as max_duration,
      COALESCE(MIN(elapsed_time), 0) as min_duration,
      COUNT(DISTINCT user_id) as active_users_count,
      COUNT(*) as total_sessions
    FROM session
    WHERE elapsed_time > 0
  `);

  const stats = sessionStatsResult.rows[0];

  res.status(200).json({
    status: 'success',
    data: {
      avgDuration: Math.round(parseFloat(stats.avg_duration)),
      maxDuration: parseInt(stats.max_duration),
      minDuration: parseInt(stats.min_duration),
      activeUsersCount: parseInt(stats.active_users_count),
      totalSessions: parseInt(stats.total_sessions)
    }
  });
});

// Get content creation statistics (managerial report)
export const getContentStats = catchAsync(async (req, res, next) => {
  // Ensure user is admin (role 0)
  if (req.user.role !== 0) {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  // Get user count
  const userCountResult = await pool.query('SELECT COUNT(*) as count FROM users WHERE role != 0');
  const userCount = parseInt(userCountResult.rows[0].count);

  // Get total content counts
  const taskCountResult = await pool.query('SELECT COUNT(*) as count FROM task');
  const flashcardCountResult = await pool.query('SELECT COUNT(*) as count FROM flash_card');
  const noteCountResult = await pool.query('SELECT COUNT(*) as count FROM note');

  const totalTasks = parseInt(taskCountResult.rows[0].count);
  const totalFlashcards = parseInt(flashcardCountResult.rows[0].count);
  const totalNotes = parseInt(noteCountResult.rows[0].count);

  // Calculate averages
  const avgTasksPerUser = userCount > 0 ? (totalTasks / userCount) : 0;
  const avgFlashcardsPerUser = userCount > 0 ? (totalFlashcards / userCount) : 0;
  const avgNotesPerUser = userCount > 0 ? (totalNotes / userCount) : 0;

  // Find most productive user
  const mostProductiveResult = await pool.query(`
    SELECT 
      u.user_id,
      u.username,
      (
        COALESCE((SELECT COUNT(*) FROM task WHERE user_id = u.user_id), 0) +
        COALESCE((SELECT COUNT(*) FROM flash_card fc JOIN deck d ON fc.deck_title = d.deck_title JOIN subject s ON d.subject_name = s.subject_name WHERE s.user_id = u.user_id), 0) +
        COALESCE((SELECT COUNT(*) FROM note WHERE user_id = u.user_id), 0)
      ) as total_content
    FROM users u
    WHERE u.role != 0
    ORDER BY total_content DESC
    LIMIT 1
  `);

  const mostProductiveUser = mostProductiveResult.rows[0] || null;

  res.status(200).json({
    status: 'success',
    data: {
      avgTasksPerUser: parseFloat(avgTasksPerUser.toFixed(2)),
      avgFlashcardsPerUser: parseFloat(avgFlashcardsPerUser.toFixed(2)),
      avgNotesPerUser: parseFloat(avgNotesPerUser.toFixed(2)),
      totalTasks,
      totalFlashcards,
      totalNotes,
      mostProductiveUser: mostProductiveUser ? {
        username: mostProductiveUser.username,
        totalContent: parseInt(mostProductiveUser.total_content)
      } : null
    }
  });
});

// Get user engagement statistics (managerial report)
export const getEngagementStats = catchAsync(async (req, res, next) => {
  // Ensure user is admin (role 0)
  if (req.user.role !== 0) {
    return next(new AppError('Access denied. Admin only.', 403));
  }

  // Get XP statistics
  const xpStatsResult = await pool.query(`
    SELECT 
      COALESCE(AVG(xp), 0) as avg_xp,
      COALESCE(MAX(xp), 0) as max_xp,
      COALESCE(MIN(xp), 0) as min_xp
    FROM users
    WHERE role != 0
  `);

  const xpStats = xpStatsResult.rows[0];

  // Get top XP user
  const topXpUserResult = await pool.query(`
    SELECT user_id, username, xp
    FROM users
    WHERE role != 0
    ORDER BY xp DESC
    LIMIT 1
  `);

  const topXpUser = topXpUserResult.rows[0] || null;

  // Calculate retention rate (users active in last 7 days / total users)
  const totalUsersResult = await pool.query('SELECT COUNT(*) as count FROM users WHERE role != 0');
  const totalUsers = parseInt(totalUsersResult.rows[0].count);

  const activeUsersResult = await pool.query(`
    SELECT COUNT(DISTINCT user_id) as count
    FROM session
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
  `);
  const activeUsers = parseInt(activeUsersResult.rows[0].count);

  const retentionRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100) : 0;

  // Calculate average sessions per active user
  const avgSessionsResult = await pool.query(`
    SELECT COALESCE(AVG(session_count), 0) as avg_sessions
    FROM (
      SELECT user_id, COUNT(*) as session_count
      FROM session
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY user_id
    ) as user_sessions
  `);

  const avgSessionsPerUser = parseFloat(avgSessionsResult.rows[0].avg_sessions);

  res.status(200).json({
    status: 'success',
    data: {
      avgXp: Math.round(parseFloat(xpStats.avg_xp)),
      maxXp: parseInt(xpStats.max_xp),
      minXp: parseInt(xpStats.min_xp),
      topXpUser: topXpUser ? {
        username: topXpUser.username,
        xp: parseInt(topXpUser.xp)
      } : null,
      retentionRate: parseFloat(retentionRate.toFixed(2)),
      avgSessionsPerActiveUser: parseFloat(avgSessionsPerUser.toFixed(2)),
      activeUsers,
      totalUsers
    }
  });
});

