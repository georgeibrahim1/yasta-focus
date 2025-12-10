import pool from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get user's friends list
export const getFriends = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;

  const result = await pool.query(
    `SELECT 
      u.user_id,
      u.username,
      u.profile_picture,
      u.xp,
      u.bio,
      f.created_at as friends_since
    FROM friendship f
    JOIN users u ON (
      CASE 
        WHEN f.requesterid = $1 THEN u.user_id = f.requesteeid
        ELSE u.user_id = f.requesterid
      END
    )
    WHERE (f.requesterid = $1 OR f.requesteeid = $1)
      AND f.status = 'Accepted'
    ORDER BY u.username`,
    [userId]
  );

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      friends: result.rows
    }
  });
});

// Get friend requests (received)
export const getFriendRequests = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;

  const result = await pool.query(
    `SELECT 
      u.user_id,
      u.username,
      u.profile_picture,
      u.xp,
      u.bio,
      f.created_at as requested_at,
      f.status
    FROM friendship f
    JOIN users u ON u.user_id = f.requesterid
    WHERE f.requesteeid = $1 AND f.status = 'Pending'
    ORDER BY f.created_at DESC`,
    [userId]
  );

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      requests: result.rows
    }
  });
});

// Get sent friend requests
export const getSentRequests = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;

  const result = await pool.query(
    `SELECT 
      u.user_id,
      u.username,
      u.profile_picture,
      u.xp,
      u.bio,
      f.created_at as requested_at,
      f.status
    FROM friendship f
    JOIN users u ON u.user_id = f.requesteeid
    WHERE f.requesterid = $1 AND f.status = 'Pending'
    ORDER BY f.created_at DESC`,
    [userId]
  );

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      sentRequests: result.rows
    }
  });
});

// Respond to friend request (accept/reject)
export const respondToFriendRequest = catchAsync(async (req, res, next) => {
  const { requesterId } = req.params;
  const { action } = req.body; // 'accept' or 'reject'
  const userId = req.user.user_id;

  if (!['accept', 'reject'].includes(action)) {
    return next(new AppError('Invalid action. Use "accept" or "reject"', 400));
  }

  // Check if friend request exists
  const requestResult = await pool.query(
    `SELECT * FROM friendship 
     WHERE requesterid = $1 AND requesteeid = $2 AND status = 'Pending'`,
    [requesterId, userId]
  );

  if (requestResult.rows.length === 0) {
    return next(new AppError('Friend request not found', 404));
  }

  if (action === 'accept') {
    // Accept the request
    await pool.query(
      `UPDATE friendship 
       SET status = 'Accepted' 
       WHERE requesterid = $1 AND requesteeid = $2`,
      [requesterId, userId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Friend request accepted'
    });
  } else {
    // Reject the request - delete it
    await pool.query(
      `DELETE FROM friendship 
       WHERE requesterid = $1 AND requesteeid = $2`,
      [requesterId, userId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Friend request rejected'
    });
  }
});

// Cancel sent friend request
export const cancelFriendRequest = catchAsync(async (req, res, next) => {
  const { requesteeId } = req.params;
  const userId = req.user.user_id;

  const result = await pool.query(
    `DELETE FROM friendship 
     WHERE requesterid = $1 AND requesteeid = $2 AND status = 'Pending'
     RETURNING *`,
    [userId, requesteeId]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Friend request not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Friend request cancelled'
  });
});

// Remove friend
export const removeFriend = catchAsync(async (req, res, next) => {
  const { friendId } = req.params;
  const userId = req.user.user_id;

  const result = await pool.query(
    `DELETE FROM friendship 
     WHERE ((requesterid = $1 AND requesteeid = $2) 
        OR (requesterid = $2 AND requesteeid = $1))
        AND status = 'Accepted'
     RETURNING *`,
    [userId, friendId]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Friendship not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Friend removed'
  });
});

// Give XP to friend
export const giveXPToFriend = catchAsync(async (req, res, next) => {
  const { friendId } = req.params;
  const userId = req.user.user_id;
  const xpAmount = 10; // Fixed amount

  // Check if they are friends
  const friendshipResult = await pool.query(
    `SELECT * FROM friendship 
     WHERE ((requesterid = $1 AND requesteeid = $2) 
        OR (requesterid = $2 AND requesteeid = $1))
        AND status = 'Accepted'`,
    [userId, friendId]
  );

  if (friendshipResult.rows.length === 0) {
    return next(new AppError('You can only give XP to your friends', 403));
  }

  // Give XP to friend
  await pool.query(
    'UPDATE users SET xp = xp + $1 WHERE user_id = $2',
    [xpAmount, friendId]
  );

  // Get updated friend data
  const friendResult = await pool.query(
    'SELECT user_id, username, xp FROM users WHERE user_id = $1',
    [friendId]
  );

  res.status(200).json({
    status: 'success',
    message: `Successfully gave ${xpAmount} XP`,
    data: {
      friend: friendResult.rows[0]
    }
  });
});
