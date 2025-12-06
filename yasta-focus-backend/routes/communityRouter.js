import express from 'express';
import { protect } from '../controllers/authController.js';
import * as communityController from '../controllers/communityController.js';

const router = express.Router();

router.get('/search', (req, res, next) => {
    res.send('Community search is working');// change later
});
router.route('/').get(communityController.getAllCommunities).post(communityController.createCommunity);
router.route('/:communityID/tag').get(communityController.getTags).post(communityController.addTagtoCommunity);

// Protect all routes
router.use(protect);

// Search available communities








export default router;
