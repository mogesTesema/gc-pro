import { Request, Response } from 'express';
import Application from '../models/Application.model';
import Campaign from '../models/Campaign.model';
import User from '../models/User.model';
import { Chat } from '../models/Message.model';
import CoinTransaction from '../models/CoinTransaction.model';
import Notification from '../models/Notification.model';
import Profile from '../models/Profile.model';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { COIN_COSTS, NOTIFICATION_TYPES } from '../config/constants';

// ─── POST /api/applications ───────────────────────────────
export const applyToCampaign = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { campaignId, message, proposedRate } = req.body;

  // Check coin balance
  if (user.coinBalance < COIN_COSTS.APPLY_CAMPAIGN) {
    res.status(402).json({
      success: false,
      message: `Insufficient coins. You need ${COIN_COSTS.APPLY_CAMPAIGN} coins to apply.`,
      coinBalance: user.coinBalance,
      required: COIN_COSTS.APPLY_CAMPAIGN,
    });
    return;
  }

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    res.status(404).json({ success: false, message: 'Campaign not found.' });
    return;
  }

  if (campaign.status !== 'open') {
    res.status(400).json({ success: false, message: 'This campaign is no longer accepting applications.' });
    return;
  }

  if (campaign.postedBy.toString() === user._id.toString()) {
    res.status(400).json({ success: false, message: 'You cannot apply to your own campaign.' });
    return;
  }

  const existingApp = await Application.findOne({ campaignId, applicantId: user._id });
  if (existingApp) {
    res.status(409).json({ success: false, message: 'You have already applied to this campaign.' });
    return;
  }

  // Create application
  const application = await Application.create({
    campaignId,
    applicantId: user._id,
    businessId: campaign.postedBy,
    message,
    proposedRate: proposedRate || null,
  });

  // Deduct coins
  const newBalance = user.coinBalance - COIN_COSTS.APPLY_CAMPAIGN;
  await User.findByIdAndUpdate(user._id, { coinBalance: newBalance });
  await CoinTransaction.create({
    userId: user._id,
    amount: COIN_COSTS.APPLY_CAMPAIGN,
    type: 'debit',
    reason: `Applied to campaign: "${campaign.title}"`,
    balanceAfter: newBalance,
    paymentMethod: 'system',
    isVerified: true,
  });

  // Increment application count on campaign
  await Campaign.findByIdAndUpdate(campaignId, { $inc: { applicationsCount: 1 } });

  // Notify business owner
  await Notification.create({
    userId: campaign.postedBy,
    senderId: user._id,
    type: NOTIFICATION_TYPES.NEW_APPLICATION,
    title: 'New Application Received',
    message: `${user.name} applied to your campaign "${campaign.title}".`,
    refId: application._id,
    refModel: 'Application',
  });

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully.',
    application,
    coinsDeducted: COIN_COSTS.APPLY_CAMPAIGN,
    newCoinBalance: newBalance,
  });
});

// ─── GET /api/applications/my ─────────────────────────────
export const getMyApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const applications = await Application.find({ applicantId: req.user!._id })
    .populate('campaignId', 'title status budget niche postedBy')
    .populate({ path: 'campaignId', populate: { path: 'postedBy', select: 'name avatar' } })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, applications });
});

// ─── GET /api/applications/campaign/:campaignId ───────────
export const getCampaignApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const campaign = await Campaign.findById(req.params.campaignId);

  if (!campaign) {
    res.status(404).json({ success: false, message: 'Campaign not found.' });
    return;
  }

  if (campaign.postedBy.toString() !== req.user!._id.toString() &&
      !['admin', 'superadmin'].includes(req.user!.role)) {
    res.status(403).json({ success: false, message: 'Not authorized.' });
    return;
  }

  const applications = await Application.find({ campaignId: req.params.campaignId })
    .populate('applicantId', 'name avatar email coinBalance')
    .populate({
      path: 'applicantId',
      populate: { path: '_id', model: 'Profile' },
    })
    .sort({ aiScore: -1, createdAt: 1 });

  // Enrich with profile data
  const enriched = await Promise.all(
    applications.map(async (app) => {
      const profile = await Profile.findOne({ userId: (app.applicantId as any)._id });
      return { ...app.toObject(), applicantProfile: profile };
    })
  );

  res.status(200).json({ success: true, applications: enriched });
});

