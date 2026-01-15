import mongoose, { Document, Schema } from 'mongoose';

// ────────────────────────────────────────────────────────
// CHAT MODEL — represents a conversation between 2 users
// ────────────────────────────────────────────────────────
export interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];   // [creatorId, businessId]
  applicationId?: mongoose.Types.ObjectId;   // linked collaboration
  lastMessage?: string;
  lastMessageAt?: Date;
  lastMessageSender?: mongoose.Types.ObjectId;
  unreadCount: Map<string, number>;          // userId → unread count
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      default: null,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    lastMessageSender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one chat between two participants per application
ChatSchema.index({ participants: 1 });
ChatSchema.index({ applicationId: 1 });

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);

// ────────────────────────────────────────────────────────
// MESSAGE MODEL — individual messages within a chat
// ────────────────────────────────────────────────────────
export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  mediaUrl?: string;
  fileName?: string;
  isRead: boolean;
  readAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ chatId: 1, createdAt: 1 });
MessageSchema.index({ senderId: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
