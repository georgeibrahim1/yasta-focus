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
            END as entry_status
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
