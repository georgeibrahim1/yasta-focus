import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const getAllSessions = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { type, subject_name } = req.query;

  let query = `
    SELECT session_name, user_id, created_at, type, time_stamp, subject_name, task_title
    FROM session
    WHERE user_id = $1
  `;
  
  const params = [userId];
  let paramCount = 1;

  if (type) {
    paramCount++;
    query += ` AND type = $${paramCount}`;
    params.push(type);
  }

  if (subject_name) {
    paramCount++;
    query += ` AND subject_name = $${paramCount}`;
    params.push(subject_name);
  }

  query += ' ORDER BY created_at DESC';

  const result = await db.query(query, params);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      sessions: result.rows
    }
  });
});

// Get a single session
export const getSession = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { sessionName } = req.params;

  const query = `
    SELECT session_name, user_id, created_at, type, time_stamp, subject_name, task_title
    FROM session
    WHERE user_id = $1 AND session_name = $2
  `;

  const result = await db.query(query, [userId, sessionName]);

  if (result.rows.length === 0) {
    return next(new AppError('Session not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      session: result.rows[0]
    }
  });
});

// Create a new session
export const createSession = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { session_name, type, subject_name, task_title, started_at, ended_at } = req.body;

  if (!session_name || !type) {
    return next(new AppError('Session name and type are required', 400));
  }

  // Create unique session name by appending timestamp
  const uniqueSessionName = `${session_name}_${Date.now()}`

  // If subject_name is provided, verify it exists
  if (subject_name) {
    const subjectCheck = await db.query(
      'SELECT subject_name FROM subject WHERE user_id = $1 AND subject_name = $2',
      [userId, subject_name]
    );

    if (subjectCheck.rows.length === 0) {
      return next(new AppError('Subject not found', 404));
    }
  }

  // If task_title is provided, verify it exists (requires subject_name and task_title)
  if (task_title && subject_name) {
    const taskCheck = await db.query(
      'SELECT task_title, status FROM task WHERE user_id = $1 AND subject_name = $2 AND task_title = $3',
      [userId, subject_name, task_title]
    );

    if (taskCheck.rows.length === 0) {
      return next(new AppError('Task not found', 404));
    }

    // Update task status to 'In Progress' if it's 'Not Started'
    if (taskCheck.rows[0].status === 'Not Started') {
      await db.query(
        'UPDATE task SET status = $1 WHERE user_id = $2 AND subject_name = $3 AND task_title = $4',
        ['In Progress', userId, subject_name, task_title]
      );
    }
  }

  const query = `
    INSERT INTO session (session_name, user_id, type, subject_name, task_title, created_at, time_stamp)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING session_name, user_id, created_at, type, time_stamp, subject_name, task_title
  `;

  const result = await db.query(query, [
    uniqueSessionName,
    userId,
    type,
    subject_name || null,
    task_title || null,
    started_at || new Date().toISOString(),
    ended_at || new Date().toISOString()
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      session: result.rows[0]
    }
  });
});

// Update a session
export const updateSession = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { sessionName } = req.params;
  const { type, subject_name, task_title } = req.body;

  const query = `
    UPDATE session
    SET type = COALESCE($1, type),
        subject_name = COALESCE($2, subject_name),
        task_title = COALESCE($3, task_title),
        time_stamp = NOW()
    WHERE user_id = $4 AND session_name = $5
    RETURNING session_name, user_id, created_at, type, time_stamp, subject_name, task_title
  `;

  const result = await db.query(query, [type, subject_name, task_title, userId, sessionName]);

  if (result.rows.length === 0) {
    return next(new AppError('Session not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      session: result.rows[0]
    }
  });
});

// Delete a session
export const deleteSession = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { sessionName } = req.params;

  const query = `
    DELETE FROM session
    WHERE user_id = $1 AND session_name = $2
    RETURNING session_name
  `;

  const result = await db.query(query, [userId, sessionName]);

  if (result.rows.length === 0) {
    return next(new AppError('Session not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get session statistics
export const getSessionStats = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { period = 'week' } = req.query;

  let dateFilter = '';
  switch (period) {
    case 'day':
      dateFilter = "created_at >= NOW() - INTERVAL '1 day'";
      break;
    case 'week':
      dateFilter = "created_at >= NOW() - INTERVAL '7 days'";
      break;
    case 'month':
      dateFilter = "created_at >= NOW() - INTERVAL '30 days'";
      break;
    case 'year':
      dateFilter = "created_at >= NOW() - INTERVAL '1 year'";
      break;
    default:
      dateFilter = "created_at >= NOW() - INTERVAL '7 days'";
  }

  const query = `
    SELECT 
      COUNT(*) as total_sessions,
      COUNT(DISTINCT subject_name) as subjects_studied,
      type,
      COUNT(*) as count_by_type
    FROM session
    WHERE user_id = $1 AND ${dateFilter}
    GROUP BY type
  `;

  const result = await db.query(query, [userId]);

  const totalQuery = `
    SELECT COUNT(*) as total_sessions
    FROM session
    WHERE user_id = $1 AND ${dateFilter}
  `;

  const totalResult = await db.query(totalQuery, [userId]);

  res.status(200).json({
    status: 'success',
    data: {
      period,
      total_sessions: parseInt(totalResult.rows[0]?.total_sessions || 0),
      by_type: result.rows
    }
  });
});
