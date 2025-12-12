import express from 'express';
import { protect } from '../controllers/authController.js';
import * as announcementController from '../controllers/announcementController.js';

const router = express.Router();

// Get all announcements for a community
router.get('/communities/:communityId/announcements', protect, announcementController.getAnnouncements);

// Create an announcement (managers only)
router.post('/communities/:communityId/announcements', protect, announcementController.createAnnouncement);

// Delete an announcement
router.delete('/announcements/:announcementNum/:moderatorId/:communityId', protect, announcementController.deleteAnnouncement);

export default router;
