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
router.delete('/:communityId/leave', protect, communityController.leaveCommunity);

// Remove member (managers only)
router.delete('/:communityId/members/:memberId', protect, communityController.removeMember);

// Get all community members
router.get('/:communityId/members', protect, communityController.getCommunityMembers);

// Promote / Demote members (creator or managers only)
router.post('/:communityId/members/:memberId/promote', protect, communityController.promoteMember);
router.post('/:communityId/members/:memberId/demote', protect, communityController.demoteMember);

// Update member bio
router.patch('/:communityId/bio', protect, communityController.updateMemberBio);

// Get community statistics (managers only)
router.get('/:communityId/stats', protect, communityController.getCommunityStats);

// Update community info (managers only)
router.patch('/:communityId', protect, communityController.updateCommunityInfo);

// Delete community (managers only)
router.delete('/:communityId', protect, communityController.deleteCommunity);

// Get pending join requests (managers only)
router.get('/:communityId/pending', protect, communityController.getPendingRequests);

// Approve pending join request (managers only)
router.post('/:communityId/pending/:memberId/approve', protect, communityController.approveJoinRequest);

// Reject pending join request (managers only)
router.delete('/:communityId/pending/:memberId/reject', protect, communityController.rejectJoinRequest);

// Get community competitions
router.get('/:communityId/competitions', protect, communityController.getCommunityCompetitions);

// Create community competition (managers only)
router.post('/:communityId/competitions', protect, communityController.createCommunityCompetition);

// Join community competition
router.post('/:communityId/competitions/:competitionId/join', protect, communityController.joinCommunityCompetition);

// Get competition entries
router.get('/:communityId/competitions/:competitionId/entries', protect, communityController.getCommunityCompetitionEntries);

// Delete community competition (managers only)
router.delete('/:communityId/competitions/:competitionId', protect, communityController.deleteCommunityCompetition);

export default router;




