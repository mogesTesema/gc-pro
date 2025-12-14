import { Request, Response } from 'express';
import Profile from '../models/Profile.model';
import User from '../models/User.model';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { PAGINATION } from '../config/constants';

// ─── GET /api/profiles/me ─────────────────────────────────
export const getMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await Profile.findOne({ userId: req.user!._id })
    .populate('userId', 'name email role coinBalance profileStatus avatar');

  res.status(200).json({ success: true, profile });
});

// ─── PUT /api/profiles/me ─────────────────────────────────
export const updateMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const role = req.user!.role;

  // Fields allowed to update
  const allowedFields: Record<string, string[]> = {
    creator: ['bio', 'location', 'phone', 'niche', 'skills', 'followers',
              'platform', 'socialLinks', 'portfolio', 'performanceMetrics'],
    business: ['bio', 'location', 'phone', 'businessName', 'industry',
               'companySize', 'targetAudience', 'website'],
    admin: ['bio', 'location', 'phone'],
    superadmin: ['bio', 'location', 'phone'],
  };

  const permitted = allowedFields[role] || [];
  const updateData: Record<string, any> = {};
  permitted.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  // Reset to pending on significant updates (follower count, business info)
  const significantFields = ['followers', 'businessName', 'platform'];
  const hasSignificantUpdate = significantFields.some((f) => updateData[f] !== undefined);

  if (hasSignificantUpdate) {
    updateData.approvalStatus = 'pending';
    updateData.rejectionReason = '';
    // Also update user's profileStatus
    await User.findByIdAndUpdate(userId, { profileStatus: 'pending' });
  }

  const profile = await Profile.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('userId', 'name email role coinBalance profileStatus avatar');

  if (!profile) {
    res.status(404).json({ success: false, message: 'Profile not found.' });
    return;
  }

  // Also update avatar if provided
  if (req.body.avatar) {
    await User.findByIdAndUpdate(userId, { avatar: req.body.avatar });
  }

  res.status(200).json({ success: true, profile });
});

// ─── GET /api/profiles/creators ──────────────────────────
// Public — list all approved creator profiles with filters
export const getCreators = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = { approvalStatus: 'approved' };

  // Filters
  if (req.query.niche) {
    filter.niche = { $in: (req.query.niche as string).split(',') };
  }
  if (req.query.skills) {
    filter.skills = { $in: (req.query.skills as string).split(',') };
  }
  if (req.query.location) {
    filter.location = { $regex: req.query.location as string, $options: 'i' };
  }
  if (req.query.platform) {
    filter.platform = req.query.platform;
  }
  if (req.query.minFollowers) {
    filter.followers = { $gte: parseInt(req.query.minFollowers as string) };
  }

  // Sort
  const sortMap: Record<string, any> = {
    followers: { followers: -1 },
    rating: { 'performanceMetrics.averageRating': -1 },
    recent: { createdAt: -1 },
  };
  const sort = sortMap[req.query.sort as string] || sortMap.recent;

  const [profiles, total] = await Promise.all([
    Profile.find(filter)
      .populate('userId', 'name email avatar role')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Profile.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    profiles,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// ─── GET /api/profiles/:userId ────────────────────────────
export const getProfileById = asyncHandler(async (req: Request, res: Response) => {
  const profile = await Profile.findOne({ userId: req.params.userId })
    .populate('userId', 'name email avatar role coinBalance profileStatus createdAt');

  if (!profile) {
    res.status(404).json({ success: false, message: 'Profile not found.' });
    return;
  }

  res.status(200).json({ success: true, profile });
});