// ─── PUT /api/applications/:id/accept ────────────────────
export const acceptApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found.' });
    return;
  }

  if (application.businessId.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, message: 'Not authorized.' });
    return;
  }

  if (application.status !== 'pending') {
    res.status(400).json({ success: false, message: 'Application is no longer pending.' });
    return;
  }

  // Accept this application
  application.status = 'accepted';
  application.collaborationStatus = 'negotiating';

  // Create chat between creator and business
  let chat = await Chat.findOne({
    participants: { $all: [application.applicantId, application.businessId] },
    applicationId: application._id,
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [application.applicantId, application.businessId],
      applicationId: application._id,
    });
  }

  application.chatId = chat._id;
  await application.save();

  // Update campaign status
  await Campaign.findByIdAndUpdate(application.campaignId, {
    status: 'in_progress',
    selectedCreator: application.applicantId,
  });

  // Reject all other pending applications for this campaign
  await Application.updateMany(
    {
      campaignId: application.campaignId,
      _id: { $ne: application._id },
      status: 'pending',
    },
    { status: 'rejected' }
  );

  // Notify the creator
  const business = req.user!;
  const campaign = await Campaign.findById(application.campaignId);

  await Notification.create({
    userId: application.applicantId,
    senderId: business._id,
    type: NOTIFICATION_TYPES.APPLICATION_ACCEPTED,
    title: 'Application Accepted! 🎉',
    message: `Your application for "${campaign?.title}" was accepted. You can now chat with the business owner.`,
    refId: application._id,
    refModel: 'Application',
  });

  res.status(200).json({
    success: true,
    message: 'Application accepted. Chat created.',
    application,
    chatId: chat._id,
  });
});

// ─── PUT /api/applications/:id/reject ────────────────────
export const rejectApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found.' });
    return;
  }

  if (application.businessId.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, message: 'Not authorized.' });
    return;
  }

  application.status = 'rejected';
  await application.save();

  const campaign = await Campaign.findById(application.campaignId);
  await Notification.create({
    userId: application.applicantId,
    senderId: req.user!._id,
    type: NOTIFICATION_TYPES.APPLICATION_REJECTED,
    title: 'Application Update',
    message: `Your application for "${campaign?.title}" was not selected this time.`,
    refId: application._id,
    refModel: 'Application',
  });

  res.status(200).json({ success: true, message: 'Application rejected.', application });
});

// ─── PUT /api/applications/:id/complete ──────────────────
export const markComplete = asyncHandler(async (req: AuthRequest, res: Response) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found.' });
    return;
  }

  const userId = req.user!._id.toString();
  const isCreator = application.applicantId.toString() === userId;
  const isBusiness = application.businessId.toString() === userId;

  if (!isCreator && !isBusiness) {
    res.status(403).json({ success: false, message: 'Not authorized.' });
    return;
  }

  if (isCreator) application.creatorMarkedComplete = true;
  if (isBusiness) application.businessMarkedComplete = true;

  // If both marked complete → fully complete
  if (application.creatorMarkedComplete && application.businessMarkedComplete) {
    application.collaborationStatus = 'completed';
    await Campaign.findByIdAndUpdate(application.campaignId, { status: 'completed' });

    // Notify both to rate each other
    await Notification.insertMany([
      {
        userId: application.applicantId,
        type: NOTIFICATION_TYPES.WORK_COMPLETED,
        title: 'Work Completed! Rate the Business Owner',
        message: 'Collaboration complete! Please rate your experience.',
        refId: application._id,
        refModel: 'Application',
      },
      {
        userId: application.businessId,
        type: NOTIFICATION_TYPES.WORK_COMPLETED,
        title: 'Work Completed! Rate the Creator',
        message: 'Collaboration complete! Please rate the creator.',
        refId: application._id,
        refModel: 'Application',
      },
    ]);
  }

  await application.save();

  res.status(200).json({
    success: true,
    message: 'Marked as complete.',
    bothCompleted: application.creatorMarkedComplete && application.businessMarkedComplete,
    application,
  });
});
