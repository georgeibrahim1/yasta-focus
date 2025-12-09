import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const searchCommunities = catchAsync(async (req,res,next) => {
    const { q,page,limit } = req.query;
    if (!q || q.trim() === '') {
        return next(new AppError('Search query is required', 400));
    }
     const p = Math.max(1, parseInt(req.query.page, 10) || 1);
     const l = Math.min(100, parseInt(req.query.limit, 10) || 20);
     const offset = (p - 1) * l;
    const searchTerm = `%${q.trim()}%`;
    const countQuery = `SELECT COUNT(*)::int AS total FROM community WHERE community_Name ILIKE $1 OR Community_Description ILIKE $1`;
    //const countResult = await db.query(countQuery, [`%${searchTerm}%`]);
    const query = `SELECT * FROM community WHERE community_Name ILIKE $1 OR Community_Description ILIKE $1 ORDER BY community_Name ASC LIMIT $2 OFFSET $3`;
    //const result = await db.query(query, [`%${searchTerm}%`,l,offset]);
    const [countResult, result] = await Promise.all([db.query(countQuery, [searchTerm]), db.query(query, [searchTerm,l,offset])])
    const totalRows = countResult.rows[0].total;
    const totalPages = Math.ceil(totalRows/l);
    res.status(200).json({
        status: 'success',
        results: result.rows.length,
        data: {
          communities: result.rows,
          page: p,
          limit: l,
          totalRows: totalRows,
          totalPages: totalPages
        }
      });
});

export const getAllCommunities = catchAsync(async (req, res, next) => {
    const query = `SELECT * FROM community`;
    const result = await db.query(query);
    
      res.status(200).json({
        status: 'success',
        results: result.rows.length,
        data: result.rows
      });
});

export const getJoinedCommunities = catchAsync(async (req, res, next) => {
    const userId = req.user.user_id;
    const query = `
        SELECT DISTINCT c.* FROM community c
        WHERE c.community_Creator = $1 
        OR c.community_ID IN (SELECT community_ID FROM communityManagers WHERE moderator_ID = $1)
    `;
    const result = await db.query(query, [userId]);
    
    res.status(200).json({
        status: 'success',
        results: result.rows.length,
        data: result.rows
    });
});

export const createCommunity = catchAsync(async (req, res, next) => {
    const userId = req.user.user_id;
    const { community_Name, community_Description, tags = [] } = req.body;

    if (!community_Name || community_Name.trim() === '') {
        return next(new AppError('Community name is required', 400));
    }
    if(!community_Description || community_Description.trim() === ''){
        return next(new AppError('Community description is required', 400))
    }
    
    // Insert community
    const query = `INSERT INTO community (community_Name, community_Description, community_Creator) VALUES ($1,$2,$3) RETURNING community_ID, community_Name, community_Description, community_Creator`; 
    const result = await db.query(query, [community_Name, community_Description, userId]);
    const communityData = result.rows[0];
    const communityId = communityData.community_id;
    
    // Add creator as moderator
    await db.query('INSERT INTO communityManagers (moderator_ID, community_ID) VALUES ($1, $2)', [userId, communityId]);
    
    // Add tags if provided
    if (tags && tags.length > 0) {
        for (const tag of tags) {
            await db.query('INSERT INTO communityTag (tag, community_ID) VALUES ($1, $2)', [tag, communityId]);
        }
    }
    
    res.status(201).json({
        status: 'success',
        data: communityData
      });
});

export const getTags = catchAsync(async (req, res, next) => {
    const {communityID} = req.params;
     const communityCheck = await db.query('SELECT 1 FROM community WHERE community_ID = $1', [communityID]);
    if (communityCheck.rows.length === 0) {
        return next(new AppError('Community not found', 404));
    }
    const query = `SELECT tag FROM communityTag WHERE community_ID = $1`;
    const result = await db.query(query,[communityID]);
    if (result.rows.length === 0) {
    return next(new AppError('No tags found', 404));
  }
    res.status(200).json({
        status: 'success',
        results: result.rows.length,
        data: {
          tags: result.rows
        }
      });
});

export const addTagtoCommunity = catchAsync(async (req, res, next) => {
    const communityTag = req.body.tag;
    const communityID = req.params.communityID;
    if(!communityTag || communityTag.trim() == ''){
        return next(new AppError('Tag cannot be empty',400));
    }

    const communityCheck = await db.query('SELECT 1 FROM community WHERE community_ID = $1', [communityID]);
    if (communityCheck.rows.length === 0) {
        return next(new AppError('Community not found', 404));
    }

    const tagCheck = await db.query('SELECT 1 FROM communityTag WHERE tag = $1 AND community_ID = $2', [communityTag.trim().toLowerCase(),communityID]);
    if(tagCheck.rows.length > 0){
        return next(new AppError('Tag already exists for this community',409));
    }

    const query = `INSERT INTO communityTag (tag, community_ID) VALUES($1,$2) RETURNING tag, community_ID`;
    const result = await db.query(query, [communityTag.trim().toLowerCase(),communityID]);
    if(result.rows.length === 0){
        return next(new AppError('Tag Could not be added',400))
    }
    res.status(201).json({
        status: 'success',
        data: {
          tag: result.rows[0]
        }
      });
});


