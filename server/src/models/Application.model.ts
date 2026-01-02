import mongoose, { Document, Schema } from 'mongoose';
import { APPLICATION_STATUS, COLLABORATION_STATUS } from '../config/constants';

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;   // Creator
  businessId: mongoose.Types.ObjectId;    // Business owner (campaign poster)
  message: string;
  proposedRate?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  collaborationStatus?: 'negotiating' | 'active' | 'completed' | 'disputed';
  aiScore?: number;        // AI-computed match score 0-100
  aiAnalysis?: string;     // AI analysis text
  creatorMarkedComplete: boolean;
  businessMarkedComplete: boolean;
  chatId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Application message is required'],
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    proposedRate: {
      type: Number,
      min: [0, 'Rate must be positive'],
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.PENDING,
    },
    collaborationStatus: {
      type: String,
      enum: Object.values(COLLABORATION_STATUS),
      default: null,
    },
    aiScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    aiAnalysis: {
      type: String,
      default: '',
    },
    creatorMarkedComplete: {
      type: Boolean,
      default: false,
    },
    businessMarkedComplete: {
      type: Boolean,
      default: false,
    },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Prevent duplicate applications ──────────────────────
ApplicationSchema.index({ campaignId: 1, applicantId: 1 }, { unique: true });

// ─── Query indexes ────────────────────────────────────────
ApplicationSchema.index({ applicantId: 1, status: 1 });
ApplicationSchema.index({ businessId: 1, status: 1 });
ApplicationSchema.index({ campaignId: 1 });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
