import express from 'express';
import { protect } from '../controllers/authController.js';
import * as eventController from '../controllers/eventController.js';

const router = express.Router();

// Protected routes
router.use(protect);

router.route('/upcoming').get(eventController.getEvents);
router.route('/').post(eventController.createEvent);
router.route('/:id').get(eventController.getEvent);

export default router;
