import { Router } from 'express';
import {
  applyToCampaign,
  getMyApplications,
  getCampaignApplications,
  acceptApplication,
  rejectApplication,
  markComplete,
} from '../controllers/application.controller';
import { protect, authorize, requireApprovedProfile } from '../middleware/auth.middleware';

const router = Router();

router.post('/', protect, authorize('creator'), requireApprovedProfile, applyToCampaign);
router.get('/my', protect, getMyApplications);
router.get('/campaign/:campaignId', protect, getCampaignApplications);
router.put('/:id/accept', protect, authorize('business', 'admin', 'superadmin'), acceptApplication);
router.put('/:id/reject', protect, authorize('business', 'admin', 'superadmin'), rejectApplication);
router.put('/:id/complete', protect, markComplete);

export default router;
