import mongoose, { Document, Schema } from 'mongoose';
import { NOTIFICATION_TYPES } from '../config/constants';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;      // recipient
  senderId?: mongoose.Types.ObjectId;   // who triggered it
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
  refId?: mongoose.Types.ObjectId;      // related resource (campaign, application, etc.)
  refModel?: string;                    // 'Campaign' | 'Application' | 'Chat'
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    refId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    refModel: {
      type: String,
      enum: ['Campaign', 'Application', 'Chat', 'User', null],
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
