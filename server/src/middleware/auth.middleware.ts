import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.model';

// ─── Extend Express Request ───────────────────────────────
export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

// ─── Verify JWT token ─────────────────────────────────────
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  // Check Authorization header (Bearer token)
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Fallback: check cookie
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Token invalid — user not found.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Your account has been suspended.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : 'Invalid token.';

    res.status(401).json({ success: false, message });
  }
};

// ─── Role-based access control ────────────────────────────
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not permitted to perform this action.`,
      });
      return;
    }

    next();
  };
};

// ─── Require approved profile ─────────────────────────────
export const requireApprovedProfile = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  // Admins and superadmins skip profile approval check
  if (req.user.role === 'admin' || req.user.role === 'superadmin') {
    return next();
  }

  if (req.user.profileStatus !== 'approved') {
    res.status(403).json({
      success: false,
      message: 'Your profile must be approved before performing this action.',
      profileStatus: req.user.profileStatus,
    });
    return;
  }

  next();
};

// ─── Generate JWT ─────────────────────────────────────────
export const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  } as jwt.SignOptions);
};
