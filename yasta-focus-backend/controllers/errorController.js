import AppError from '../utils/appError.js';

// unique constraint violation
const handleDuplicateFieldsDB = err => {
  let message = 'This item already exists. Please use a different name.';
  
  // Extract more specific information from the constraint name
  const constraint = err.constraint || '';
  const detail = err.detail || '';
  
  // Handle specific constraints with better messages
  if (constraint.includes('username')) {
    message = 'This username is already taken. Please choose another one.';
  } else if (constraint.includes('email')) {
    message = 'This email is already registered. Please use another email.';
  } else if (constraint.includes('subject')) {
    message = 'A subject with this name already exists. Please use a different name.';
  } else if (constraint.includes('note')) {
    message = 'A note with this title already exists in this subject. Please use a different title.';
  } else if (constraint.includes('task')) {
    message = 'A task with this title already exists in this subject. Please use a different title.';
  } else if (constraint.includes('deck')) {
    message = 'A deck with this title already exists in this subject. Please use a different title.';
  } else if (constraint.includes('flash_card') || constraint.includes('question')) {
    message = 'A flashcard with this question already exists in this deck. Please use a different question.';
  } else if (constraint.includes('community')) {
    message = 'A community with this name already exists. Please choose a different name.';
  } else if (constraint.includes('session')) {
    message = 'A session with this name already exists. Please use a different name.';
  } else if (detail) {
    // Try to extract the field name from the detail message
    const fieldMatch = detail.match(/Key \(([^)]+)\)/);
    if (fieldMatch && fieldMatch[1]) {
      const field = fieldMatch[1].split(',')[0].replace(/_/g, ' ');
      message = `This ${field} already exists. Please use a different value.`;
    }
  }
  
  return new AppError(message, 400);
};

// invalid input syntax
const handleInvalidInputDB = err => {
  const message = `Invalid input data: ${err.message}`;
  return new AppError(message, 400);
};

// foreign key violation
const handleForeignKeyViolationDB = err => {
  const message = 'Referenced record does not exist.';
  return new AppError(message, 400);
};

// NOT NULL violation
const handleNotNullViolationDB = err => {
  const field = err.column || 'field';
  const message = `${field} is required.`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // B) RENDERED WEBSITE
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

export default (err, req, res, next) => {

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle PostgreSQL errors in both dev and prod
  let error = { ...err };
  error.message = err.message;

  // PostgreSQL error codes
  if (err.code === '23505') error = handleDuplicateFieldsDB(err);
  if (err.code === '22P02') error = handleInvalidInputDB(err);
  if (err.code === '23503') error = handleForeignKeyViolationDB(err);
  if (err.code === '23502') error = handleNotNullViolationDB(err);
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(error, req, res);
  }
};