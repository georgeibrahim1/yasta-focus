import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get all tasks for a subject
export const getAllTasks = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName } = req.params;

  // Verify subject exists and belongs to user
  const subjectCheck = await db.query(
    'SELECT subject_name FROM subject WHERE user_id = $1 AND subject_name = $2',
    [userId, subjectName]
  );

  if (subjectCheck.rows.length === 0) {
    return next(new AppError('Subject not found', 404));
  }

  const query = `
    SELECT task_title, subject_name, user_id, description, status, deadline
    FROM task
    WHERE user_id = $1 AND subject_name = $2
    ORDER BY deadline ASC NULLS LAST, task_title ASC
  `;

  const result = await db.query(query, [userId, subjectName]);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      tasks: result.rows
    }
  });
});

// Get a single task
export const getTask = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName, taskTitle } = req.params;

  const query = `
    SELECT task_title, subject_name, user_id, description, status, deadline
    FROM task
    WHERE user_id = $1 AND subject_name = $2 AND task_title = $3
  `;

  const result = await db.query(query, [userId, subjectName, taskTitle]);

  if (result.rows.length === 0) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      task: result.rows[0]
    }
  });
});

// Create a new task
export const createTask = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName } = req.params;
  const { task_title, description, status, deadline } = req.body;

  if (!task_title) {
    return next(new AppError('Task title is required', 400));
  }

  // Verify subject exists and belongs to user
  const subjectCheck = await db.query(
    'SELECT subject_name FROM subject WHERE user_id = $1 AND subject_name = $2',
    [userId, subjectName]
  );

  if (subjectCheck.rows.length === 0) {
    return next(new AppError('Subject not found', 404));
  }

  const query = `
    INSERT INTO task (task_title, subject_name, user_id, description, status, deadline)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING task_title, subject_name, user_id, description, status, deadline
  `;

  const result = await db.query(query, [
    task_title,
    subjectName,
    userId,
    description || null,
    status || 'Pending',
    deadline || null
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      task: result.rows[0]
    }
  });
});

// Update a task
export const updateTask = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName, taskTitle } = req.params;
  const { description, status, deadline } = req.body;

  const query = `
    UPDATE task
    SET description = COALESCE($1, description),
        status = COALESCE($2, status),
        deadline = COALESCE($3, deadline)
    WHERE user_id = $4 AND subject_name = $5 AND task_title = $6
    RETURNING task_title, subject_name, user_id, description, status, deadline
  `;

  const result = await db.query(query, [description, status, deadline, userId, subjectName, taskTitle]);

  if (result.rows.length === 0) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      task: result.rows[0]
    }
  });
});

// Toggle task status (Pending <-> Completed)
export const toggleTaskStatus = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName, taskTitle } = req.params;

  const query = `
    UPDATE task
    SET status = CASE 
      WHEN status = 'Pending' THEN 'Completed'
      WHEN status = 'Completed' THEN 'Pending'
      ELSE 'Pending'
    END
    WHERE user_id = $1 AND subject_name = $2 AND task_title = $3
    RETURNING task_title, subject_name, user_id, description, status, deadline
  `;

  const result = await db.query(query, [userId, subjectName, taskTitle]);

  if (result.rows.length === 0) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      task: result.rows[0]
    }
  });
});

// Delete a task
export const deleteTask = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName, taskTitle } = req.params;

  const query = `
    DELETE FROM task
    WHERE user_id = $1 AND subject_name = $2 AND task_title = $3
    RETURNING task_title
  `;

  const result = await db.query(query, [userId, subjectName, taskTitle]);

  if (result.rows.length === 0) {
    return next(new AppError('Task not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
