import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const getEvents = catchAsync(async (req, res, next) => {
    const query = `
        SELECT * FROM event 
        WHERE date >= NOW() 
        ORDER BY date ASC
    `;
    const result = await db.query(query);
    
    res.status(200).json({
        status: 'success',
        results: result.rows.length,
        data: result.rows
    });
});

export const createEvent = catchAsync(async (req, res, next) => {
    const userId = req.user.user_id;
    const { title, description, date } = req.body;

    if (!title || title.trim() === '') {
        return next(new AppError('Event title is required', 400));
    }
    if (!description || description.trim() === '') {
        return next(new AppError('Event description is required', 400));
    }
    if (!date) {
        return next(new AppError('Event date is required', 400));
    }

    const query = `
        INSERT INTO event (title, description, date, eventCreator) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
    `;
    
    const result = await db.query(query, [title, description, date, userId]);
    
    res.status(201).json({
        status: 'success',
        data: result.rows[0]
    });
});

export const getEvent = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    const query = `SELECT * FROM event WHERE id = $1`;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
        return next(new AppError('Event not found', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: result.rows[0]
    });
});
