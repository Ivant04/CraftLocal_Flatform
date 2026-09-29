import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderCode: string;
  touristId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    name: string; image: string; price: number; quantity: number; subtotal: number;
  }>;
  shippingAddress: {
    fullName: string; phone: string; addressLine: string;
    ward?: string; district?: string; city: string;
    province: string; country: string; fullAddress: string; note?: string;
  };
  productTotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PACKING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  paymentId?: mongoose.Types.ObjectId;
  confirmedAt?: Date;
  packedAt?: Date;
  shippedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  trackingNumber?: string;
  shippingProvider?: string;
}

const orderSchema = new Schema<IOrder>(
  {
    orderCode: { type: String, required: true, unique: true },
    touristId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
      productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      image: String, price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      subtotal: { type: Number, required: true },
    }],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine: { type: String, required: true },
      ward: String, district: String,
      city: { type: String, required: true },
      province: { type: String, required: true },
      country: { type: String, default: 'Việt Nam' },
      fullAddress: { type: String, required: true },
      note: String,
    },
    productTotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 30000 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    orderStatus: { type: String, enum: ['PENDING', 'CONFIRMED', 'PACKING', 'SHIPPING', 'COMPLETED', 'CANCELLED', 'REFUNDED'], default: 'PENDING' },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    confirmedAt: Date, packedAt: Date, shippedAt: Date,
    completedAt: Date, cancelledAt: Date,
    trackingNumber: String, shippingProvider: String,
  },
  { timestamps: true }
);

orderSchema.index({ touristId: 1 });
orderSchema.index({ hostId: 1 });
orderSchema.index({ orderStatus: 1 });

export default mongoose.model<IOrder>('Order', orderSchema);
