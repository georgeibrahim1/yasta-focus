import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get all decks for a subject
export const getAllDecks = catchAsync(async (req, res, next) => {
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
    SELECT deck_title, subject_name, user_id, reminder_by, last_review_date, deck__desc, last_round_time
    FROM deck
    WHERE user_id = $1 AND subject_name = $2
    ORDER BY deck_title ASC
  `;

  const result = await db.query(query, [userId, subjectName]);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      decks: result.rows
    }
  });
});

// Get a single deck
export const getDeck = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName, deckTitle } = req.params;

  const query = `
    SELECT deck_title, subject_name, user_id, reminder_by, last_review_date, deck__desc, last_round_time
    FROM deck
    WHERE user_id = $1 AND subject_name = $2 AND deck_title = $3
  `;

  const result = await db.query(query, [userId, subjectName, deckTitle]);

  if (result.rows.length === 0) {
    return next(new AppError('Deck not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      deck: result.rows[0]
    }
  });
});

// Create a new deck
export const createDeck = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName } = req.params;
  const { deck_title, reminder_by, deck__desc } = req.body;

  if (!deck_title) {
    return next(new AppError('Deck title is required', 400));
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
    INSERT INTO deck (deck_title, subject_name, user_id, reminder_by, deck__desc)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING deck_title, subject_name, user_id, reminder_by, last_review_date, deck__desc, last_round_time
  `;

  const result = await db.query(query, [deck_title, subjectName, userId, reminder_by || null, deck__desc || null]);

  res.status(201).json({
    status: 'success',
    data: {
      deck: result.rows[0]
    }
  });
});

// Update a deck
export const updateDeck = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName, deckTitle } = req.params;
  const { reminder_by, deck__desc, last_review_date, last_round_time } = req.body;

  const query = `
    UPDATE deck
    SET reminder_by = COALESCE($1, reminder_by),
        deck__desc = COALESCE($2, deck__desc),
        last_review_date = COALESCE($3, last_review_date),
        last_round_time = COALESCE($4, last_round_time)
    WHERE user_id = $5 AND subject_name = $6 AND deck_title = $7
    RETURNING deck_title, subject_name, user_id, reminder_by, last_review_date, deck__desc, last_round_time
  `;

  const result = await db.query(query, [reminder_by, deck__desc, last_review_date, last_round_time, userId, subjectName, deckTitle]);

  if (result.rows.length === 0) {
    return next(new AppError('Deck not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      deck: result.rows[0]
    }
  });
});

// Delete a deck
export const deleteDeck = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { subjectName, deckTitle } = req.params;

  const query = `
    DELETE FROM deck
    WHERE user_id = $1 AND subject_name = $2 AND deck_title = $3
    RETURNING deck_title
  `;

  const result = await db.query(query, [userId, subjectName, deckTitle]);

  if (result.rows.length === 0) {
    return next(new AppError('Deck not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
