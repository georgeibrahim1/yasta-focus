import express from 'express';
import { protect } from '../controllers/authController.js';
import * as communityController from '../controllers/communityController.js';

const router = express.Router();

// Public routes (no auth needed)
router.get('/search', (req, res, next) => {
    res.send('Community search is working');// change later
});

// Protected routes (auth required)
router.post('/', protect, communityController.createCommunity);
router.get('/', communityController.getAllCommunities);
router.get('/joined', protect, communityController.getJoinedCommunities);
router.get('/:communityID/tag', communityController.getTags);
router.post('/:communityID/tag', protect, communityController.addTagtoCommunity);

export default router;




