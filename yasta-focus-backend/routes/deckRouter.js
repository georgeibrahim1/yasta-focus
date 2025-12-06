import express from 'express';
import { protect } from '../controllers/authController.js';
import * as deckController from '../controllers/deckController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Decks for a specific subject
router
  .route('/subject/:subjectName')
  .get(deckController.getAllDecks)
  .post(deckController.createDeck);

router
  .route('/subject/:subjectName/:deckTitle')
  .get(deckController.getDeck)
  .patch(deckController.updateDeck)
  .delete(deckController.deleteDeck);

export default router;
