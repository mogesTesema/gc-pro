import { Router } from 'express';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  getMyCampaigns,
  updateCampaign,
  deleteCampaign,
  toggleBookmark,
} from '../controllers/campaign.controller';
import { protect, authorize, requireApprovedProfile } from '../middleware/auth.middleware';

const router = Router();

router.get('/',    getCampaigns);
router.get('/my',  protect, getMyCampaigns);
router.get('/:id', getCampaignById);
router.post('/',   protect, authorize('business', 'admin', 'superadmin'), requireApprovedProfile, createCampaign);
router.put('/:id', protect, authorize('business', 'admin', 'superadmin'), updateCampaign);
router.delete('/:id', protect, deleteCampaign);
router.post('/:id/bookmark', protect, toggleBookmark);

export default router;
