import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const getCompetitions = catchAsync(async (req, res, next) => {
    const userId = req.user.user_id;
    
    const query = `
        SELECT 
            c.*,
            CASE 
                WHEN cp.user_id IS NOT NULL THEN 'joined'
                ELSE 'not_joined'
            END as entry_status,
            (SELECT COUNT(DISTINCT user_id) FROM CompetitionParticipants WHERE comp_id = c.competition_id) as participant_count
        FROM competition c
        LEFT JOIN CompetitionParticipants cp ON c.competition_id = cp.comp_id AND cp.user_id = $1
        ORDER BY c.start_time ASC
    `;
    
    const result = await db.query(query, [userId]);
    
    res.status(200).json({
        status: 'success',
        results: result.rows.length,
        data: result.rows
    });
});

export const getCompetition = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    const query = `SELECT * FROM competition WHERE competition_id = $1`;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
        return next(new AppError('Competition not found', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: result.rows[0]
    });
});

export const joinCompetition = catchAsync(async (req, res, next) => {
    const userId = req.user.user_id;
    const { id: competitionId } = req.params;
    const { subjects = [] } = req.body;

    if (!subjects || subjects.length === 0) {
        return next(new AppError('At least one subject is required', 400));
    }

    // Check if competition exists
    const compCheck = await db.query('SELECT * FROM competition WHERE competition_id = $1', [competitionId]);
    if (compCheck.rows.length === 0) {
        return next(new AppError('Competition not found', 404));
    }

    const competition = compCheck.rows[0];

    // Check if competition has reached max participants
    if (competition.max_participants) {
        const participantCountResult = await db.query(
            'SELECT COUNT(DISTINCT user_id) as count FROM CompetitionParticipants WHERE comp_id = $1',
            [competitionId]
        );
        const currentParticipants = parseInt(participantCountResult.rows[0].count);
        
        if (currentParticipants >= competition.max_participants) {
            return next(new AppError('This competition has reached its maximum number of participants', 400));
        }
    }

    // Check if user is already a participant
    const existingEntry = await db.query(
        'SELECT 1 FROM CompetitionParticipants WHERE comp_id = $1 AND user_id = $2 LIMIT 1',
        [competitionId, userId]
    );
    if (existingEntry.rows.length > 0) {
        return next(new AppError('You are already a participant in this competition', 400));
    }

    // Insert one row per subject
    const insertedSubjects = [];
    for (const subject of subjects) {
        const subjectName = typeof subject === 'string' ? subject : (subject.subject_name || subject.name);
        
        const query = `
            INSERT INTO CompetitionParticipants (comp_id, user_id, subject_name) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;
        const result = await db.query(query, [competitionId, userId, subjectName]);
        insertedSubjects.push(result.rows[0]);
    }

    res.status(201).json({
        status: 'success',
        results: insertedSubjects.length,
        data: insertedSubjects
    });
});

export const getEntries = catchAsync(async (req, res, next) => {
    const { id: competitionId } = req.params;
    
    const query = `
        SELECT * FROM CompetitionParticipants 
        WHERE comp_id = $1
        ORDER BY user_id ASC
    `;
    const result = await db.query(query, [competitionId]);
    
    res.status(200).json({
        status: 'success',
        results: result.rows.length,
        data: result.rows
    });
});

// Admin: Create global competition
export const createGlobalCompetition = catchAsync(async (req, res, next) => {
    const { competition_name, comp_description, end_time, max_subjects, max_participants } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 0) {
        return next(new AppError('Only admins can create global competitions', 403));
    }

    const query = `
        INSERT INTO competition (
            competition_name, comp_description, start_time, end_time, 
            max_subjects, max_participants, competition_type
        ) 
        VALUES ($1, $2, NOW(), $3, $4, $5, 'global') 
        RETURNING *
    `;
    
    const result = await db.query(query, [
        competition_name,
        comp_description,
        end_time,
        max_subjects || null,
        max_participants || null
    ]);
    
    res.status(201).json({
        status: 'success',
        data: result.rows[0]
    });
});

// Get competition leaderboard
export const getCompetitionLeaderboard = catchAsync(async (req, res, next) => {
    const { id: competitionId } = req.params;

    // Verify competition exists
    const competitionResult = await db.query(
        `SELECT * FROM competition WHERE competition_id = $1`,
        [competitionId]
    );

    if (competitionResult.rows.length === 0) {
        return next(new AppError('Competition not found', 404));
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

// Get competition participants (for admins/managers)
export const getCompetitionParticipants = catchAsync(async (req, res, next) => {
    const { id: competitionId } = req.params;

    // Check if user is admin
    if (req.user.role !== 0) {
        return next(new AppError('Only admins can view participant details', 403));
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
    const { id: competitionId } = req.params;
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

// Delete global competition (admin only)
export const deleteGlobalCompetition = catchAsync(async (req, res, next) => {
    const { id: competitionId } = req.params;
    const userId = req.user?.user_id;

    // Check if user is admin
    const isAdmin = req.user.role === 0;
    
    if (!isAdmin) {
        return next(new AppError('Only admins can delete global competitions', 403));
    }

    // Delete competition participants first
    await db.query(
        'DELETE FROM CompetitionParticipants WHERE comp_id = $1',
        [competitionId]
    );

    // Delete competition
    const result = await db.query(
        `DELETE FROM competition 
         WHERE competition_id = $1 AND competition_type = 'global'
         RETURNING *`,
        [competitionId]
    );

    if (result.rows.length === 0) {
        return next(new AppError('Global competition not found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Competition deleted successfully'
    });
});
