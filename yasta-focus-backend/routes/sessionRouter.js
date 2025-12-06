import express from 'express';
import { protect } from '../controllers/authController.js';
import * as sessionController from '../controllers/sessionController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get session statistics
router.get('/stats', sessionController.getSessionStats);

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
