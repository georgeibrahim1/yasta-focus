import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { promisify } from 'util';
import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user.user_id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  user.password_hash = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;

  if (!username || !email || !password) {
    return next(new AppError('Please provide username, email and password', 400));
  }

  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters', 400));
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const query = `
    INSERT INTO users (username, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING user_id, username, email, created_at
  `;

  const result = await db.query(query, [username, email, password_hash]);
  const newUser = result.rows[0];

  createSendToken(newUser, 201, req, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const query = `SELECT * FROM users WHERE email = $1`;
  const result = await db.query(query, [email]);

  if (result.rows.length === 0) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const user = result.rows[0];
  const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordCorrect) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, req, res);
});

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};



export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const query = `SELECT * FROM users WHERE user_id = $1`;
  const result = await db.query(query, [decoded.id]);

  if (result.rows.length === 0) {
    return next(new AppError('The user belonging to this token no longer exists', 401));
  }

  const currentUser = result.rows[0];
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});



export const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      const query = `SELECT * FROM users WHERE user_id = $1`;
      const result = await db.query(query, [decoded.id]);

      if (result.rows.length === 0) {
        return next();
      }

      const currentUser = result.rows[0];
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};



export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};



export const forgotPassword = catchAsync(async (req, res, next) => {
  const query = `SELECT * FROM users WHERE email = $1`;
  const result = await db.query(query, [req.body.email]);

  if (result.rows.length === 0) {
    return next(new AppError('There is no user with that email address', 404));
  }

  const user = result.rows[0];
  const resetToken = crypto.randomBytes(32).toString('hex');
  const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  const updateQuery = `
    UPDATE users 
    SET password_reset_token = $1, password_reset_expires = $2
    WHERE user_id = $3
  `;
  await db.query(updateQuery, [passwordResetToken, passwordResetExpires, user.user_id]);

  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      resetURL
    });
  } catch (err) {
    const clearQuery = `
      UPDATE users 
      SET password_reset_token = NULL, password_reset_expires = NULL
      WHERE user_id = $1
    `;
    await db.query(clearQuery, [user.user_id]);

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});



export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const query = `
    SELECT * FROM users 
    WHERE password_reset_token = $1 AND password_reset_expires > $2
  `;
  const result = await db.query(query, [hashedToken, new Date()]);

  if (result.rows.length === 0) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  const user = result.rows[0];
  const { password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const updateQuery = `
    UPDATE users 
    SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL
    WHERE user_id = $2
    RETURNING user_id, username, email, created_at
  `;
  const updateResult = await db.query(updateQuery, [password_hash, user.user_id]);

  createSendToken(updateResult.rows[0], 200, req, res);
});



export const updatePassword = catchAsync(async (req, res, next) => {
  const query = `SELECT * FROM users WHERE user_id = $1`;
  const result = await db.query(query, [req.user.user_id]);

  const user = result.rows[0];
  const isPasswordCorrect = await bcrypt.compare(req.body.passwordCurrent, user.password_hash);

  if (!isPasswordCorrect) {
    return next(new AppError('Your current password is wrong', 401));
  }

  const { password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const updateQuery = `
    UPDATE users 
    SET password_hash = $1
    WHERE user_id = $2
    RETURNING user_id, username, email, created_at
  `;
  const updateResult = await db.query(updateQuery, [password_hash, user.user_id]);

  createSendToken(updateResult.rows[0], 200, req, res);
}); 