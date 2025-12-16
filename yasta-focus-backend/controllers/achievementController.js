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
  const unlockedAchievements = [...(lvl||[]),...(xp||[])];

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