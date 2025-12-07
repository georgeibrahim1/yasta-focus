import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get all flashcards for a deck
export const getAllFlashcards = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName, deckTitle } = req.params;

  // Verify deck exists and belongs to user
  const deckCheck = await db.query(
    'SELECT deck_title FROM deck WHERE user_id = $1 AND subject_name = $2 AND deck_title = $3',
    [userId, subjectName, deckTitle]
  );

  if (deckCheck.rows.length === 0) {
    return next(new AppError('Deck not found', 404));
  }

  const query = `
    SELECT question, deck_title, subject_name, user_id, answer, status
    FROM flash_card
    WHERE user_id = $1 AND subject_name = $2 AND deck_title = $3
    ORDER BY status ASC, question ASC
  `;

  const result = await db.query(query, [userId, subjectName, deckTitle]);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      flashcards: result.rows
    }
  });
});

// Get a single flashcard
export const getFlashcard = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName, deckTitle, question } = req.params;

  const query = `
    SELECT question, deck_title, subject_name, user_id, answer, status
    FROM flash_card
    WHERE user_id = $1 AND subject_name = $2 AND deck_title = $3 AND question = $4
  `;

  const result = await db.query(query, [userId, subjectName, deckTitle, question]);

  if (result.rows.length === 0) {
    return next(new AppError('Flashcard not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      flashcard: result.rows[0]
    }
  });
});

// Create a new flashcard
export const createFlashcard = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName, deckTitle } = req.params;
  const { question, answer, status } = req.body;

  if (!question || !answer) {
    return next(new AppError('Question and answer are required', 400));
  }

  // Verify deck exists and belongs to user
  const deckCheck = await db.query(
    'SELECT deck_title FROM deck WHERE user_id = $1 AND subject_name = $2 AND deck_title = $3',
    [userId, subjectName, deckTitle]
  );

  if (deckCheck.rows.length === 0) {
    return next(new AppError('Deck not found', 404));
  }

  const query = `
    INSERT INTO flash_card (question, deck_title, subject_name, user_id, answer, status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING question, deck_title, subject_name, user_id, answer, status
  `;

  const result = await db.query(query, [question, deckTitle, subjectName, userId, answer, status || 0]);

  res.status(201).json({
    status: 'success',
    data: {
      flashcard: result.rows[0]
    }
  });
});

// Update a flashcard (answer or confidence level/status)
export const updateFlashcard = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName, deckTitle, question } = req.params;
  const { answer, status } = req.body;

  const query = `
    UPDATE flash_card
    SET answer = COALESCE($1, answer),
        status = COALESCE($2, status)
    WHERE user_id = $3 AND subject_name = $4 AND deck_title = $5 AND question = $6
    RETURNING question, deck_title, subject_name, user_id, answer, status
  `;

  const result = await db.query(query, [answer, status, userId, subjectName, deckTitle, question]);

  if (result.rows.length === 0) {
    return next(new AppError('Flashcard not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      flashcard: result.rows[0]
    }
  });
});

// Update flashcard confidence level (revision system)
export const updateFlashcardConfidence = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName, deckTitle, question } = req.params;
  const { confidence } = req.body; // 0=again, 1=hard, 2=good, 3=easy, 4=very easy, 5=perfect

  if (confidence === undefined || confidence < 0 || confidence > 5) {
    return next(new AppError('Confidence must be between 0 and 5', 400));
  }

  // Get current status
  const currentQuery = `
    SELECT status FROM flash_card
    WHERE user_id = $1 AND subject_name = $2 AND deck_title = $3 AND question = $4
  `;
  const currentResult = await db.query(currentQuery, [userId, subjectName, deckTitle, question]);

  if (currentResult.rows.length === 0) {
    return next(new AppError('Flashcard not found', 404));
  }

  const currentStatus = currentResult.rows[0].status;
  let newStatus = currentStatus;

  // Update status based on confidence (spaced repetition)
  if (confidence === 0) {
    // Again - reset to 0
    newStatus = 0;
  } else if (confidence === 1) {
    // Hard - keep same or decrease by 1
    newStatus = Math.max(0, currentStatus - 1);
  } else if (confidence === 2) {
    // Good - increase by 1
    newStatus = Math.min(5, currentStatus + 1);
  } else if (confidence === 3) {
    // Easy - increase by 2
    newStatus = Math.min(5, currentStatus + 2);
  } else if (confidence === 4) {
    // Very Easy - increase by 2
    newStatus = Math.min(5, currentStatus + 2);
  } else if (confidence === 5) {
    // Perfect - set to max (5)
    newStatus = 5;
  }

  const updateQuery = `
    UPDATE flash_card
    SET status = $1
    WHERE user_id = $2 AND subject_name = $3 AND deck_title = $4 AND question = $5
    RETURNING question, deck_title, subject_name, user_id, answer, status
  `;

  const result = await db.query(updateQuery, [newStatus, userId, subjectName, deckTitle, question]);

  // Update deck last_review_date
  await db.query(
    'UPDATE deck SET last_review_date = NOW() WHERE user_id = $1 AND subject_name = $2 AND deck_title = $3',
    [userId, subjectName, deckTitle]
  );

  res.status(200).json({
    status: 'success',
    data: {
      flashcard: result.rows[0]
    }
  });
});

// Delete a flashcard
export const deleteFlashcard = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName, deckTitle, question } = req.params;

  const query = `
    DELETE FROM flash_card
    WHERE user_id = $1 AND subject_name = $2 AND deck_title = $3 AND question = $4
    RETURNING question
  `;

  const result = await db.query(query, [userId, subjectName, deckTitle, question]);

  if (result.rows.length === 0) {
    return next(new AppError('Flashcard not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
