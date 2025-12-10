import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get all communities with pagination, filters, and user join status
export const getAllCommunities = catchAsync(async (req, res, next) => {
  const userId = req.user?.user_id;
  const { 
    page = 1, 
    limit = 12, 
    search = '', 
    tags = '',
    sizeMin = '',
    sizeMax = '',
    showJoined = 'all' // 'all', 'joined', 'not-joined'
  } = req.query;

  const p = Math.max(1, parseInt(page, 10));
  const l = Math.min(100, parseInt(limit, 10));
  const offset = (p - 1) * l;

  // Build query conditions
  let conditions = [];
  let params = [];
  let paramCount = 0;

  // Search filter
  if (search && search.trim()) {
    paramCount++;
    conditions.push(`(c.community_Name ILIKE $${paramCount} OR c.community_Description ILIKE $${paramCount})`);
    params.push(`%${search.trim()}%`);
  }

  // Tags filter
  if (tags && tags.trim()) {
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
    if (tagArray.length > 0) {
      paramCount++;
      conditions.push(`c.community_ID IN (
        SELECT community_ID FROM communityTag 
        WHERE tag = ANY($${paramCount})
      )`);
      params.push(tagArray);
    }
  }

  // Size filter (member count)
  if (sizeMin || sizeMax) {
    const sizeConditions = [];
    if (sizeMin) {
      paramCount++;
      sizeConditions.push(`member_count >= $${paramCount}`);
      params.push(parseInt(sizeMin, 10));
    }
    if (sizeMax) {
      paramCount++;
      sizeConditions.push(`member_count <= $${paramCount}`);
      params.push(parseInt(sizeMax, 10));
    }
    if (sizeConditions.length > 0) {
      conditions.push(`(${sizeConditions.join(' AND ')})`);
    }
  }

  // Show joined filter
  if (userId && showJoined !== 'all') {
    if (showJoined === 'joined') {
      paramCount++;
      conditions.push(`cp.user_id = $${paramCount} AND cp.Member_Status = 'Accepted'`);
      params.push(userId);
    } else if (showJoined === 'not-joined') {
      paramCount++;
      conditions.push(`(cp.user_id IS NULL OR cp.user_id != $${paramCount} OR cp.Member_Status != 'Accepted')`);
      params.push(userId);
    }
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count query
  const countQuery = `
    SELECT COUNT(DISTINCT c.community_ID)::int AS total
    FROM community c
    LEFT JOIN (
      SELECT community_ID, COUNT(*) as member_count
      FROM community_Participants
      WHERE Member_Status = 'Accepted'
      GROUP BY community_ID
    ) mc ON c.community_ID = mc.community_ID
    ${userId ? `LEFT JOIN community_Participants cp ON c.community_ID = cp.community_ID` : ''}
    ${whereClause}
  `;

  // Data query with pagination params at the end
  const userIdParam = userId ? paramCount + 1 : null;
  const limitParam = userIdParam ? userIdParam + 1 : paramCount + 1;
  const offsetParam = limitParam + 1;

  const dataQuery = `
    SELECT 
      c.community_ID,
      c.community_Name,
      c.community_Description,
      c.community_Creator,
      COALESCE(mc.member_count, 0) as member_count,
      ARRAY_AGG(DISTINCT ct.tag) FILTER (WHERE ct.tag IS NOT NULL) as tags,
      ${userId ? `
        CASE 
          WHEN cp.Member_Status = 'Accepted' THEN 'Accepted'
          WHEN cp.Member_Status = 'Pending' THEN 'Pending'
          ELSE 'Not Joined'
        END as user_status,
        CASE 
          WHEN cm.moderator_ID IS NOT NULL THEN true
          ELSE false
        END as is_moderator
      ` : `'Not Joined' as user_status, false as is_moderator`}
    FROM community c
    LEFT JOIN (
      SELECT community_ID, COUNT(*) as member_count
      FROM community_Participants
      WHERE Member_Status = 'Accepted'
      GROUP BY community_ID
    ) mc ON c.community_ID = mc.community_ID
    LEFT JOIN communityTag ct ON c.community_ID = ct.community_ID
    ${userId ? `LEFT JOIN community_Participants cp ON c.community_ID = cp.community_ID AND cp.user_id = $${userIdParam}` : ''}
    ${userId ? `LEFT JOIN communityManagers cm ON c.community_ID = cm.community_ID AND cm.moderator_ID = $${userIdParam}` : ''}
    ${whereClause}
    GROUP BY c.community_ID, c.community_Name, c.community_Description, c.community_Creator, mc.member_count, cp.Member_Status, cm.moderator_ID
    ORDER BY 
      CASE WHEN ${userId ? `cp.Member_Status = 'Accepted'` : 'false'} THEN 0 ELSE 1 END,
      c.community_Name ASC
    LIMIT $${limitParam} OFFSET $${offsetParam}
  `;

  const countParams = userId ? [...params] : params;
  const dataParams = [...params];
  if (userId) {
    dataParams.push(userId);
  }
  dataParams.push(l, offset);

  const [countResult, dataResult] = await Promise.all([
    db.query(countQuery, countParams),
    db.query(dataQuery, dataParams)
  ]);

  const totalRows = countResult.rows[0].total;
  const totalPages = Math.ceil(totalRows / l);

  res.status(200).json({
    status: 'success',
    results: dataResult.rows.length,
    data: {
      communities: dataResult.rows,
      page: p,
      limit: l,
      totalRows,
      totalPages
    }
  });
});

// Get all unique tags from all communities
export const getAllTags = catchAsync(async (req, res, next) => {
  const query = `
    SELECT DISTINCT tag, COUNT(*) as count
    FROM communityTag
    GROUP BY tag
    ORDER BY count DESC, tag ASC
  `;
  
  const result = await db.query(query);
  
  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      tags: result.rows
    }
  });
});

