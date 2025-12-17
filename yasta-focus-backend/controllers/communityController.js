import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import {checkCommunitiesJoinedAchievements,checkCommunitiesCreatedAchievements, checkCommunityCountdAchievements } from '../utils/achievementHelper.js';

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

  // Mark admin users as managers for all communities
  const communities = dataResult.rows.map(community => ({
    ...community,
    ismanager: req.user?.role === 0 ? true : community.is_moderator
  }));

  res.status(200).json({
    status: 'success',
    results: communities.length,
    data: {
      communities,
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
    const status = memberCheck.rows[0].member_status || memberCheck.rows[0].Member_Status;
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

  const status = memberCheck.rows[0].member_status || memberCheck.rows[0].Member_Status;
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
// export const createCommunity = catchAsync(async (req, res, next) => {
//   const userId = req.user.user_id;
//   const { community_Name, community_Description, tags = [] } = req.body;

//   if (!community_Name || community_Name.trim() === '') {
//     return next(new AppError('Community name is required', 400));
//   }
//   if (!community_Description || community_Description.trim() === '') {
//     return next(new AppError('Community description is required', 400));
//   }

//   // Insert community
//   const query = `
//     INSERT INTO community (community_Name, community_Description, community_Creator)
//     VALUES ($1, $2, $3)
//     RETURNING *
//   `;
//   const result = await db.query(query, [community_Name.trim(), community_Description.trim(), userId]);
//   const community = result.rows[0];

//   // Auto-accept creator as member
//   await db.query(
//     `INSERT INTO community_Participants (community_ID, user_id, Join_Date, Member_Status)
//      VALUES ($1, $2, NOW(), 'Accepted')`,
//     [community.community_id, userId]
//   );

//   // Add creator as community manager
//   await db.query(
//     `INSERT INTO communityManagers (moderator_ID, community_ID)
//      VALUES ($1, $2)`,
//     [userId, community.community_id]
//   );

//   // Add tags if provided
//   if (tags && Array.isArray(tags) && tags.length > 0) {
//     for (const tag of tags) {
//       if (tag && tag.trim()) {
//         await db.query(
//           'INSERT INTO communityTag (tag, community_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING',
//           [tag.trim().toLowerCase(), community.community_id]
//         );
//       }
//     }
//   }

//   res.status(201).json({
//     status: 'success',
//     data: {
//       community
//     }
//   });
// });
export const createCommunity = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const { community_Name, community_Description, tags = [] } = req.body;

  if (!community_Name || community_Name.trim() === '') {
    return next(new AppError('Community name is required', 400));
  }
  if (!community_Description || community_Description.trim() === '') {
    return next(new AppError('Community description is required', 400));
  }

  // Use procedure for first tag (or null)
  const firstTag = tags && Array.isArray(tags) && tags.length > 0 ? tags[0].trim().toLowerCase() : null;
  
  await db.query(
    'CALL create_community_full($1, $2, $3, $4)',
    [community_Name.trim(), community_Description.trim(), userId, firstTag]
  );

  // Fetch the created community
  const result = await db.query(
    'SELECT * FROM community WHERE community_Creator = $1 AND community_Name = $2 ORDER BY community_ID DESC LIMIT 1',
    [userId, community_Name.trim()]
  );
  const community = result.rows[0];

  // Auto-accept creator as member
  await db.query(
    `INSERT INTO community_Participants (community_ID, user_id, Join_Date, Member_Status)
     VALUES ($1, $2, NOW(), 'Accepted')`,
    [community.community_id, userId]
  );

  // Add remaining tags if there are more than one
  if (tags && Array.isArray(tags) && tags.length > 1) {
    for (let i = 1; i < tags.length; i++) {
      const tag = tags[i];
      if (tag && tag.trim()) {
        await db.query(
          'INSERT INTO communityTag (tag, community_ID) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [tag.trim().toLowerCase(), community.community_id]
        );
      }
    }
  }


  const createdCommunities = await checkCommunitiesCreatedAchievements(userId);
  const unlockedAchievements = Array.isArray(createdCommunities) ? createdCommunities : [];

  res.status(201).json({
    status: 'success',
    data: {
      community,
      unlockedAchievements: unlockedAchievements.map(a => ({
        id: a.id,
        title: a.title,
        xp: a.xp
      }))
    }
  });
});

// Get community statistics (for managers/admins)
export const getCommunityStats = catchAsync(async (req, res, next) => {
  const { communityId } = req.params;
  const userId = req.user?.user_id;

  // Check if community exists
  const communityResult = await db.query(
    'SELECT * FROM community WHERE community_ID = $1',
    [communityId]
  );

  if (communityResult.rows.length === 0) {
    return next(new AppError('Community not found', 404));
  }

  // Check if user is admin or a manager
  const isAdmin = req.user.role === 0;
  
  if (!isAdmin) {
    const managerResult = await db.query(
      'SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2',
      [communityId, userId]
    );

    if (managerResult.rows.length === 0) {
      return next(new AppError('Only community managers can view statistics', 403));
    }
  }

  // Get total member count (current)
  const totalMembersResult = await db.query(`
    SELECT COUNT(*) as total_members
    FROM community_Participants
    WHERE community_ID = $1 AND Member_Status = 'Accepted'
  `, [communityId]);

  // Get left members count
  const leftMembersResult = await db.query(`
    SELECT COUNT(*) as left_members
    FROM community_Participants
    WHERE community_ID = $1 AND Member_Status = 'Left'
  `, [communityId]);

  // Get joined members per day (last 7 days)
  const joinedPerDayResult = await db.query(`
    SELECT 
      DATE(join_Date) as date,
      COUNT(*) as joined
    FROM community_Participants
    WHERE community_ID = $1 
      AND Member_Status = 'Accepted'
      AND join_Date >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(join_Date)
    ORDER BY date DESC
  `, [communityId]);

  // Get joined members per week (last 4 weeks)
  const joinedPerWeekResult = await db.query(`
    SELECT 
      DATE_TRUNC('week', join_Date) as week,
      COUNT(*) as joined
    FROM community_Participants
    WHERE community_ID = $1 
      AND Member_Status = 'Accepted'
      AND join_Date >= NOW() - INTERVAL '4 weeks'
    GROUP BY DATE_TRUNC('week', join_Date)
    ORDER BY week DESC
  `, [communityId]);

  // Get joined members per month (last 6 months)
  const joinedPerMonthResult = await db.query(`
    SELECT 
      DATE_TRUNC('month', join_Date) as month,
      COUNT(*) as joined
    FROM community_Participants
    WHERE community_ID = $1 
      AND Member_Status = 'Accepted'
      AND join_Date >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', join_Date)
    ORDER BY month DESC
  `, [communityId]);

  // Get total study rooms count
  const totalRoomsResult = await db.query(`
    SELECT COUNT(*) as total_rooms
    FROM studyRoom
    WHERE community_ID = $1
  `, [communityId]);

  // Get active study rooms (with members)
  const activeRoomsResult = await db.query(`
    SELECT COUNT(DISTINCT sr.room_Code) as active_rooms
    FROM studyRoom sr
    JOIN studyRoom_Members sm ON sr.room_Code = sm.room_Code
    WHERE sr.community_ID = $1
  `, [communityId]);

  const stats = {
    totalMembers: parseInt(totalMembersResult.rows[0].total_members),
    leftMembers: parseInt(leftMembersResult.rows[0].left_members),
    totalRooms: parseInt(totalRoomsResult.rows[0].total_rooms),
    activeRooms: parseInt(activeRoomsResult.rows[0].active_rooms),
    joinedPerDay: joinedPerDayResult.rows.map(row => ({
      date: row.date,
      joined: parseInt(row.joined)
    })),
    joinedPerWeek: joinedPerWeekResult.rows.map(row => ({
      week: row.week,
      joined: parseInt(row.joined)
    })),
    joinedPerMonth: joinedPerMonthResult.rows.map(row => ({
      month: row.month,
      joined: parseInt(row.joined)
    }))
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

// Update community info (managers only)
export const updateCommunityInfo = catchAsync(async (req, res, next) => {
  const { communityId } = req.params;
  const userId = req.user?.user_id;
  const { community_Name, community_Description } = req.body;

  // Check if user is admin or a manager
  const isAdmin = req.user.role === 0;
  
  if (!isAdmin) {
    const managerResult = await db.query(
      'SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2',
      [communityId, userId]
    );

    if (managerResult.rows.length === 0) {
      return next(new AppError('Only community managers can update community info', 403));
    }
  }

  const updates = [];
  const params = [];
  let paramCount = 0;

  if (community_Name) {
    paramCount++;
    updates.push(`community_Name = $${paramCount}`);
    params.push(community_Name);
  }

  if (community_Description) {
    paramCount++;
    updates.push(`community_Description = $${paramCount}`);
    params.push(community_Description);
  }

  if (updates.length === 0) {
    return next(new AppError('No valid fields to update', 400));
  }

  paramCount++;
  params.push(communityId);

  const updateQuery = `
    UPDATE community
    SET ${updates.join(', ')}
    WHERE community_ID = $${paramCount}
    RETURNING *
  `;

  const result = await db.query(updateQuery, params);

  res.status(200).json({
    status: 'success',
    data: {
      community: result.rows[0]
    }
  });
});

// Update member bio
export const updateMemberBio = catchAsync(async (req, res, next) => {
  const { communityId } = req.params;
  const userId = req.user?.user_id;
  const { bio } = req.body;

  // Check if user is a member
  const memberResult = await db.query(
    'SELECT * FROM community_Participants WHERE community_ID = $1 AND user_id = $2 AND Member_Status = \'Accepted\'',
    [communityId, userId]
  );

  if (memberResult.rows.length === 0) {
    return next(new AppError('You must be a member of this community to update your bio', 403));
  }

  // Update the member bio
  const result = await db.query(
    `UPDATE community_Participants
     SET Member_Bio = $1
     WHERE community_ID = $2 AND user_id = $3
     RETURNING *`,
    [bio || '', communityId, userId]
  );

  res.status(200).json({
    status: 'success',
    data: {
      participant: result.rows[0]
    }
  });
});

// Remove member (managers only)
export const removeMember = catchAsync(async (req, res, next) => {
  const { communityId, memberId } = req.params;
  const userId = req.user?.user_id;

  // Check if user is admin or a manager
  const isAdmin = req.user.role === 0;
  
  if (!isAdmin) {
    const managerResult = await db.query(
      'SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2',
      [communityId, userId]
    );

    if (managerResult.rows.length === 0) {
      return next(new AppError('Only community managers can remove members', 403));
    }
  }

  // Cannot remove other managers
  const targetManagerResult = await db.query(
    'SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2',
    [communityId, memberId]
  );

  if (targetManagerResult.rows.length > 0) {
    return next(new AppError('Cannot remove other managers', 400));
  }

  // Remove member from all study rooms in this community
  await db.query(
    'DELETE FROM studyRoom_Members WHERE community_ID = $1 AND student_ID = $2',
    [communityId, memberId]
  );

  // Remove member from the community
  await db.query(
    'DELETE FROM community_Participants WHERE community_ID = $1 AND user_id = $2',
    [communityId, memberId]
  );

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get all members of a community with manager status
export const getCommunityMembers = catchAsync(async (req, res, next) => {
  const { communityId } = req.params;
  const userId = req.user?.user_id;

  // Check if community exists and get info
  const communityResult = await db.query(
    'SELECT * FROM community WHERE community_ID = $1',
    [communityId]
  );

  if (communityResult.rows.length === 0) {
    return next(new AppError('Community not found', 404));
  }

  const community = communityResult.rows[0];

  // Get all accepted members with their info and manager status
  const membersResult = await db.query(`
    SELECT 
      u.user_id,
      u.username,
      u.profile_picture,
      u.bio,
      u.xp,
      cp.member_bio,
      cp.join_date,
      CASE WHEN cm.moderator_id IS NOT NULL THEN true ELSE false END as is_manager,
      CASE 
        WHEN f.status = 'Accepted' THEN 'friends'
        WHEN f.requesterid = $2 AND f.status = 'Pending' THEN 'pending_sent'
        WHEN f.requesteeid = $2 AND f.status = 'Pending' THEN 'pending_received'
        ELSE 'none'
      END as friendship_status
    FROM community_Participants cp
    JOIN users u ON cp.user_id = u.user_id
    LEFT JOIN communityManagers cm ON cp.community_ID = cm.community_ID AND cp.user_id = cm.moderator_id
    LEFT JOIN friendship f ON (
      (f.requesterid = u.user_id AND f.requesteeid = $2) OR 
      (f.requesteeid = u.user_id AND f.requesterid = $2)
    )
    WHERE cp.community_ID = $1 AND cp.Member_Status = 'Accepted'
    ORDER BY is_manager DESC, u.username ASC
  `, [communityId, userId]);

  // Check if current user is a manager or admin
  const currentUserIsManager = req.user?.role === 0 || membersResult.rows.some(
    member => member.user_id === userId && member.is_manager
  );

  // Get total study rooms count
  const roomsResult = await db.query(
    'SELECT COUNT(*) as total_rooms FROM studyRoom WHERE community_ID = $1',
    [communityId]
  );

  res.status(200).json({
    status: 'success',
    results: membersResult.rows.length,
    data: {
      community: {
        community_id: community.community_id,
        community_name: community.community_name,
        community_description: community.community_description,
        community_creator: community.community_creator,
        total_members: membersResult.rows.length,
        total_rooms: parseInt(roomsResult.rows[0].total_rooms)
      },
      members: membersResult.rows,
      currentUserIsManager
    }
  });
});

// Delete community (managers only)
export const deleteCommunity = catchAsync(async (req, res, next) => {
  const { communityId } = req.params;
  const userId = req.user?.user_id;

  // Check if user is admin or a manager
  const isAdmin = req.user.role === 0;
  
  if (!isAdmin) {
    const managerResult = await db.query(
      'SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_id = $2',
      [communityId, userId]
    );

    if (managerResult.rows.length === 0) {
      return next(new AppError('Only community managers can delete the community', 403));
    }
  }

  // Delete announcements first (if foreign key doesn't have CASCADE)
  await db.query(
    'DELETE FROM announcement WHERE community_ID = $1',
    [communityId]
  );

  // Delete community managers
  await db.query(
    'DELETE FROM communityManagers WHERE community_ID = $1',
    [communityId]
  );

  // Delete community tags
  await db.query(
    'DELETE FROM communityTag WHERE community_ID = $1',
    [communityId]
  );

  // Delete community (other cascade deletes will handle remaining tables like community_Participants, studyRoom, etc.)
  await db.query(
    'DELETE FROM community WHERE community_ID = $1',
    [communityId]
  );

  res.status(204).json({
    status: 'success',
    data: null
  });
});


// Get pending join requests (managers only)
export const getPendingRequests = catchAsync(async (req, res, next) => {
  const { communityId } = req.params;
  const userId = req.user?.user_id;

  // Check if user is admin or a manager
  const isAdmin = req.user.role === 0;
  
  if (!isAdmin) {
    const managerResult = await db.query(
      'SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2',
      [communityId, userId]
    );

    if (managerResult.rows.length === 0) {
      return next(new AppError('Only community managers can view pending requests', 403));
    }
  }

  // Get all pending members
  const pendingResult = await db.query(`
    SELECT 
      u.user_id,
      u.username,
      u.profile_picture,
      u.bio,
      u.xp,
      cp.join_date
    FROM community_Participants cp
    JOIN users u ON cp.user_id = u.user_id
    WHERE cp.community_ID = $1 AND cp.Member_Status = 'Pending'
    ORDER BY cp.join_date ASC
  `, [communityId]);

  res.status(200).json({
    status: 'success',
    results: pendingResult.rows.length,
    data: {
      pendingMembers: pendingResult.rows
    }
  });
});

// Promote a member to community manager (creator or manager only)
export const promoteMember = catchAsync(async (req, res, next) => {
  const { communityId, memberId } = req.params;
  const userId = req.user?.user_id;

  // Check if community exists
  const communityResult = await db.query('SELECT * FROM community WHERE community_ID = $1', [communityId]);
  if (communityResult.rows.length === 0) return next(new AppError('Community not found', 404));

  // Check if requester is admin, community creator or manager
  const isAdmin = req.user.role === 0;
  const isCreator = communityResult.rows[0].community_creator === userId;
  const managerCheck = await db.query('SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2', [communityId, userId]);
  
  if (!isAdmin && !isCreator && managerCheck.rows.length === 0) {
    return next(new AppError('Only community creator or managers can promote members', 403));
  }

  // Ensure target is a member
  const memberCheck = await db.query('SELECT * FROM community_Participants WHERE community_ID = $1 AND user_id = $2 AND Member_Status = $3', [communityId, memberId, 'Accepted']);
  if (memberCheck.rows.length === 0) return next(new AppError('Target user is not an accepted member', 400));

  // Check if already manager
  const already = await db.query('SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2', [communityId, memberId]);
  if (already.rows.length > 0) return next(new AppError('User is already a manager', 400));

  // Insert into communityManagers
  await db.query('INSERT INTO communityManagers (moderator_ID, community_ID) VALUES ($1, $2)', [memberId, communityId]);

  res.status(200).json({ status: 'success', message: 'Member promoted to manager' });
});

// Demote a community manager (creator or manager only)
export const demoteMember = catchAsync(async (req, res, next) => {
  const { communityId, memberId } = req.params;
  const userId = req.user?.user_id;

  // Check if community exists
  const communityResult = await db.query('SELECT * FROM community WHERE community_ID = $1', [communityId]);
  if (communityResult.rows.length === 0) return next(new AppError('Community not found', 404));

  // Check if requester is admin, community creator or manager
  const isAdmin = req.user.role === 0;
  const isCreator = communityResult.rows[0].community_creator === userId;
  const managerCheck = await db.query('SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2', [communityId, userId]);
  
  if (!isAdmin && !isCreator && managerCheck.rows.length === 0) {
    return next(new AppError('Only community creator or managers can demote managers', 403));
  }

  // Prevent demoting the community creator
  if (communityResult.rows[0].community_creator === memberId) return next(new AppError('Cannot demote the community creator', 400));

  // Check that target is a manager
  const target = await db.query('SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2', [communityId, memberId]);
  if (target.rows.length === 0) return next(new AppError('Target is not a manager', 400));

  // Delete manager entry
  await db.query('DELETE FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2', [communityId, memberId]);

  res.status(200).json({ status: 'success', message: 'Member demoted from manager' });
});

// Approve a pending join request (managers only)
export const approveJoinRequest = catchAsync(async (req, res, next) => {
  const { communityId, memberId } = req.params;
  const userId = req.user?.user_id;

  // Check if user is admin or a manager
  const isAdmin = req.user.role === 0;
  
  if (!isAdmin) {
    const managerResult = await db.query(
      'SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2',
      [communityId, userId]
    );

    if (managerResult.rows.length === 0) {
      return next(new AppError('Only community managers can approve requests', 403));
    }
  }

  // Update member status to Accepted
  const result = await db.query(
    `UPDATE community_Participants 
     SET Member_Status = 'Accepted'
     WHERE community_ID = $1 AND user_ID = $2 AND Member_Status = 'Pending'
     RETURNING *`,
    [communityId, memberId]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Pending request not found', 404));
  }

  await checkCommunitiesJoinedAchievements(memberId);
  const comMembersCount = await checkCommunityCountdAchievements(userId, communityId);

  const unlockedAchievements = [
    // ...(Array.isArray(joinedCommunities) ? joinedCommunities : []), // won't be sent to front side as this belongs to other community members not the moderator himself
    ...(Array.isArray(comMembersCount) ? comMembersCount : [])
  ];

  res.status(200).json({
    status: 'success',
    message: 'Join request approved',
    data: {
      member: result.rows[0],
      unlockedAchievements: unlockedAchievements.map(a => ({
        id: a.id,
        title: a.title,
        xp: a.xp
      }))
    }
  });
});

// Reject a pending join request (managers only)
export const rejectJoinRequest = catchAsync(async (req, res, next) => {
  const { communityId, memberId } = req.params;
  const userId = req.user?.user_id;

  // Check if user is admin or a manager
  const isAdmin = req.user.role === 0;
  
  if (!isAdmin) {
    const managerResult = await db.query(
      'SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2',
      [communityId, userId]
    );

    if (managerResult.rows.length === 0) {
      return next(new AppError('Only community managers can reject requests', 403));
    }
  }

  // Delete the pending request
  const result = await db.query(
    `DELETE FROM community_Participants 
     WHERE community_ID = $1 AND user_ID = $2 AND Member_Status = 'Pending'
     RETURNING *`,
    [communityId, memberId]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Pending request not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Join request rejected'
  });
});

// Add member by username (managers only) - directly adds to pending requests
export const addMemberByUsername = catchAsync(async (req, res, next) => {
  const { communityId } = req.params;
  const { username } = req.body;
  const userId = req.user?.user_id;

  // Check if user is admin or a manager
  const isAdmin = req.user.role === 0;
  
  if (!isAdmin) {
    const managerResult = await db.query(
      'SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2',
      [communityId, userId]
    );

    if (managerResult.rows.length === 0) {
      return next(new AppError('Only community managers can add members', 403));
    }
  }

  // Find user by username
  const userResult = await db.query(
    'SELECT user_id FROM users WHERE username = $1',
    [username]
  );

  if (userResult.rows.length === 0) {
    return next(new AppError('User not found', 404));
  }

  const targetUserId = userResult.rows[0].user_id;

  // Check if user is already a member or has pending request
  const memberCheck = await db.query(
    'SELECT Member_Status FROM community_Participants WHERE community_ID = $1 AND user_id = $2',
    [communityId, targetUserId]
  );

  if (memberCheck.rows.length > 0) {
    const status = memberCheck.rows[0].member_status || memberCheck.rows[0].Member_Status;
    if (status === 'Accepted') {
      return next(new AppError('User is already a member', 400));
    }
    if (status === 'Pending') {
      return next(new AppError('User already has a pending request', 400));
    }
  }

  // Add as accepted member directly (managers can add without pending)
  await db.query(
    `INSERT INTO community_Participants (community_ID, user_id, Join_Date, Member_Status)
     VALUES ($1, $2, NOW(), 'Accepted')
     ON CONFLICT (community_ID, user_id) 
     DO UPDATE SET Member_Status = 'Accepted', Join_Date = NOW(), Leave_Date = NULL`,
    [communityId, targetUserId]
  );

  res.status(200).json({
    status: 'success',
    message: `${username} has been added as a member`
  });
});

// Invite friend to community (any member) - sends pending request if accepted
export const inviteFriendToCommunity = catchAsync(async (req, res, next) => {
  const { communityId } = req.params;
  const { friendId } = req.body;
  const userId = req.user?.user_id;

  // Check if requester is a member of the community
  const memberCheck = await db.query(
    'SELECT Member_Status FROM community_Participants WHERE community_ID = $1 AND user_id = $2',
    [communityId, userId]
  );

  if (memberCheck.rows.length === 0 || memberCheck.rows[0].member_status !== 'Accepted') {
    return next(new AppError('You must be a member to invite friends', 403));
  }

  // Check if they are friends
  const friendshipCheck = await db.query(
    `SELECT * FROM friendship 
     WHERE ((requesterId = $1 AND requesteeId = $2) OR (requesterId = $2 AND requesteeId = $1))
     AND status = 'Accepted'`,
    [userId, friendId]
  );

  if (friendshipCheck.rows.length === 0) {
    return next(new AppError('You can only invite your friends', 400));
  }

  // Check if friend is already a member or has pending request
  const friendMemberCheck = await db.query(
    'SELECT Member_Status FROM community_Participants WHERE community_ID = $1 AND user_id = $2',
    [communityId, friendId]
  );

  if (friendMemberCheck.rows.length > 0) {
    const status = friendMemberCheck.rows[0].member_status || friendMemberCheck.rows[0].Member_Status;
    if (status === 'Accepted') {
      return next(new AppError('Friend is already a member', 400));
    }
    if (status === 'Pending') {
      return next(new AppError('Friend already has a pending request', 400));
    }
  }

  // Add friend to pending requests
  await db.query(
    `INSERT INTO community_Participants (community_ID, user_id, Join_Date, Member_Status)
     VALUES ($1, $2, NOW(), 'Pending')
     ON CONFLICT (community_ID, user_id) 
     DO UPDATE SET Member_Status = 'Pending', Join_Date = NOW(), Leave_Date = NULL`,
    [communityId, friendId]
  );

  res.status(200).json({
    status: 'success',
    message: 'Friend has been invited. They will appear in pending requests.'
  });
});


// Get community competitions
export const getCommunityCompetitions = catchAsync(async (req, res, next) => {
  const { communityId } = req.params;
  const userId = req.user?.user_id;

  const result = await db.query(
    `SELECT 
      c.*,
      CASE 
        WHEN cp.user_id IS NOT NULL THEN 'joined'
        ELSE 'not_joined'
      END as entry_status,
      (SELECT COUNT(DISTINCT user_id) FROM CompetitionParticipants WHERE comp_id = c.competition_id) as participant_count
    FROM competition c
    LEFT JOIN CompetitionParticipants cp 
      ON c.competition_id = cp.comp_id AND cp.user_id = $1
    WHERE c.competition_type = 'local' AND c.community_id = $2
    ORDER BY c.end_time ASC`,
    [userId, communityId]
  );

  res.status(200).json({
    status: 'success',
    data: result.rows
  });
});

// Create a community competition (managers only)
export const createCommunityCompetition = catchAsync(async (req, res, next) => {
  const { communityId } = req.params;
  const userId = req.user?.user_id;
  const {
    competition_name,
    comp_description,
    end_time,
    max_subjects,
    max_participants,
    competition_type
  } = req.body;

  if (!competition_name || !end_time) {
    return next(new AppError('Competition name and end time are required.', 400));
  }

  // Check if user is admin or a manager
  const isAdmin = req.user.role === 0;
  if (!isAdmin) {
    const managerResult = await db.query(
      'SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2',
      [communityId, userId]
    );
    if (managerResult.rows.length === 0) {
      return next(new AppError('Only community managers can create competitions', 403));
    }
  }

  // Create the competition with start_time as NOW()
  const result = await db.query(
    `INSERT INTO competition 
      (competition_name, comp_description, start_time, end_time, max_subjects, max_participants, creator_id, competition_type, community_id)
    VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      competition_name,
      comp_description,
      end_time,
      max_subjects,
      max_participants,
      userId,
      competition_type,
      communityId
    ]
  );

  res.status(201).json({
    status: 'success',
    data: {
      competition: result.rows[0]
    }
  });
});

// Join a community competition
export const joinCommunityCompetition = catchAsync(async (req, res, next) => {
  const { communityId, competitionId } = req.params;
  const userId = req.user?.user_id;
  const { subjects } = req.body;

  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return next(new AppError('Subjects array is required', 400));
  }

  // Check if user is a member of the community
  const memberResult = await db.query(
    `SELECT * FROM community_Participants 
     WHERE community_ID = $1 AND user_ID = $2 AND Member_Status = 'Accepted'`,
    [communityId, userId]
  );

  if (memberResult.rows.length === 0) {
    return next(new AppError('You must be a member of this community to join competitions', 403));
  }

  // Check if competition exists and belongs to this community
  const competitionResult = await db.query(
    `SELECT * FROM competition 
     WHERE competition_id = $1 AND community_id = $2 AND competition_type = 'local'`,
    [competitionId, communityId]
  );

  if (competitionResult.rows.length === 0) {
    return next(new AppError('Competition not found in this community', 404));
  }

  const competition = competitionResult.rows[0];

  // Check max subjects
  if (subjects.length > competition.max_subjects) {
    return next(new AppError(`Maximum ${competition.max_subjects} subjects allowed`, 400));
  }

  // Check if already joined
  const existingEntry = await db.query(
    'SELECT * FROM CompetitionParticipants WHERE comp_id = $1 AND user_id = $2',
    [competitionId, userId]
  );

  if (existingEntry.rows.length > 0) {
    return next(new AppError('You have already joined this competition', 400));
  }

  // Check max participants
  const participantCount = await db.query(
    'SELECT COUNT(DISTINCT user_id) as count FROM CompetitionParticipants WHERE comp_id = $1',
    [competitionId]
  );

  if (parseInt(participantCount.rows[0].count) >= competition.max_participants) {
    return next(new AppError('Competition has reached maximum participants', 400));
  }

  // Insert subjects
  for (const subject of subjects) {
    await db.query(
      'INSERT INTO CompetitionParticipants (comp_id, user_id, subject_name) VALUES ($1, $2, $3)',
      [competitionId, userId, subject]
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Successfully joined the competition'
  });
});

// Get competition entries (participants)
export const getCommunityCompetitionEntries = catchAsync(async (req, res, next) => {
  const { communityId, competitionId } = req.params;

  // Verify competition belongs to community
  const competitionResult = await db.query(
    `SELECT * FROM competition 
     WHERE competition_id = $1 AND community_id = $2 AND competition_type = 'local'`,
    [competitionId, communityId]
  );

  if (competitionResult.rows.length === 0) {
    return next(new AppError('Competition not found in this community', 404));
  }

  const result = await db.query(
    `SELECT 
      cp.user_id,
      u.user_name,
      u.profile_pic,
      cp.subject_name,
      cp.total_time
    FROM CompetitionParticipants cp
    JOIN Users u ON cp.user_id = u.user_id
    WHERE cp.comp_id = $1
    ORDER BY cp.total_time DESC, u.user_name`,
    [competitionId]
  );

  res.status(200).json({
    status: 'success',
    data: result.rows
  });
});

// Delete a community competition (managers only)
export const deleteCommunityCompetition = catchAsync(async (req, res, next) => {
  const { communityId, competitionId } = req.params;
  const userId = req.user?.user_id;

  // Check if user is admin or a manager
  const isAdmin = req.user.role === 0;
  
  if (!isAdmin) {
    const managerResult = await db.query(
      'SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2',
      [communityId, userId]
    );

    if (managerResult.rows.length === 0) {
      return next(new AppError('Only community managers can delete competitions', 403));
    }
  }

  // Delete competition participants first (if not cascading)
  await db.query(
    'DELETE FROM CompetitionParticipants WHERE comp_id = $1',
    [competitionId]
  );

  // Delete competition
  const result = await db.query(
    `DELETE FROM competition 
     WHERE competition_id = $1 AND community_id = $2 AND competition_type = 'local'
     RETURNING *`,
    [competitionId, communityId]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Competition not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Competition deleted successfully'
  });
});

// Get competition leaderboard
export const getCompetitionLeaderboard = catchAsync(async (req, res, next) => {
  const { communityId, competitionId } = req.params;

  // Verify competition belongs to community
  const competitionResult = await db.query(
    `SELECT * FROM competition 
     WHERE competition_id = $1 AND community_id = $2 AND competition_type = 'local'`,
    [competitionId, communityId]
  );

  if (competitionResult.rows.length === 0) {
    return next(new AppError('Competition not found in this community', 404));
  }

  const competition = competitionResult.rows[0];

  // Get leaderboard data - total study time across all subjects per user during competition period
  const result = await db.query(
    `SELECT 
      u.user_id,
      u.username,
      u.profile_picture,
      u.xp,
      COALESCE(SUM(EXTRACT(EPOCH FROM (s.time_stamp - s.created_at))), 0) as total_time,
      COUNT(s.session_name) as session_count,
      ARRAY_AGG(DISTINCT cp.subject_name ORDER BY cp.subject_name) as subjects,
      CASE 
        WHEN f.status = 'Accepted' THEN 'friends'
        WHEN f.status = 'Pending' AND f.requesterid = $4 THEN 'pending_sent'
        WHEN f.status = 'Pending' AND f.requesteeid = $4 THEN 'pending_received'
        ELSE 'none'
      END as friendship_status
    FROM CompetitionParticipants cp
    JOIN users u ON cp.user_id = u.user_id
    LEFT JOIN session s ON s.user_id = cp.user_id 
      AND s.subject_name = cp.subject_name
      AND s.created_at >= $1
      AND s.created_at <= $2
      AND s.type = 'focus'
    LEFT JOIN friendship f ON (
      (f.requesterid = $4 AND f.requesteeid = u.user_id) OR
      (f.requesteeid = $4 AND f.requesterid = u.user_id)
    )
    WHERE cp.comp_id = $3
    GROUP BY u.user_id, u.username, u.profile_picture, u.xp, f.status, f.requesterid, f.requesteeid
    ORDER BY total_time DESC`,
    [competition.start_time, competition.end_time, competitionId, req.user.user_id]
  );

  res.status(200).json({
    status: 'success',
    data: result.rows
  });
});

// Get competition participants (managers only)
export const getCompetitionParticipants = catchAsync(async (req, res, next) => {
  const { communityId, competitionId } = req.params;
  const userId = req.user?.user_id;

  // Check if user is admin or manager
  const isAdmin = req.user.role === 0;
  if (!isAdmin) {
    const managerResult = await db.query(
      'SELECT * FROM communityManagers WHERE community_ID = $1 AND moderator_ID = $2',
      [communityId, userId]
    );
    if (managerResult.rows.length === 0) {
      return next(new AppError('Only community managers can view participants', 403));
    }
  }

  // Get participants with their subject count
  const result = await db.query(
    `SELECT 
      u.user_id,
      u.username,
      u.profile_picture,
      COUNT(cp.subject_name) as subject_count
    FROM CompetitionParticipants cp
    JOIN users u ON cp.user_id = u.user_id
    WHERE cp.comp_id = $1
    GROUP BY u.user_id, u.username, u.profile_picture
    ORDER BY u.username ASC`,
    [competitionId]
  );

  res.status(200).json({
    status: 'success',
    data: result.rows
  });
});

// Get user's selected subjects for a competition
export const getMyCompetitionSubjects = catchAsync(async (req, res, next) => {
  const { communityId, competitionId } = req.params;
  const userId = req.user?.user_id;

  const result = await db.query(
    `SELECT subject_name
    FROM CompetitionParticipants
    WHERE comp_id = $1 AND user_id = $2
    ORDER BY subject_name ASC`,
    [competitionId, userId]
  );

  res.status(200).json({
    status: 'success',
    data: result.rows.map(row => row.subject_name)
  });
});
