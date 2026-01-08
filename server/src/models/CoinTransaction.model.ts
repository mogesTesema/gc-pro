import mongoose, { Document, Schema } from 'mongoose';
import { COIN_TX_TYPE } from '../config/constants';

export interface ICoinTransaction extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: 'credit' | 'debit';
  reason: string;           // e.g. "Posted campaign", "Applied to campaign", "Admin top-up"
  balanceAfter: number;     // snapshot of balance after transaction
  referenceId?: string;     // Chapa transaction reference or admin ID
  paymentMethod?: 'chapa' | 'manual' | 'system';
  isVerified: boolean;
  verifiedBy?: mongoose.Types.ObjectId; // Admin who verified (manual only)
  createdAt: Date;
}

const CoinTransactionSchema = new Schema<ICoinTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be at least 1'],
    },
    type: {
      type: String,
      enum: Object.values(COIN_TX_TYPE),
      required: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: [200, 'Reason cannot exceed 200 characters'],
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    referenceId: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ['chapa', 'manual', 'system'],
      default: 'system',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // immutable record
  }
);

CoinTransactionSchema.index({ userId: 1, createdAt: -1 });
CoinTransactionSchema.index({ type: 1 });

export default mongoose.model<ICoinTransaction>('CoinTransaction', CoinTransactionSchema);
