import express from 'express';
import { protect } from '../controllers/authController.js';
import { getAllAchievements, getUserAchievementStats } from '../controllers/achievementController.js';

const router = express.Router();

router.use(protect);

// Get all achievements with user progress
router.get('/', getAllAchievements);

// Get user achievement stats
router.get('/stats', getUserAchievementStats);

export default router;

