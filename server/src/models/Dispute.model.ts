import mongoose, { Document, Schema } from 'mongoose';

export interface IDispute extends Document {
  applicationId: mongoose.Types.ObjectId;
  raisedBy: mongoose.Types.ObjectId;
  againstUser: mongoose.Types.ObjectId;
  title: string;
  description: string;
  evidence?: string[];
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  resolution?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    againstUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    evidence: [{ type: String }],
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'dismissed'],
      default: 'open',
    },
    resolution: { type: String, default: '' },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

DisputeSchema.index({ status: 1 });
DisputeSchema.index({ raisedBy: 1 });

export default mongoose.model<IDispute>('Dispute', DisputeSchema);
