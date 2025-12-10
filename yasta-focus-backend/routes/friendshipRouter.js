import express from 'express';
import {
  getFriends,
  getFriendRequests,
  getSentRequests,
  respondToFriendRequest,
  cancelFriendRequest,
  removeFriend,
  giveXPToFriend
} from '../controllers/friendshipController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get friends list
router.get('/', getFriends);

// Get received friend requests
router.get('/requests', getFriendRequests);

// Get sent friend requests
router.get('/sent', getSentRequests);

// Respond to friend request
router.patch('/requests/:requesterId', respondToFriendRequest);

// Cancel sent friend request
router.delete('/requests/:requesteeId', cancelFriendRequest);

// Remove friend
router.delete('/:friendId', removeFriend);

// Give XP to friend
router.post('/:friendId/give-xp', giveXPToFriend);

export default router;
