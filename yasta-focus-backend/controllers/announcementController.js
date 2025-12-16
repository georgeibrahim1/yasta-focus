import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get all announcements for a community
export const getAnnouncements = catchAsync(async (req, res, next) => {
  const { communityId } = req.params;

  const result = await db.query(
    `SELECT 
      a.*,
      json_build_object(
        'user_id', u.user_id,
        'username', u.username,
        'profile_pic', u.profile_picture
      ) as creator
    FROM announcement a
    LEFT JOIN users u ON a.moderator_id = u.user_id
    WHERE a.community_ID = $1
    ORDER BY a.created_At DESC`,
    [communityId]
  );

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      announcements: result.rows
    }
  });
});

// Create an announcement (managers only)
export const createAnnouncement = catchAsync(async (req, res, next) => {
  const { communityId } = req.params;
  const { content } = req.body;
  const userId = req.user.user_id;

  if (!content) {
    return next(new AppError('Announcement content is required', 400));
  }

  // Check if user is admin or a manager of the community
  const isAdmin = req.user.role === 0;
  
  if (!isAdmin) {
    const managerCheck = await db.query(
      'SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2',
      [communityId, userId]
    );

    if (managerCheck.rows.length === 0) {
      return next(new AppError('Only community managers can create announcements', 403));
    }
  }

  // Get the next announcement_num for this community and moderator
  const maxNumResult = await db.query(
    `SELECT COALESCE(MAX(announcement_num), 0) + 1 as next_num 
     FROM announcement 
     WHERE moderator_id = $1 AND community_id = $2`,
    [userId, communityId]
  );
  const nextNum = maxNumResult.rows[0].next_num;

  // Create the announcement
  const announcementResult = await db.query(
    `INSERT INTO announcement (announcement_num, moderator_id, community_ID, content)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [nextNum, userId, communityId, content]
  );

  const announcement = announcementResult.rows[0];

  // Get creator info
  const creatorResult = await db.query(
    'SELECT user_id, username, profile_picture FROM users WHERE user_id = $1',
    [userId]
  );

  announcement.creator = creatorResult.rows[0];

  res.status(201).json({
    status: 'success',
    data: {
      announcement
    }
  });
});

// Delete an announcement (creator or managers only)
export const deleteAnnouncement = catchAsync(async (req, res, next) => {
  const { announcementNum, moderatorId, communityId } = req.params;
  const userId = req.user.user_id;

  // Get the announcement
  const announcementResult = await db.query(
    'SELECT * FROM announcement WHERE announcement_num = $1 AND moderator_id = $2 AND community_id = $3',
    [announcementNum, moderatorId, communityId]
  );

  if (announcementResult.rows.length === 0) {
    return next(new AppError('Announcement not found', 404));
  }

  const announcement = announcementResult.rows[0];

  // Check if user is admin, the creator, or a manager
  const isAdmin = req.user.role === 0;
  
  if (!isAdmin && announcement.moderator_id !== userId) {
    const managerCheck = await db.query(
      'SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2',
      [announcement.community_id, userId]
    );

    if (managerCheck.rows.length === 0) {
      return next(new AppError('You do not have permission to delete this announcement', 403));
    }
  }

  // Delete the announcement
  await db.query(
    'DELETE FROM announcement WHERE announcement_num = $1 AND moderator_id = $2 AND community_id = $3',
    [announcementNum, moderatorId, communityId]
  );

  res.status(204).json({
    status: 'success',
    data: null
  });
});
