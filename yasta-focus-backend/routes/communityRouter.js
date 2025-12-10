import express from 'express';
import { protect } from '../controllers/authController.js';
import * as communityController from '../controllers/communityController.js';

const router = express.Router();

// Get all tags
router.get('/tags', communityController.getAllTags);

// Get all communities with filters (optionally protected for join status)
router.get('/', protect, communityController.getAllCommunities);

// Create community
router.post('/', protect, communityController.createCommunity);

// Join community
router.post('/:communityId/join', protect, communityController.joinCommunity);

// Leave community
router.post('/:communityId/leave', protect, communityController.leaveCommunity);

export default router;




