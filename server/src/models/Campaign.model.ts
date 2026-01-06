import mongoose, { Document, Schema } from 'mongoose';
import { CAMPAIGN_STATUS } from '../config/constants';

export interface ICampaign extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  budget: number;
  currency: string;
  duration: number; // days
  niche: string[];
  requiredSkills: string[];
  targetAudience: string;
  platform: string[];
  requirements: string;
  postedBy: mongoose.Types.ObjectId;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  applicationsCount: number;
  selectedCreator?: mongoose.Types.ObjectId;
  minFollowers?: number;
  location?: string;
  tags: string[];
  attachments: string[];
  aiIndexed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Campaign description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget must be a positive number'],
    },
    currency: {
      type: String,
      default: 'ETB',
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required (in days)'],
      min: [1, 'Duration must be at least 1 day'],
    },
    niche: {
      type: [String],
      required: [true, 'At least one niche is required'],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    targetAudience: {
      type: String,
      default: '',
      maxlength: [500, 'Target audience cannot exceed 500 characters'],
    },
    platform: {
      type: [String],
      enum: ['youtube', 'tiktok', 'instagram', 'twitter', 'facebook', 'tv', 'other'],
      default: [],
    },
    requirements: {
      type: String,
      default: '',
      maxlength: [1000, 'Requirements cannot exceed 1000 characters'],
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CAMPAIGN_STATUS),
      default: CAMPAIGN_STATUS.OPEN,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    selectedCreator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    minFollowers: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    attachments: {
      type: [String],
      default: [],
    },
    aiIndexed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Text search index ────────────────────────────────────
CampaignSchema.index({ title: 'text', description: 'text', tags: 'text' });

// ─── Filter indexes ───────────────────────────────────────
CampaignSchema.index({ status: 1 });
CampaignSchema.index({ postedBy: 1 });
CampaignSchema.index({ niche: 1 });
CampaignSchema.index({ budget: 1 });
CampaignSchema.index({ createdAt: -1 });

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);
