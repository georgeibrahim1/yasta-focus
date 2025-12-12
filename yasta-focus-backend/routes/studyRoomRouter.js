import express from 'express';
import { protect } from '../controllers/authController.js';
import * as studyRoomController from '../controllers/studyRoomController.js';

const router = express.Router();

// Get all study rooms for a community
router.get('/communities/:communityId/rooms', protect, studyRoomController.getCommunityRooms);

// Create a new study room
router.post('/communities/:communityId/rooms', protect, studyRoomController.createRoom);

// Delete a study room
router.delete('/rooms/:roomCode', protect, studyRoomController.deleteRoom);

// Join a study room
router.post('/rooms/:roomCode/join', protect, studyRoomController.joinRoom);

// Leave a study room
router.delete('/rooms/:roomCode/leave', protect, studyRoomController.leaveRoom);

export default router;
