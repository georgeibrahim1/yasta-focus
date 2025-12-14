import express from 'express';
import { getUserProfile, updateUserProfile, getMe, getDashboardStats } from '../controllers/userController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get current user data
router.get('/me', getMe);

// Get dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

// Update current user profile
router.patch('/me', updateUserProfile);

// Get user profile by ID
router.get('/:userId', getUserProfile);

export default router;
