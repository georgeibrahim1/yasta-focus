import AppError from '../utils/appError.js';

// unique constraint violation
const handleDuplicateFieldsDB = err => {
  const field = err.constraint?.replace('_key', '').replace('users_', '');
  const message = `${field || 'Field'} already exists. Please use another value!`;
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

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // PostgreSQL error codes
    if (error.code === '23505') error = handleDuplicateFieldsDB(error);
    if (error.code === '22P02') error = handleInvalidInputDB(error);
    if (error.code === '23503') error = handleForeignKeyViolationDB(error);
    if (error.code === '23502') error = handleNotNullViolationDB(error);
    
    // JWT errors
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};