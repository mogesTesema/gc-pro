import mongoose, { Document, Schema } from 'mongoose';
import { PROFILE_STATUS } from '../config/constants';

// ─── Sub-schemas ─────────────────────────────────────────
const SocialLinksSchema = new Schema(
  {
    youtube: { type: String, default: '' },
    tiktok: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  { _id: false }
);

const PortfolioItemSchema = new Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, default: '' },
    mediaType: { type: String, enum: ['video', 'image', 'link'], default: 'link' },
  },
  { timestamps: true }
);

const PerformanceMetricsSchema = new Schema(
  {
    avgViews: { type: Number, default: 0 },
    avgLikes: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 }, // percentage
    completedCollaborations: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalEarnings: { type: Number, default: 0 },
  },
  { _id: false }
);

// ─── Main Profile Interface ───────────────────────────────
export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  bio: string;
  location: string;
  phone?: string;

  // Creator-specific
  niche?: string[];
  skills?: string[];
  followers?: number;
  platform?: string; // youtube, tiktok, instagram, etc.
  socialLinks?: {
    youtube?: string;
    tiktok?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  portfolio?: Array<{
    title: string;
    url: string;
    description: string;
    mediaType: string;
  }>;
  performanceMetrics?: {
    avgViews: number;
    avgLikes: number;
    engagementRate: number;
    completedCollaborations: number;
    averageRating: number;
    totalEarnings: number;
  };

  // Business-specific
  businessName?: string;
  industry?: string;
  companySize?: string;
  targetAudience?: string;
  website?: string;

  // Approval
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    location: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },

    // ── Creator Fields ──────────────────────────────────
    niche: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true }],
    followers: { type: Number, default: 0 },
    platform: {
      type: String,
      enum: ['youtube', 'tiktok', 'instagram', 'twitter', 'facebook', 'other', ''],
      default: '',
    },
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },
    portfolio: [PortfolioItemSchema],
    performanceMetrics: {
      type: PerformanceMetricsSchema,
      default: () => ({}),
    },

    // ── Business Fields ─────────────────────────────────
    businessName: { type: String, default: '' },
    industry: { type: String, default: '' },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+', ''],
      default: '',
    },
    targetAudience: { type: String, default: '' },
    website: { type: String, default: '' },

    // ── Approval ────────────────────────────────────────
    approvalStatus: {
      type: String,
      enum: Object.values(PROFILE_STATUS),
      default: PROFILE_STATUS.PENDING,
    },
    rejectionReason: { type: String, default: '' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────
ProfileSchema.index({ userId: 1 });
ProfileSchema.index({ approvalStatus: 1 });
ProfileSchema.index({ niche: 1 });
ProfileSchema.index({ skills: 1 });
ProfileSchema.index({ location: 1 });
ProfileSchema.index({ followers: -1 });

export default mongoose.model<IProfile>('Profile', ProfileSchema);