// Join a community (create pending membership)
export const joinCommunity = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { communityId } = req.params;

  // Check if community exists
  const communityCheck = await db.query(
    'SELECT community_ID FROM community WHERE community_ID = $1',
    [communityId]
  );

  if (communityCheck.rows.length === 0) {
    return next(new AppError('Community not found', 404));
  }

  // Check if user already has a membership
  const memberCheck = await db.query(
    'SELECT Member_Status FROM community_Participants WHERE community_ID = $1 AND user_id = $2',
    [communityId, userId]
  );

  if (memberCheck.rows.length > 0) {
    const status = memberCheck.rows[0].member_status;
    if (status === 'Pending') {
      return next(new AppError('Join request already pending', 400));
    }
    if (status === 'Accepted') {
      return next(new AppError('Already a member of this community', 400));
    }
    // If status was 'Left', update it to 'Pending'
    await db.query(
      `UPDATE community_Participants 
       SET Member_Status = 'Pending', Join_Date = NOW(), Leave_Date = NULL
       WHERE community_ID = $1 AND user_id = $2
       RETURNING *`,
      [communityId, userId]
    );
  } else {
    // Create new pending membership
    await db.query(
      `INSERT INTO community_Participants (community_ID, user_id, Join_Date, Member_Status)
       VALUES ($1, $2, NOW(), 'Pending')`,
      [communityId, userId]
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Join request sent successfully',
    data: {
      user_status: 'Pending'
    }
  });
});

// Leave a community
export const leaveCommunity = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { communityId } = req.params;

  // Check if user is a member
  const memberCheck = await db.query(
    'SELECT Member_Status FROM community_Participants WHERE community_ID = $1 AND user_id = $2',
    [communityId, userId]
  );

  if (memberCheck.rows.length === 0) {
    return next(new AppError('You are not a member of this community', 400));
  }

  const status = memberCheck.rows[0].member_status;
  if (status === 'Left') {
    return next(new AppError('You have already left this community', 400));
  }

  // Update membership status to 'Left'
  await db.query(
    `UPDATE community_Participants 
     SET Member_Status = 'Left', Leave_Date = NOW()
     WHERE community_ID = $1 AND user_id = $2`,
    [communityId, userId]
  );

  res.status(200).json({
    status: 'success',
    message: 'Successfully left the community',
    data: {
      user_status: 'Not Joined'
    }
  });
});

// Create a new community
export const createCommunity = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { community_Name, community_Description, tags = [] } = req.body;

  if (!community_Name || community_Name.trim() === '') {
    return next(new AppError('Community name is required', 400));
  }
  if (!community_Description || community_Description.trim() === '') {
    return next(new AppError('Community description is required', 400));
  }

  // Insert community
  const query = `
    INSERT INTO community (community_Name, community_Description, community_Creator)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const result = await db.query(query, [community_Name.trim(), community_Description.trim(), userId]);
  const community = result.rows[0];

  // Auto-accept creator as member
  await db.query(
    `INSERT INTO community_Participants (community_ID, user_id, Join_Date, Member_Status)
     VALUES ($1, $2, NOW(), 'Accepted')`,
    [community.community_id, userId]
  );

  // Add creator as community manager
  await db.query(
    `INSERT INTO communityManagers (moderator_ID, community_ID)
     VALUES ($1, $2)`,
    [userId, community.community_id]
  );

  // Add tags if provided
  if (tags && Array.isArray(tags) && tags.length > 0) {
    for (const tag of tags) {
      if (tag && tag.trim()) {
        await db.query(
          'INSERT INTO communityTag (tag, community_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [tag.trim().toLowerCase(), community.community_id]
        );
      }
    }
  }

  res.status(201).json({
    status: 'success',
    data: {
      community
    }
  });
});


