import { Request, Response } from 'express';
import User from '../models/User.model';
import Profile from '../models/Profile.model';
import ActivityLog from '../models/ActivityLog.model';
import Dispute from '../models/Dispute.model';
import Campaign from '../models/Campaign.model';
import Application from '../models/Application.model';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

// ─── GET /api/superadmin/stats ────────────────────────────
export const getSuperAdminStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [
    totalUsers, totalAdmins, totalCreators, totalBusinesses,
    totalCampaigns, totalApplications, totalDisputes, openDisputes,
    recentLogs
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: { $in: ['admin', 'superadmin'] } }),
    User.countDocuments({ role: 'creator' }),
    User.countDocuments({ role: 'business' }),
    Campaign.countDocuments(),
    Application.countDocuments(),
    Dispute.countDocuments(),
    Dispute.countDocuments({ status: 'open' }),
    ActivityLog.find().sort({ createdAt: -1 }).limit(5).populate('actorId', 'name role'),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers, totalAdmins, totalCreators, totalBusinesses,
      totalCampaigns, totalApplications, totalDisputes, openDisputes,
    },
    recentLogs,
  });
});

// ─── GET /api/superadmin/admins ───────────────────────────
export const getAdmins = asyncHandler(async (req: AuthRequest, res: Response) => {
  const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } })
    .select('-password')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, admins });
});

// ─── POST /api/superadmin/admins ──────────────────────────
export const createAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400).json({ success: false, message: 'Email already in use.' });
    return;
  }
  const admin = await User.create({
    name, email, password,
    role: 'admin',
    profileStatus: 'approved',
    isActive: true,
    coinBalance: 0,
  });

  await ActivityLog.create({
    actorId: req.user!._id,
    actorRole: req.user!.role,
    action: 'CREATE_ADMIN',
    targetId: admin._id,
    targetModel: 'User',
    details: `Created admin account for ${email}`,
  });

  res.status(201).json({ success: true, message: 'Admin created.', admin: { ...admin.toJSON(), password: undefined } });
});

// ─── PUT /api/superadmin/admins/:id ──────────────────────
export const updateAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, isActive } = req.body;
  const admin = await User.findById(req.params.id);
  if (!admin || !['admin', 'superadmin'].includes(admin.role)) {
    res.status(404).json({ success: false, message: 'Admin not found.' });
    return;
  }
  if (admin.role === 'superadmin' && req.user!.role !== 'superadmin') {
    res.status(403).json({ success: false, message: 'Cannot modify a superadmin.' });
    return;
  }
  if (name) admin.name = name;
  if (email) admin.email = email;
  if (typeof isActive === 'boolean') admin.isActive = isActive;
  await admin.save();

  await ActivityLog.create({
    actorId: req.user!._id,
    actorRole: req.user!.role,
    action: 'UPDATE_ADMIN',
    targetId: admin._id,
    targetModel: 'User',
    details: `Updated admin ${admin.email}`,
  });

  res.status(200).json({ success: true, message: 'Admin updated.', admin });
});

// ─── DELETE /api/superadmin/admins/:id ───────────────────
export const deleteAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const admin = await User.findById(req.params.id);
  if (!admin || admin.role === 'superadmin') {
    res.status(403).json({ success: false, message: 'Cannot delete this account.' });
    return;
  }
  await admin.deleteOne();

  await ActivityLog.create({
    actorId: req.user!._id,
    actorRole: req.user!.role,
    action: 'DELETE_ADMIN',
    details: `Deleted admin ${admin.email}`,
  });

  res.status(200).json({ success: true, message: 'Admin deleted.' });
});

// ─── GET /api/superadmin/activity-logs ───────────────────
export const getActivityLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 30, actorId, action } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const filter: any = {};
  if (actorId) filter.actorId = actorId;
  if (action) filter.action = action;

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate('actorId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string)),
    ActivityLog.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, logs, total, page: parseInt(page as string) });
});

// ─── GET /api/superadmin/disputes ────────────────────────
export const getDisputes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const filter: any = {};
  if (status) filter.status = status;

  const [disputes, total] = await Promise.all([
    Dispute.find(filter)
      .populate('raisedBy', 'name email role avatar')
      .populate('againstUser', 'name email role avatar')
      .populate('applicationId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string)),
    Dispute.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, disputes, total });
});

// ─── POST /api/superadmin/disputes ───────────────────────
export const createDispute = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { applicationId, againstUser, title, description, evidence } = req.body;
  const dispute = await Dispute.create({
    applicationId, againstUser,
    raisedBy: req.user!._id,
    title, description, evidence: evidence || [],
    status: 'open',
  });
  res.status(201).json({ success: true, dispute });
});

// ─── PUT /api/superadmin/disputes/:id/resolve ────────────
export const resolveDispute = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { resolution, status } = req.body;
  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) {
    res.status(404).json({ success: false, message: 'Dispute not found.' });
    return;
  }
  dispute.resolution = resolution;
  dispute.status = status || 'resolved';
  dispute.resolvedBy = req.user!._id;
  dispute.resolvedAt = new Date();
  await dispute.save();

  await ActivityLog.create({
    actorId: req.user!._id,
    actorRole: req.user!.role,
    action: 'RESOLVE_DISPUTE',
    targetId: dispute._id,
    targetModel: 'Dispute',
    details: `Resolved dispute: ${dispute.title} → ${dispute.status}`,
  });

  res.status(200).json({ success: true, message: 'Dispute updated.', dispute });
});
