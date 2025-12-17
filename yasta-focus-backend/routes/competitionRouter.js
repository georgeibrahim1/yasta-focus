import express from 'express';
import { protect } from '../controllers/authController.js';
import * as competitionController from '../controllers/competitionController.js';

const router = express.Router();

// Protected routes
router.use(protect);

router.route('/all').get(competitionController.getCompetitions);
router.route('/create-global').post(competitionController.createGlobalCompetition);
router.route('/:id').get(competitionController.getCompetition);
router.route('/:id/join').post(competitionController.joinCompetition);
router.route('/:id/entries').get(competitionController.getEntries);
router.route('/:id/leaderboard').get(competitionController.getCompetitionLeaderboard);
router.route('/:id/participants').get(competitionController.getCompetitionParticipants);
router.route('/:id/my-subjects').get(competitionController.getMyCompetitionSubjects);
router.route('/:id').delete(competitionController.deleteGlobalCompetition);

export default router;
