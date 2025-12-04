import { Request, Response } from 'express';
import Campaign from '../models/Campaign.model';
import User from '../models/User.model';
import CoinTransaction from '../models/CoinTransaction.model';
import Notification from '../models/Notification.model';
import Profile from '../models/Profile.model';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { COIN_COSTS, NOTIFICATION_TYPES, PAGINATION } from '../config/constants';

// ─── POST /api/campaigns ──────────────────────────────────
export const createCampaign = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  // Check coin balance
  if (user.coinBalance < COIN_COSTS.POST_CAMPAIGN) {
    res.status(402).json({
      success: false,
      message: `Insufficient coins. You need ${COIN_COSTS.POST_CAMPAIGN} coins to post a campaign.`,
      coinBalance: user.coinBalance,
      required: COIN_COSTS.POST_CAMPAIGN,
    });
    return;
  }

  const {
    title, description, budget, currency, duration,
    niche, requiredSkills, targetAudience, platform,
    requirements, minFollowers, location, tags,
  } = req.body;

  // Deduct coins and create campaign atomically
  const campaign = await Campaign.create({
    title, description, budget, currency, duration,
    niche: Array.isArray(niche) ? niche : [niche],
    requiredSkills: requiredSkills || [],
    targetAudience: targetAudience || '',
    platform: Array.isArray(platform) ? platform : (platform ? [platform] : []),
    requirements: requirements || '',
    postedBy: user._id,
    minFollowers: minFollowers || 0,
    location: location || '',
    tags: tags || [],
  });

  // Deduct coins
  const newBalance = user.coinBalance - COIN_COSTS.POST_CAMPAIGN;
  await User.findByIdAndUpdate(user._id, { coinBalance: newBalance });
  await CoinTransaction.create({
    userId: user._id,
    amount: COIN_COSTS.POST_CAMPAIGN,
    type: 'debit',
    reason: `Posted campaign: "${campaign.title}"`,
    balanceAfter: newBalance,
    paymentMethod: 'system',
    isVerified: true,
  });

  // Notify matching creators (basic: by niche)
  if (niche && niche.length > 0) {
    const matchingProfiles = await Profile.find({
      niche: { $in: Array.isArray(niche) ? niche : [niche] },
      approvalStatus: 'approved',
    }).select('userId').limit(50);

    const notifications = matchingProfiles.map((p) => ({
      userId: p.userId,
      senderId: user._id,
      type: NOTIFICATION_TYPES.CAMPAIGN_MATCH,
      title: 'New Campaign Matches Your Profile!',
      message: `A new campaign "${campaign.title}" matches your niche. Apply now!`,
      refId: campaign._id,
      refModel: 'Campaign',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  }

  res.status(201).json({
    success: true,
    message: 'Campaign posted successfully.',
    campaign,
    coinsDeducted: COIN_COSTS.POST_CAMPAIGN,
    newCoinBalance: newBalance,
  });
});

// ─── GET /api/campaigns ───────────────────────────────────
export const getCampaigns = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = { status: 'open' };

  if (req.query.niche) {
    filter.niche = { $in: (req.query.niche as string).split(',') };
  }
  if (req.query.minBudget || req.query.maxBudget) {
    filter.budget = {};
    if (req.query.minBudget) filter.budget.$gte = parseInt(req.query.minBudget as string);
    if (req.query.maxBudget) filter.budget.$lte = parseInt(req.query.maxBudget as string);
  }
  if (req.query.platform) {
    filter.platform = { $in: (req.query.platform as string).split(',') };
  }
  if (req.query.location) {
    filter.location = { $regex: req.query.location as string, $options: 'i' };
  }
  if (req.query.search) {
    filter.$text = { $search: req.query.search as string };
  }

  const sortMap: Record<string, any> = {
    recent: { createdAt: -1 },
    budget_high: { budget: -1 },
    budget_low: { budget: 1 },
  };
  const sort = sortMap[req.query.sort as string] || sortMap.recent;

  const [campaigns, total] = await Promise.all([
    Campaign.find(filter)
      .populate('postedBy', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Campaign.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    campaigns,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ─── GET /api/campaigns/:id ───────────────────────────────
export const getCampaignById = asyncHandler(async (req: Request, res: Response) => {
  const campaign = await Campaign.findById(req.params.id)
    .populate('postedBy', 'name avatar email')
    .populate('selectedCreator', 'name avatar');

  if (!campaign) {
    res.status(404).json({ success: false, message: 'Campaign not found.' });
    return;
  }

  res.status(200).json({ success: true, campaign });
});

// ─── GET /api/campaigns/my ────────────────────────────────
export const getMyCampaigns = asyncHandler(async (req: AuthRequest, res: Response) => {
  const campaigns = await Campaign.find({ postedBy: req.user!._id })
    .populate('selectedCreator', 'name avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, campaigns });
});

// ─── PUT /api/campaigns/:id ───────────────────────────────
export const updateCampaign = asyncHandler(async (req: AuthRequest, res: Response) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    res.status(404).json({ success: false, message: 'Campaign not found.' });
    return;
  }

  if (campaign.postedBy.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, message: 'Not authorized to update this campaign.' });
    return;
  }

  if (campaign.status !== 'open') {
    res.status(400).json({
      success: false,
      message: 'Only open campaigns can be updated.',
    });
    return;
  }

  const updatableFields = ['title', 'description', 'budget', 'duration', 'niche',
    'requiredSkills', 'targetAudience', 'platform', 'requirements', 'minFollowers',
    'location', 'tags'];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      (campaign as any)[field] = req.body[field];
    }
  });

  await campaign.save();
  res.status(200).json({ success: true, campaign });
});

// ─── DELETE /api/campaigns/:id ────────────────────────────
export const deleteCampaign = asyncHandler(async (req: AuthRequest, res: Response) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    res.status(404).json({ success: false, message: 'Campaign not found.' });
    return;
  }

  if (
    campaign.postedBy.toString() !== req.user!._id.toString() &&
    !['admin', 'superadmin'].includes(req.user!.role)
  ) {
    res.status(403).json({ success: false, message: 'Not authorized.' });
    return;
  }

  await campaign.deleteOne();
  res.status(200).json({ success: true, message: 'Campaign deleted.' });
});

// ─── POST /api/campaigns/:id/bookmark ────────────────────
export const toggleBookmark = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { id } = req.params;

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    res.status(404).json({ success: false, message: 'Campaign not found.' });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  const bookmarks: any[] = (user as any).bookmarks || [];
  const idx = bookmarks.findIndex((b: any) => b.toString() === id.toString());
  let bookmarked: boolean;

  if (idx === -1) {
    bookmarks.push(id);
    bookmarked = true;
  } else {
    bookmarks.splice(idx, 1);
    bookmarked = false;
  }

  await User.findByIdAndUpdate(userId, { bookmarks });

  res.status(200).json({
    success: true,
    bookmarked,
    message: bookmarked ? 'Campaign bookmarked.' : 'Bookmark removed.',
  });
});
