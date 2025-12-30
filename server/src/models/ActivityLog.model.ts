import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  actorId: mongoose.Types.ObjectId;
  actorRole: string;
  action: string;
  targetId?: mongoose.Types.ObjectId;
  targetModel?: string;
  details?: string;
  ip?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId },
    targetModel: { type: String },
    details: { type: String, default: '' },
    ip: { type: String, default: '' },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ actorId: 1 });
ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ action: 1 });

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
