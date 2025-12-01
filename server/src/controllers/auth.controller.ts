import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User.model';
import Profile from '../models/Profile.model';
import { generateToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

// ─── Helper: send token response ─────────────────────────
const sendTokenResponse = (res: Response, user: any, statusCode: number) => {
  const token = generateToken(user._id.toString(), user.role);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      coinBalance: user.coinBalance,
      profileStatus: user.profileStatus,
      avatar: user.avatar,
    },
  });
};

// ─── POST /api/auth/register ──────────────────────────────
export const register = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { name, email, password, role } = req.body;

  // Check allowed roles for self-registration
  if (!['creator', 'business'].includes(role)) {
    res.status(400).json({
      success: false,
      message: 'Role must be either "creator" or "business".',
    });
    return;
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409).json({
      success: false,
      message: 'An account with this email already exists.',
    });
    return;
  }

  // Create user
  const user = await User.create({ name, email, password, role });

  // Auto-create empty profile
  await Profile.create({ userId: user._id });

  sendTokenResponse(res, user, 201);
});

// ─── POST /api/auth/login ─────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  // Include password field (excluded by default)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
    return;
  }

  if (!user.isActive) {
    res.status(401).json({
      success: false,
      message: 'Your account has been suspended. Contact support.',
    });
    return;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
    return;
  }

  sendTokenResponse(res, user, 200);
});

// ─── GET /api/auth/me ─────────────────────────────────────
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  // Also pull their profile
  const profile = await Profile.findOne({ userId: user._id });

  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      coinBalance: user.coinBalance,
      profileStatus: user.profileStatus,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
    profile: profile || null,
  });
});

// ─── PUT /api/auth/change-password ───────────────────────
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({
      success: false,
      message: 'Please provide current and new password.',
    });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters.',
    });
    return;
  }

  const user = await User.findById(req.user!._id).select('+password');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    return;
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated successfully.' });
});
