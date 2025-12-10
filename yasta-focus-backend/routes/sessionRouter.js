import express from 'express';
import { protect } from '../controllers/authController.js';
import * as sessionController from '../controllers/sessionController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Statistics routes
router.get('/stats/weekly', sessionController.getWeeklyStudyTime);
router.get('/stats/trends', sessionController.getSessionTrends);
router.get('/stats/subjects', sessionController.getSubjectStats);
router.get('/stats/heatmap', sessionController.getHeatmapData);

router
  .route('/')
  .get(sessionController.getAllSessions)
  .post(sessionController.createSession);

router
  .route('/:sessionName')
  .get(sessionController.getSession)
  .patch(sessionController.updateSession)
  .delete(sessionController.deleteSession);

export default router;
