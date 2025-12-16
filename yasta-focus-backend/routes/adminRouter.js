import express from 'express';
import { protect } from '../controllers/authController.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Platform statistics
router.get('/stats/platform', adminController.getPlatformStats);

// User statistics
router.get('/users/top', adminController.getTopUsers);
router.get('/users/recent', adminController.getRecentUsers);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:userId/role', adminController.updateUserRole);

// Community statistics
router.get('/communities/active', adminController.getActiveCommunities);

// Growth and activity statistics
router.get('/stats/user-growth', adminController.getUserGrowth);
router.get('/stats/study-activity', adminController.getStudyActivity);

// Reports
router.get('/reports', adminController.getReports);
router.patch('/reports/:reporterId/:reportedId/status', adminController.updateReportStatus);
router.delete('/reports/:reporterId/:reportedId', adminController.deleteReport);

export default router;
