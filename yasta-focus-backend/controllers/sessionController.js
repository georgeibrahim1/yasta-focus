import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import {checkStudyFocusSessionAchievements,checkStudySessionAchievements, checkStudyTimeAchievements, checkTodaySessionAchievements } from '../utils/achievementHelper.js';

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

  const sessionAchievements = await checkStudySessionAchievements(userId);
  const timeAchievements = await checkStudyTimeAchievements(userId);
  const focusSessionAchievement = await checkStudyFocusSessionAchievements(userId);
  const TodaySessionAchievements = await checkTodaySessionAchievements(userId);
  const unlockedAchievements = [
    ...(Array.isArray(sessionAchievements) ? sessionAchievements : []),
    ...(Array.isArray(timeAchievements) ? timeAchievements : []),
    ...(Array.isArray(focusSessionAchievement) ? focusSessionAchievement : []),
    ...(Array.isArray(TodaySessionAchievements) ? TodaySessionAchievements : [])
  ];
  // Total achievements unlocked during creation of a session

  res.status(201).json({
    status: 'success',
    data: {
      session: result.rows[0],
      unlockedAchievements: unlockedAchievements.map(a => ({
      id: a.id,
      title: a.title,
      xp: a.xp
    }))
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

// Get weekly study time (bar chart)
export const getWeeklyStudyTime = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;

  const query = `
    SELECT 
      TO_CHAR(created_at, 'Dy') as day,
      SUM(EXTRACT(EPOCH FROM (time_stamp - created_at))) as total_seconds
    FROM session
    WHERE user_id = $1 
    AND created_at >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY TO_CHAR(created_at, 'Dy')
  `;

  const result = await db.query(query, [userId]);

  res.status(200).json({
    status: 'success',
    data: {
      weeklyData: result.rows
    }
  });
});

// Get session trends (line chart)
export const getSessionTrends = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;

  const query = `
    SELECT 
      TO_CHAR(created_at, 'Dy') as day,
      COUNT(*) as session_count
    FROM session
    WHERE user_id = $1 
    AND created_at >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY TO_CHAR(created_at, 'Dy')
  `;

  const result = await db.query(query, [userId]);

  res.status(200).json({
    status: 'success',
    data: {
      trendsData: result.rows
    }
  });
});

// Get subject statistics (bubble chart + details)
export const getSubjectStats = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;

  // Get subjects with study time and session count
  const query = `
    SELECT 
      s.subject_name,
      COUNT(ses.session_name) as session_count,
      COALESCE(SUM(EXTRACT(EPOCH FROM (ses.time_stamp - ses.created_at))), 0) as total_seconds,
      COUNT(t.task_title) as task_count
    FROM subject s
    LEFT JOIN session ses ON s.subject_name = ses.subject_name AND s.user_id = ses.user_id
    LEFT JOIN task t ON s.subject_name = t.subject_name AND s.user_id = t.user_id
    WHERE s.user_id = $1
    GROUP BY s.subject_name
    ORDER BY total_seconds DESC
  `;

  const result = await db.query(query, [userId]);

  // Find most and least studied
  const subjects = result.rows;
  const mostStudied = subjects[0] || null;
  const leastStudied = subjects.length > 1 ? subjects[subjects.length - 1] : null;

  res.status(200).json({
    status: 'success',
    data: {
      subjects: result.rows,
      mostStudied,
      leastStudied,
      totalSubjects: subjects.length,
      totalStudyTime: subjects.reduce((sum, s) => sum + parseFloat(s.total_seconds), 0)
    }
  });
});

// Get heatmap data for current month
export const getHeatmapData = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { year, month } = req.query;

  const targetYear = year || new Date().getFullYear();
  const targetMonth = month || new Date().getMonth() + 1;

  const query = `
    SELECT 
      EXTRACT(DAY FROM created_at) as day,
      COUNT(*) as session_count
    FROM session
    WHERE user_id = $1 
    AND EXTRACT(YEAR FROM created_at) = $2
    AND EXTRACT(MONTH FROM created_at) = $3
    GROUP BY EXTRACT(DAY FROM created_at)
    ORDER BY day
  `;

  const result = await db.query(query, [userId, targetYear, targetMonth]);

  res.status(200).json({
    status: 'success',
    data: {
      year: targetYear,
      month: targetMonth,
      heatmapData: result.rows
    }
  });
});
