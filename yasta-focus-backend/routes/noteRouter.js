import express from 'express';
import { protect } from '../controllers/authController.js';
import * as noteController from '../controllers/noteController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Search notes across all subjects
router.get('/search', noteController.searchNotes);

// Notes for a specific subject
router
  .route('/subject/:subjectName')
  .get(noteController.getAllNotes)
  .post(noteController.createNote);

router
  .route('/subject/:subjectName/:noteTitle')
  .get(noteController.getNote)
  .patch(noteController.updateNote)
  .delete(noteController.deleteNote);

export default router;
