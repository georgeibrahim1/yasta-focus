import express from 'express';
import { protect } from '../controllers/authController.js';
import * as flashcardController from '../controllers/flashcardController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Flashcards for a specific deck
router
  .route('/subject/:subjectName/deck/:deckTitle')
  .get(flashcardController.getAllFlashcards)
  .post(flashcardController.createFlashcard);

router
  .route('/subject/:subjectName/deck/:deckTitle/:question')
  .get(flashcardController.getFlashcard)
  .patch(flashcardController.updateFlashcard)
  .delete(flashcardController.deleteFlashcard);

// Update flashcard confidence (for spaced repetition)
router.patch(
  '/subject/:subjectName/deck/:deckTitle/:question/confidence',
  flashcardController.updateFlashcardConfidence
);

export default router;
