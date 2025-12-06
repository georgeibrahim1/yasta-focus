import express from 'express';
import { protect } from '../controllers/authController.js';
import * as subjectController from '../controllers/subjectController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router
  .route('/')
  .get(subjectController.getAllSubjects)
  .post(subjectController.createSubject);

router
  .route('/:subjectName')
  .get(subjectController.getSubject)
  .patch(subjectController.updateSubject)
  .delete(subjectController.deleteSubject);

export default router;
