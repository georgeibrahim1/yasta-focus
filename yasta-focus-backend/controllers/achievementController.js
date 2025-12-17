import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import {checkLevelAchievement,checkXPAchievement} from '../utils/achievementHelper.js';

// Get all achievements
export const getAllAchievements = catchAsync(async (req, res, next) =>{
    const userID = req.user.user_id;
    const query =`SELECT a.*, (ua.userid IS NOT NULL) AS unlocked
    FROM achievement a
    LEFT JOIN userachievements ua
    ON a.id = ua.achievementid AND ua.userid = $1
    ORDER BY a.criteriatype, a.criteriavalue;`
    const result = await db.query(query,[userID]);

    res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      achievements: result.rows
    }
  });
});

//Get totalXP of user, count of unlocked achievements, and count of total achievements
export const getUserAchievementStats = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  
  const query = `
    SELECT 
      u.xp as "totalXP",
      COUNT(ua.achievementid) as "unlockedCount",
      (SELECT COUNT(*) FROM achievement) as "totalAchievements"
    FROM users u
    LEFT JOIN userachievements ua ON ua.userid = u.user_id
    WHERE u.user_id = $1
    GROUP BY u.xp, u.user_id
  `;

  //u.user_id is added in GROUP BY cuz PostgreSQL's query parser doesn't know that this guarantees only one row. (ERROR)
  
  const result = await db.query(query, [userId]);
  const stats = result.rows[0];

    if (!stats){
        return res.status(404).json({
        status: 'fail',
        message: 'User not found'
    });
    }

  const xpPerLevel = 100;
  const level = Math.floor(stats.totalXP / xpPerLevel);
  const xpInCurrentLevel = stats.totalXP % xpPerLevel;
  const xpToNextLevel = xpPerLevel - xpInCurrentLevel;

  const lvl = await checkLevelAchievement(userId,level);
  const xp = await checkXPAchievement(userId,stats.totalXP);
  const lvlArray = Array.isArray(lvl) ? lvl : [];
  const xpArray = Array.isArray(xp) ? xp : [];
  const unlockedAchievements = [...lvlArray, ...xpArray];

  res.status(200).json({
    status: 'success',
    data: {
      level,
      totalXP: parseInt(stats.totalXP),
      xpInCurrentLevel,
      xpToNextLevel,
      unlockedCount: parseInt(stats.unlockedCount),
      totalAchievements: parseInt(stats.totalAchievements),
      unlockedAchievements: unlockedAchievements.map(a => ({
      id: a.id,
      title: a.title,
      xp: a.xp
    }))
    }
  });
});

// controllers/achievementController.js

// ... your existing imports and functions ...

// Create new achievement (ADMIN ONLY)
export const createAchievement = catchAsync(async (req, res, next) => {
  const { picture, title, description, criteriatype, criteriavalue, xp } = req.body;

  if (!title || !criteriatype || !description || criteriavalue === undefined || !xp) {
    return next(new AppError('Please provide title, criteriatype, criteriavalue, and xp', 400));
  }

  const query = `
    INSERT INTO achievement (picture,title, description, criteriatype, criteriavalue, xp)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const result = await db.query(query, [
    picture || "🌟",
    title,
    description,
    criteriatype,
    criteriavalue,
    xp
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      achievement: result.rows[0]
    }
  });
});

// Update achievement (ADMIN ONLY)
export const updateAchievement = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, criteriatype, criteriavalue, xp } = req.body;

  // Check if achievement exists
  const checkQuery = 'SELECT * FROM achievement WHERE id = $1';
  const checkResult = await db.query(checkQuery, [id]);

  if (checkResult.rows.length === 0) {
    return next(new AppError('Achievement not found', 404));
  }

  const query = `
    UPDATE achievement
    SET 
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      criteriatype = COALESCE($3, criteriatype),
      criteriavalue = COALESCE($4, criteriavalue),
      xp = COALESCE($5, xp)
    WHERE id = $6
    RETURNING *
  `;

  const result = await db.query(query, [
    title,
    description,
    criteriatype,
    criteriavalue,
    xp,
    id
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      achievement: result.rows[0]
    }
  });
});

// Delete achievement (ADMIN ONLY)
export const deleteAchievement = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Check if achievement exists
  const checkQuery = 'SELECT * FROM achievement WHERE id = $1';
  const checkResult = await db.query(checkQuery, [id]);

  if (checkResult.rows.length === 0) {
    return next(new AppError('Achievement not found', 404));
  }

  // Delete the achievement
  await db.query('DELETE FROM achievement WHERE id = $1', [id]);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get all achievements for admin (without user-specific unlocked status)
export const getAdminAchievements = catchAsync(async (req, res, next) => {
  const query = `
    SELECT *
    FROM achievement
    ORDER BY criteriatype, criteriavalue ASC
  `;
  
  const result = await db.query(query);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      achievements: result.rows
    }
  });
});