import { Request, Response } from 'express';
import Rating from '../models/Rating.model';
import Notification from '../models/Notification.model';
import CoinTransaction from '../models/CoinTransaction.model';
import Application from '../models/Application.model';
import Profile from '../models/Profile.model';
import User from '../models/User.model';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { NOTIFICATION_TYPES } from '../config/constants';

// ════════════════════════════════════════════════════════
// RATINGS
// ════════════════════════════════════════════════════════

// ─── POST /api/ratings ───────────────────────────────────
export const submitRating = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { applicationId, score, communication, professionalism, timeliness, qualityOfWork, comment } = req.body;

  const application = await Application.findById(applicationId);
  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found.' });
    return;
  }

  if (application.collaborationStatus !== 'completed') {
    res.status(400).json({
      success: false,
      message: 'You can only rate after the collaboration is completed.',
    });
    return;
  }

  const fromId = req.user!._id.toString();
  const isCreator = application.applicantId.toString() === fromId;
  const isBusiness = application.businessId.toString() === fromId;

  if (!isCreator && !isBusiness) {
    res.status(403).json({ success: false, message: 'Not authorized to rate this collaboration.' });
    return;
  }

  const toUserId = isCreator ? application.businessId : application.applicantId;

  const existing = await Rating.findOne({ fromUserId: req.user!._id, applicationId });
  if (existing) {
    res.status(409).json({ success: false, message: 'You have already rated this collaboration.' });
    return;
  }

  const rating = await Rating.create({
    fromUserId: req.user!._id,
    toUserId,
    applicationId,
    score,
    communication,
    professionalism,
    timeliness,
    qualityOfWork,
    comment: comment || '',
  });

  // Update the recipient's average rating in their profile
  const allRatings = await Rating.find({ toUserId });
  const avgScore = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;

  await Profile.findOneAndUpdate(
    { userId: toUserId },
    {
      'performanceMetrics.averageRating': Math.round(avgScore * 10) / 10,
      $inc: { 'performanceMetrics.completedCollaborations': 0 }, // preserve
    }
  );

  // Notify the recipient
  await Notification.create({
    userId: toUserId,
    senderId: req.user!._id,
    type: NOTIFICATION_TYPES.RATING_RECEIVED,
    title: 'You Received a Rating',
    message: `${req.user!.name} gave you a ${score}/5 rating.`,
    refId: rating._id,
    refModel: 'Application',
  });

  res.status(201).json({ success: true, rating });
});

// ─── GET /api/ratings/:userId ─────────────────────────────
export const getUserRatings = asyncHandler(async (req: Request, res: Response) => {
  const ratings = await Rating.find({ toUserId: req.params.userId })
    .populate('fromUserId', 'name avatar role')
    .sort({ createdAt: -1 });

  const avgScore = ratings.length
    ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length
    : 0;

  res.status(200).json({
    success: true,
    ratings,
    averageScore: Math.round(avgScore * 10) / 10,
    totalRatings: ratings.length,
  });
});

// ════════════════════════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════════════════════════

// ─── GET /api/notifications ───────────────────────────────
export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user!._id })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ userId: req.user!._id, isRead: false }),
  ]);

  res.status(200).json({ success: true, notifications, unreadCount });
});

// ─── PUT /api/notifications/read-all ─────────────────────
export const markAllNotificationsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany(
    { userId: req.user!._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({ success: true, message: 'All notifications marked as read.' });
});

// ─── PUT /api/notifications/:id/read ─────────────────────
export const markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    res.status(404).json({ success: false, message: 'Notification not found.' });
    return;
  }

  res.status(200).json({ success: true, notification });
});

// ════════════════════════════════════════════════════════
// COINS
// ════════════════════════════════════════════════════════

// ─── GET /api/coins/balance ───────────────────────────────
export const getCoinBalance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id).select('coinBalance');
  res.status(200).json({ success: true, coinBalance: user?.coinBalance || 0 });
});

// ─── GET /api/coins/transactions ─────────────────────────
export const getCoinTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const transactions = await CoinTransaction.find({ userId: req.user!._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({ success: true, transactions });
});

// ─── POST /api/coins/request ──────────────────────────────
// User requests manual coin top-up from admin
export const requestCoins = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount, note } = req.body;

  if (!amount || amount <= 0) {
    res.status(400).json({ success: false, message: 'Invalid amount.' });
    return;
  }

  // Create a pending transaction record
  const transaction = await CoinTransaction.create({
    userId: req.user!._id,
    amount: parseInt(amount),
    type: 'credit',
    reason: note || `Manual coin request for ${amount} coins`,
    balanceAfter: req.user!.coinBalance, // will be updated when approved
    paymentMethod: 'manual',
    isVerified: false,
  });

  res.status(201).json({
    success: true,
    message: 'Coin request submitted. An admin will review and add coins to your account.',
    transaction,
  });
});
