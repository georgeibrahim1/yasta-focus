import db from '../db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { StreamClient } from '@stream-io/node-sdk';

export const getEvents = catchAsync(async (req, res, next) => {
    const query = `
        SELECT 
            *,
            CASE 
                WHEN date <= NOW() AND date >= NOW() - INTERVAL '2 hours' THEN true
                ELSE false
            END as is_live
        FROM event 
        WHERE date >= NOW() - INTERVAL '2 hours'
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

export const deleteEvent = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.user_id;
    const userRole = req.user.role;
    
    // Get event to check creator
    const eventQuery = `SELECT * FROM event WHERE id = $1`;
    const eventResult = await db.query(eventQuery, [id]);
    
    if (eventResult.rows.length === 0) {
        return next(new AppError('Event not found', 404));
    }
    
    const event = eventResult.rows[0];
    
    // Only admin (role 0) or event creator can delete
    if (userRole !== 0 && event.eventcreator !== userId) {
        return next(new AppError('You do not have permission to delete this event', 403));
    }
    
    const deleteQuery = `DELETE FROM event WHERE id = $1`;
    await db.query(deleteQuery, [id]);
    
    res.status(204).json({
        status: 'success',
        data: null
    });
});

export const generateStreamToken = catchAsync(async (req, res, next) => {
    const userId = req.user.user_id;
    const username = req.user.username;
    
    // Initialize Stream client
    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_SECRET;
    
    if (!apiKey || !apiSecret) {
        return next(new AppError('Stream credentials not configured', 500));
    }
    
    const streamClient = new StreamClient(apiKey, apiSecret);
    
    // Generate token for the user
    const token = streamClient.generateUserToken({ user_id: userId.toString() });
    
    res.status(200).json({
        status: 'success',
        data: {
            userId: userId.toString(),
            username,
            token,
            apiKey
        }
    });
});
