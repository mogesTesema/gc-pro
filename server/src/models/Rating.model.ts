import mongoose, { Document, Schema } from 'mongoose';

export interface IRating extends Document {
  _id: mongoose.Types.ObjectId;
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  score: number;           // Overall: 1-5
  communication: number;
  professionalism: number;
  timeliness: number;
  qualityOfWork: number;
  comment?: string;
  createdAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: [1, 'Score must be at least 1'],
      max: [5, 'Score cannot exceed 5'],
    },
    communication: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    professionalism: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    timeliness: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    qualityOfWork: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// One rating per person per application
RatingSchema.index({ fromUserId: 1, applicationId: 1 }, { unique: true });
RatingSchema.index({ toUserId: 1 });

export default mongoose.model<IRating>('Rating', RatingSchema);
