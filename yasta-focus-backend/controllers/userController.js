import pool from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get user profile by ID (with achievements and interests)
export const getUserProfile = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const targetUserId = userId || req.user.user_id;

  // Get user basic info
  const userResult = await pool.query(
    `SELECT user_id, username, email, profile_picture, bio, xp, role, created_at
     FROM users 
     WHERE user_id = $1`,
    [targetUserId]
  );

  if (userResult.rows.length === 0) {
    return next(new AppError('User not found', 404));
  }

  const user = userResult.rows[0];

  // Get user interests
  const interestsResult = await pool.query(
    `SELECT interest FROM studentinterests WHERE studentid = $1`,
    [targetUserId]
  );
  user.interests = interestsResult.rows.map(row => row.interest);

  // Get user achievements
  const achievementsResult = await pool.query(
    `SELECT a.id, a.picture, a.title, a.description, a.xp, a.criteriatype, a.criteriavalue
     FROM userachievements ua
     JOIN achievement a ON ua.achievementid = a.id
     WHERE ua.userid = $1`,
    [targetUserId]
  );
  user.achievements = achievementsResult.rows;

  // Get friendship status if viewing another user's profile
  if (userId && userId !== req.user.user_id) {
    const friendshipResult = await pool.query(
      `SELECT status, requesterid, requesteeid
       FROM friendship 
       WHERE (requesterid = $1 AND requesteeid = $2) 
          OR (requesterid = $2 AND requesteeid = $1)`,
      [req.user.user_id, targetUserId]
    );

    if (friendshipResult.rows.length > 0) {
      const friendship = friendshipResult.rows[0];
      if (friendship.status === 'Accepted') {
        user.friendship_status = 'friends';
      } else if (friendship.status === 'Pending') {
        user.friendship_status = friendship.requesterid === req.user.user_id ? 'sent' : 'received';
      }
    } else {
      user.friendship_status = 'none';
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update current user profile
export const updateUserProfile = catchAsync(async (req, res, next) => {
  const { username, bio, profile_picture, interests } = req.body;
  const userId = req.user.user_id;

  // Update user basic info
  const updateFields = [];
  const values = [];
  let paramCount = 1;

  if (username !== undefined) {
    updateFields.push(`username = $${paramCount}`);
    values.push(username);
    paramCount++;
  }

  if (bio !== undefined) {
    updateFields.push(`bio = $${paramCount}`);
    values.push(bio);
    paramCount++;
  }

  if (profile_picture !== undefined) {
    updateFields.push(`profile_picture = $${paramCount}`);
    values.push(profile_picture);
    paramCount++;
  }

  if (updateFields.length > 0) {
    updateFields.push(`updated_at = NOW()`);
    values.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING user_id, username, email, profile_picture, bio, xp, role, created_at, updated_at
    `;

    const result = await pool.query(updateQuery, values);
  }

  // Update interests if provided
  if (interests && Array.isArray(interests)) {
    // Delete existing interests
    await pool.query(
      'DELETE FROM studentinterests WHERE studentid = $1',
      [userId]
    );

    // Insert new interests
    if (interests.length > 0) {
      const interestValues = interests.map((interest, index) => 
        `($1, $${index + 2})`
      ).join(', ');
      
      await pool.query(
        `INSERT INTO studentinterests (studentid, interest) VALUES ${interestValues}`,
        [userId, ...interests]
      );
    }
  }

  // Fetch updated user data
  const userResult = await pool.query(
    `SELECT user_id, username, email, profile_picture, bio, xp, role, created_at, updated_at
     FROM users WHERE user_id = $1`,
    [userId]
  );

  const interestsResult = await pool.query(
    `SELECT interest FROM studentinterests WHERE studentid = $1`,
    [userId]
  );

  const user = userResult.rows[0];
  user.interests = interestsResult.rows.map(row => row.interest);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Get current user data
export const getMe = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;

  const userResult = await pool.query(
    `SELECT user_id, username, email, profile_picture, bio, xp, role, created_at, updated_at
     FROM users WHERE user_id = $1`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    return next(new AppError('User not found', 404));
  }

  const user = userResult.rows[0];

  // Get interests
  const interestsResult = await pool.query(
    `SELECT interest FROM studentinterests WHERE studentid = $1`,
    [userId]
  );
  user.interests = interestsResult.rows.map(row => row.interest);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Get dashboard statistics
export const getDashboardStats = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;

  // Get total study time (all time)
  const totalStudyTimeResult = await pool.query(
    `SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (time_stamp - created_at))), 0) as total_seconds
     FROM session
     WHERE user_id = $1`,
    [userId]
  );
  const totalStudyTime = Math.floor(totalStudyTimeResult.rows[0].total_seconds / 60); // in minutes

  // Get weekly study time (last 7 days)
  const weeklyStudyTimeResult = await pool.query(
    `SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (time_stamp - created_at))), 0) as total_seconds
     FROM session
     WHERE user_id = $1 
     AND created_at >= CURRENT_DATE - INTERVAL '7 days'`,
    [userId]
  );
  const weeklyStudyTime = Math.floor(weeklyStudyTimeResult.rows[0].total_seconds / 60); // in minutes

  // Get active communities count
  const activeCommunitiesResult = await pool.query(
    `SELECT COUNT(*) as count
     FROM community_participants
     WHERE user_id = $1`,
    [userId]
  );
  const activeCommunities = parseInt(activeCommunitiesResult.rows[0].count);

  // Get user XP and rank
  const userResult = await pool.query(
    `SELECT xp FROM users WHERE user_id = $1`,
    [userId]
  );
  const userXp = userResult.rows[0].xp || 0;

  // Get user rank
  const rankResult = await pool.query(
    `SELECT COUNT(*) + 1 as rank
     FROM users
     WHERE xp > $1`,
    [userXp]
  );
  const currentRank = parseInt(rankResult.rows[0].rank);

  // Weekly goal (fixed at 1200 minutes or 20 hours)
  const weeklyGoal = 1200;

  res.status(200).json({
    status: 'success',
    data: {
      totalStudyTime,
      weeklyStudyTime,
      weeklyGoal,
      activeCommunities,
      xp: userXp,
      currentRank
    }
  });
});
