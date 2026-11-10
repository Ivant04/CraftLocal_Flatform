import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  paymentCode: string;
  userId: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  amount: number;
  method: 'VNPAY' | 'MOMO' | 'CASH' | 'PAYOS';
  provider?: string;
  orderCode?: number;
  checkoutUrl?: string;
  paymentLinkId?: string;
  qrCode?: string;
  payosResponse?: Record<string, any>;
  webhookData?: Record<string, any>;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  transactionCode?: string;
  paymentUrl?: string;
  gateway?: { name: string; requestId?: string; transactionId?: string; responseCode?: string; message?: string };
  gatewayResponse?: Record<string, any>;
  paidAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    paymentCode: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['VNPAY', 'MOMO', 'CASH', 'PAYOS'], default: 'PAYOS' },
    provider: { type: String, default: 'PAYOS' },
    orderCode: { type: Number },
    checkoutUrl: { type: String },
    paymentLinkId: { type: String },
    qrCode: { type: String },
    payosResponse: { type: Schema.Types.Mixed },
    webhookData: { type: Schema.Types.Mixed },
    paymentStatus: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'], default: 'PENDING' },
    transactionCode: String,
    paymentUrl: String,
    gateway: { name: String, requestId: String, transactionId: String, responseCode: String, message: String },
    gatewayResponse: Schema.Types.Mixed,
    paidAt: Date,
    cancelledAt: Date,
    refundedAt: Date,
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ orderCode: 1 });

export default mongoose.model<IPayment>('Payment', paymentSchema);
