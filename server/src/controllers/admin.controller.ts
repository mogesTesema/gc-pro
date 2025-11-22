import { Request, Response } from 'express';
import User from '../models/User.model';
import Profile from '../models/Profile.model';
import CoinTransaction from '../models/CoinTransaction.model';
import Notification from '../models/Notification.model';
import Campaign from '../models/Campaign.model';
import Application from '../models/Application.model';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { NOTIFICATION_TYPES, PROFILE_STATUS } from '../config/constants';

// ─── GET /api/admin/pending-profiles ─────────────────────
export const getPendingProfiles = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profiles = await Profile.find({ approvalStatus: PROFILE_STATUS.PENDING })
    .populate('userId', 'name email role createdAt avatar')
    .sort({ createdAt: 1 }); // oldest first

  res.status(200).json({ success: true, profiles, total: profiles.length });
});

// ─── PUT /api/admin/profiles/:userId/approve ─────────────
export const approveProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  const [user, profile] = await Promise.all([
    User.findById(userId),
    Profile.findOne({ userId }),
  ]);

  if (!user || !profile) {
    res.status(404).json({ success: false, message: 'User or profile not found.' });
    return;
  }

  profile.approvalStatus = PROFILE_STATUS.APPROVED;
  profile.approvedBy = req.user!._id;
  profile.approvedAt = new Date();
  profile.rejectionReason = '';
  await profile.save();

  user.profileStatus = 'approved';
  await user.save();

  await Notification.create({
    userId: user._id,
    senderId: req.user!._id,
    type: NOTIFICATION_TYPES.PROFILE_APPROVED,
    title: 'Profile Approved! ✅',
    message: 'Your profile has been approved. You now have full access to the platform.',
  });

  res.status(200).json({ success: true, message: 'Profile approved.', profile });
});

// ─── PUT /api/admin/profiles/:userId/reject ──────────────
export const rejectProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    return;
  }

  const [user, profile] = await Promise.all([
    User.findById(userId),
    Profile.findOne({ userId }),
  ]);

  if (!user || !profile) {
    res.status(404).json({ success: false, message: 'User or profile not found.' });
    return;
  }

  profile.approvalStatus = PROFILE_STATUS.REJECTED;
  profile.rejectionReason = reason;
  await profile.save();

  user.profileStatus = 'rejected';
  await user.save();

  await Notification.create({
    userId: user._id,
    senderId: req.user!._id,
    type: NOTIFICATION_TYPES.PROFILE_REJECTED,
    title: 'Profile Update Required',
    message: `Your profile was not approved. Reason: ${reason}`,
  });

  res.status(200).json({ success: true, message: 'Profile rejected.', profile });
});

// ─── POST /api/admin/coins/:userId ───────────────────────
// Admin manually adds coins to a user
export const addCoinsManually = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { amount, reason } = req.body;

  if (!amount || amount <= 0) {
    res.status(400).json({ success: false, message: 'Amount must be a positive number.' });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  const newBalance = user.coinBalance + parseInt(amount);
  user.coinBalance = newBalance;
  await user.save();

  await CoinTransaction.create({
    userId: user._id,
    amount: parseInt(amount),
    type: 'credit',
    reason: reason || 'Admin manual top-up',
    balanceAfter: newBalance,
    paymentMethod: 'manual',
    isVerified: true,
    verifiedBy: req.user!._id,
  });

  await Notification.create({
    userId: user._id,
    senderId: req.user!._id,
    type: NOTIFICATION_TYPES.COINS_ADDED,
    title: 'Coins Added to Your Account',
    message: `${amount} coins have been added to your account. New balance: ${newBalance} coins.`,
  });

  res.status(200).json({
    success: true,
    message: `${amount} coins added to ${user.name}.`,
    newBalance,
  });
});

// ─── GET /api/admin/users ─────────────────────────────────
export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { role, status, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const filter: Record<string, any> = {};
  if (role) filter.role = role;
  if (status) filter.profileStatus = status;

  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit as string)),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    users,
    pagination: { page: parseInt(page as string), limit: parseInt(limit as string), total },
  });
});

// ─── PUT /api/admin/users/:userId/toggle ─────────────────
export const toggleUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Prevent superadmin demotion by regular admin
  const user = await User.findById(req.params.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  if (user.role === 'superadmin') {
    res.status(403).json({ success: false, message: 'Cannot modify a superadmin.' });
    return;
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'suspended'}.`,
    isActive: user.isActive,
  });
});

// ─── GET /api/admin/stats ─────────────────────────────────
export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [
    totalUsers,
    totalCreators,
    totalBusinesses,
    pendingProfiles,
    totalCampaigns,
    openCampaigns,
    totalApplications,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'creator' }),
    User.countDocuments({ role: 'business' }),
    Profile.countDocuments({ approvalStatus: 'pending' }),
    Campaign.countDocuments(),
    Campaign.countDocuments({ status: 'open' }),
    Application.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalCreators,
      totalBusinesses,
      pendingProfiles,
      totalCampaigns,
      openCampaigns,
      totalApplications,
    },
  });
});
