// routes/achievementRoutes.js
import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import { 
  getAllAchievements, 
  getUserAchievementStats,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getAdminAchievements
} from '../controllers/achievementController.js';

const router = express.Router();

router.use(protect);

// Regular user routes
router.get('/', getAllAchievements);
router.get('/stats', getUserAchievementStats);

// Admin-only routes
router.use(restrictTo(0)); // Only admins can access routes below

router.get('/admin/all', getAdminAchievements); // Get all achievements for admin panel
router.post('/admin', createAchievement);
router.put('/admin/:id', updateAchievement);
router.delete('/admin/:id', deleteAchievement);

export default router;