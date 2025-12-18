import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get all subjects for the logged-in user
// export const getAllSubjects = catchAsync(async (req, res, next) => {
//   const userId = req.user.user_id;

//   const query = `
//     SELECT subject_name, user_id, description, photo
//     FROM subject
//     WHERE user_id = $1
//     ORDER BY subject_name ASC
//   `;

//   const result = await db.query(query, [userId]);

//   res.status(200).json({
//     status: 'success',
//     results: result.rows.length,
//     data: {
//       subjects: result.rows
//     }
//   });
// });
export const getAllSubjects = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;

  const result = await db.query(
    'SELECT * FROM get_user_subjects($1)',
    [userId]
  );

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      subjects: result.rows
    }
  });
});

// Get a single subject
export const getSubject = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName } = req.params;

  const query = `
    SELECT subject_name, user_id, description, photo
    FROM subject
    WHERE user_id = $1 AND subject_name = $2
  `;

  const result = await db.query(query, [userId, subjectName]);

  if (result.rows.length === 0) {
    return next(new AppError('Subject not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      subject: result.rows[0]
    }
  });
});

// Create a new subject
// export const createSubject = catchAsync(async (req, res, next) => {
//   const userId = req.user.user_id;
//   const { subject_name, description, photo } = req.body;

//   if (!subject_name) {
//     return next(new AppError('Subject name is required', 400));
//   }

//   const query = `
//     INSERT INTO subject (subject_name, user_id, description, photo)
//     VALUES ($1, $2, $3, $4)
//     RETURNING subject_name, user_id, description, photo
//   `;

//   const result = await db.query(query, [subject_name, userId, description || null, photo || null]);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       subject: result.rows[0]
//     }
//   });
// });
export const createSubject = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subject_name, description, photo } = req.body;

  if (!subject_name) {
    return next(new AppError('Subject name is required', 400));
  }

  await db.query(
    'CALL create_subject($1, $2, $3, $4)',
    [userId, subject_name, description || null, photo || null]
  );

  // Fetch the created subject to return
  const result = await db.query(
    'SELECT subject_name, user_id, description, photo FROM subject WHERE user_id = $1 AND subject_name = $2',
    [userId, subject_name]
  );

  res.status(201).json({
    status: 'success',
    data: {
      subject: result.rows[0]
    }
  });
});

// Update a subject
export const updateSubject = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName } = req.params;
  const { description, photo } = req.body;

  const query = `
    UPDATE subject
    SET description = COALESCE($1, description),
        photo = COALESCE($2, photo)
    WHERE user_id = $3 AND subject_name = $4
    RETURNING subject_name, user_id, description, photo
  `;

  const result = await db.query(query, [description, photo, userId, subjectName]);

  if (result.rows.length === 0) {
    return next(new AppError('Subject not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      subject: result.rows[0]
    }
  });
});

// Delete a subject
export const deleteSubject = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName } = req.params;

  // First, verify the subject exists
  const subjectCheck = await db.query(
    'SELECT subject_name FROM subject WHERE user_id = $1 AND subject_name = $2',
    [userId, subjectName]
  );

  if (subjectCheck.rows.length === 0) {
    return next(new AppError('Subject not found', 404));
  }

  // Delete in correct order to avoid foreign key constraint violations
  
  // 1. Try to delete flashcard reviews first (if table exists)
  try {
    await db.query(
      'DELETE FROM flashcard_review WHERE card_id IN (SELECT card_id FROM flash_card WHERE user_id = $1 AND subject_name = $2)',
      [userId, subjectName]
    );
  } catch (err) {
    // Table might not exist, continue
    console.log('flashcard_review table not found, continuing...');
  }

  // 2. Delete flashcards associated with this subject
  await db.query(
    'DELETE FROM flash_card WHERE user_id = $1 AND subject_name = $2',
    [userId, subjectName]
  );

  // 2. Delete decks for this subject
  await db.query(
    'DELETE FROM deck WHERE user_id = $1 AND subject_name = $2',
    [userId, subjectName]
  );

  // 3. Delete tasks for this subject
  await db.query(
    'DELETE FROM task WHERE user_id = $1 AND subject_name = $2',
    [userId, subjectName]
  );

  // 4. Delete notes for this subject
  await db.query(
    'DELETE FROM note WHERE user_id = $1 AND subject_name = $2',
    [userId, subjectName]
  );

  // 5. Delete srsessions_members first (references session)
  await db.query(
    'DELETE FROM srsessions_members WHERE student_id = $1 AND session_name IN (SELECT session_name FROM session WHERE user_id = $1 AND subject_name = $2)',
    [userId, subjectName]
  );

  // 6. Delete sessions for this subject
  await db.query(
    'DELETE FROM session WHERE user_id = $1 AND subject_name = $2',
    [userId, subjectName]
  );

  // 7. Delete competition participants entries for this subject
  await db.query(
    'DELETE FROM CompetitionParticipants WHERE user_id = $1 AND subject_name = $2',
    [userId, subjectName]
  );

  // 8. Finally, delete the subject itself
  const query = `
    DELETE FROM subject
    WHERE user_id = $1 AND subject_name = $2
    RETURNING subject_name
  `;

  const result = await db.query(query, [userId, subjectName]);

  if (result.rows.length === 0) {
    return next(new AppError('Subject not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
