import db from '../db.js';
import catchAsync from './catchAsync.js';

/**
 * Check and unlock achievements based on criteria
 * @param {string} user_id - The user's ID
 * @param {string} criteriatype - Type of achievement (e.g., 'study sessions', 'tasks', 'groups')
 * @param {number} currentvalue - Current count/value for the criteria
 * @returns {Promise<Array>} Array of newly unlocked achievements
 */
export const checkAndUnlockAchievements = catchAsync(async (user_id, criteriatype, currentvalue) => {
    // Find achievements that should be unlocked but aren't yet
    const query = `
      SELECT a.id, a.title, a.xp
      FROM achievement a
      WHERE a.criteriatype = $1
        AND a.criteriavalue <= $2
        AND NOT EXISTS (
          SELECT * 
          FROM userachievements ua 
          WHERE ua.userid = $3 AND ua.achievementid = a.id
        )
    `;

    const result = await db.query(query, [criteriatype, currentvalue, user_id]);
    const achievementsToUnlock = result.rows;

    // Unlock each achievement
    const unlockedAchievements = [];
    for (const achievement of achievementsToUnlock) {
      await db.query(
        'INSERT INTO userachievements (userid, achievementid) VALUES ($1, $2) ON CONFLICT DO NOTHING',//Try to insert, but if it already exists, skip it safely.
        [user_id, achievement.id]
      );
      // Update user's XP by adding the achievement's XP
      await db.query(
        'UPDATE users SET xp = xp + $1 WHERE user_id = $2',
        [achievement.xp, user_id]
      );
      unlockedAchievements.push(achievement);
    }
    return unlockedAchievements;
});

/**
 * Check achievements for study sessions
 * @param {string} user_id 
 * @returns {Promise<Array>} Newly unlocked achievements
 */
export const checkStudySessionAchievements = catchAsync(async (user_id) => {
  const { rows } = await db.query(
    'SELECT COUNT(*) as count FROM session WHERE user_id = $1',
    [user_id]
  );
  const sessionCount = parseInt(rows[0].count);
  return await checkAndUnlockAchievements(user_id, 'sessions', sessionCount);
});

export const checkStudyFocusSessionAchievements = catchAsync(async (user_id) => {
  const { rows } = await db.query(
    'SELECT COUNT(*) as count FROM session WHERE user_id = $1 AND TYPE=\'focus\'',
    [user_id]
  );
  const sessionCount = parseInt(rows[0].count);
  return await checkAndUnlockAchievements(user_id, 'Focus_sessions', sessionCount);
});

/**
 * Check achievements for study time (in minutes)
 * @param {string} user_id 
 * @returns {Promise<Array>} Newly unlocked achievements
 */
export const checkStudyTimeAchievements = catchAsync(async (user_id) => {
  const { rows } = await db.query(
    'SELECT COALESCE(FLOOR(SUM(EXTRACT(EPOCH FROM (time_stamp - created_at))) / 60), 0) as total_min FROM session WHERE user_id = $1',
    [user_id]
  );
  const totalmin = parseInt(rows[0].total_min);
  return await checkAndUnlockAchievements(user_id, 'time', totalmin);
});

export const checkTodaySessionAchievements = catchAsync(async (user_id) => {
  const { rows } = await db.query(
     `SELECT COUNT(*) as count
     FROM session
     WHERE user_id = $1 
       AND created_at >= CURRENT_DATE 
       AND created_at < CURRENT_DATE + INTERVAL '1 day'`,
    [user_id]
  );
  const count = parseInt(rows[0].count);
  return await checkAndUnlockAchievements(user_id,'SessionCount',count)
});

// /**
//  * Check achievements for tasks completed
//  * @param {string} user_id 
//  * @returns {Promise<Array>} Newly unlocked achievements
//  */
// export const checkTaskAchievements = catchAsync(async (user_id) => {
//   const { rows } = await db.query(
//     'SELECT COUNT(*) as count FROM tasks WHERE user_id = $1 AND completed = true',
//     [user_id]
//   );
//   const taskCount = parseInt(rows[0].count);
//   return await checkAndUnlockAchievements(user_id, 'tasks', taskCount);
// });

/**
 * Check achievements for groups/communities
 * @param {string} user_id 
 * @returns {Promise<Array>} Newly unlocked achievements
 */
export const checkCommunitiesJoinedAchievements = catchAsync(async (user_id) => {
  // Check number of communities joined
   const { rows } = await db.query(
    `SELECT COUNT(*) as count 
     FROM community_participants cp
     JOIN community c ON cp.community_id = c.community_id
     WHERE cp.user_id = $1
     AND cp.member_status = 'Accepted'
     AND c.community_creator != $1`,  
    [user_id]
  );
  const groupCount = parseInt(rows[0].count);
  console.log(groupCount);
  return await checkAndUnlockAchievements(user_id, 'communitiesJoined', groupCount);
});

export const checkCommunitiesCreatedAchievements = catchAsync(async (user_id) => {
  // Check number of communities joined
  const { rows } = await db.query(
    'SELECT COUNT(*) as count FROM community WHERE community_creator = $1',
    [user_id]
  );
  const groupCount = parseInt(rows[0].count);
  return await checkAndUnlockAchievements(user_id, 'communitiesCreated', groupCount);
});

export const checkCommunityCountdAchievements = catchAsync(async (user_id) => {
  // Check number of members joined to user's community
  const { rows } = await db.query(
    `SELECT COALESCE(MAX(member_count), 0) as max_members
     FROM (
       SELECT COUNT(*) as member_count
       FROM community_participants cp
       JOIN community c ON cp.community_id = c.community_id
       WHERE c.community_creator = $1
       GROUP BY c.community_id
     ) as community_sizes`, [user_id]
  );
  const groupCount = parseInt(rows[0].max_members);
  return await checkAndUnlockAchievements(user_id, 'communitiesCount', groupCount);
});

/**
 * Check achievements for leaderboard position
 * @param {string} user_id 
 * @param {number} position - Current leaderboard position
 * @returns {Promise<Array>} Newly unlocked achievements
 */
// export const checkLeaderboardAchievements = catchAsync(async (user_id, position) => {
//   return await checkAndUnlockAchievements(user_id, 'leaderboard', position);
// });

// /**
//  * Check all achievement types for a user
//  * @param {string} user_id 
//  * @returns {Promise<Object>} Object with all newly unlocked achievements by type
//  */
// export const checkAllAchievements = catchAsync(async (user_id) => {
//   const results = {
//     sessions: await checkStudySessionAchievements(user_id),
//     studytime: await checkStudyTimeAchievements(user_id),
//     // tasks: await checkTaskAchievements(user_id),
//     communitiesJoined: await checkCommunitiesJoinedAchievements(user_id),
//     communitiesCreated: await checkCommunitiesCreatedAchievements(user_id),
//   };

//   // Flatten all unlocked achievements
//   const allUnlocked = [
//     ...results.sessions,
//     ...results.studytime,
//     // ...results.tasks,
//     ...results.communitiesJoined,
//     ...results.communitiesCreated,
//   ];

//   return {
//     achievements: results,
//     totalUnlocked: allUnlocked.length,
//     allUnlocked,
//   };
// });

/**
 * Get notification data for newly unlocked achievement
 * @param {Object} achievement - The unlocked achievement
 * @returns {Object} Notification data
 */
export const getAchievementNotification = (achievement) => {
  return {
    type: 'achievement_unlocked',
    title: 'Achievement Unlocked!',
    message: `You've unlocked: ${achievement.title}`,
    xp: achievement.xp,
    achievementId: achievement.id,
  };
};