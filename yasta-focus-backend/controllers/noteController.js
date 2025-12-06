import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get all notes for a subject
export const getAllNotes = catchAsync(async (req, res, next) => {
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
    SELECT note_title, subject_name, user_id, note_text
    FROM note
    WHERE user_id = $1 AND subject_name = $2
    ORDER BY note_title ASC
  `;

  const result = await db.query(query, [userId, subjectName]);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      notes: result.rows
    }
  });
});

// Get a single note
export const getNote = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName, noteTitle } = req.params;

  const query = `
    SELECT note_title, subject_name, user_id, note_text
    FROM note
    WHERE user_id = $1 AND subject_name = $2 AND note_title = $3
  `;

  const result = await db.query(query, [userId, subjectName, noteTitle]);

  if (result.rows.length === 0) {
    return next(new AppError('Note not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      note: result.rows[0]
    }
  });
});

// Create a new note
export const createNote = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName } = req.params;
  const { note_title, note_text } = req.body;

  if (!note_title) {
    return next(new AppError('Note title is required', 400));
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
    INSERT INTO note (note_title, subject_name, user_id, note_text)
    VALUES ($1, $2, $3, $4)
    RETURNING note_title, subject_name, user_id, note_text
  `;

  const result = await db.query(query, [note_title, subjectName, userId, note_text || null]);

  res.status(201).json({
    status: 'success',
    data: {
      note: result.rows[0]
    }
  });
});

// Update a note
export const updateNote = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName, noteTitle } = req.params;
  const { note_text } = req.body;

  const query = `
    UPDATE note
    SET note_text = COALESCE($1, note_text)
    WHERE user_id = $2 AND subject_name = $3 AND note_title = $4
    RETURNING note_title, subject_name, user_id, note_text
  `;

  const result = await db.query(query, [note_text, userId, subjectName, noteTitle]);

  if (result.rows.length === 0) {
    return next(new AppError('Note not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      note: result.rows[0]
    }
  });
});

// Delete a note
export const deleteNote = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName, noteTitle } = req.params;

  const query = `
    DELETE FROM note
    WHERE user_id = $1 AND subject_name = $2 AND note_title = $3
    RETURNING note_title
  `;

  const result = await db.query(query, [userId, subjectName, noteTitle]);

  if (result.rows.length === 0) {
    return next(new AppError('Note not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Search notes across all subjects
export const searchNotes = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { q } = req.query;

  if (!q) {
    return next(new AppError('Search query is required', 400));
  }

  const query = `
    SELECT note_title, subject_name, user_id, note_text
    FROM note
    WHERE user_id = $1 AND (
      note_title ILIKE $2 OR note_text ILIKE $2
    )
    ORDER BY note_title ASC
  `;

  const result = await db.query(query, [userId, `%${q}%`]);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      notes: result.rows
    }
  });
});
