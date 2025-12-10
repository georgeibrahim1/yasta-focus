import express from 'express';
import { protect } from '../controllers/authController.js';
import * as leaderboardController from '../controllers/leaderboardController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', leaderboardController.getLeaderboard);
router.post('/give-xp', leaderboardController.giveXP);
router.post('/friend-request', leaderboardController.sendFriendRequest);
router.post('/report', leaderboardController.reportUser);

export default router;
