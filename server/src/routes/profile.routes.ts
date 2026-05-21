// profile.routes.ts
import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getCreators,
  getProfileById,
} from '../controllers/profile.controller';
import { protect, requireApprovedProfile } from '../middleware/auth.middleware';

const router = Router();

router.get('/creators', getCreators);
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.get('/:userId', getProfileById);

export default router;
