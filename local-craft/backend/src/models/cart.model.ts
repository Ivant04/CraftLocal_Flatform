import mongoose, { Schema, Document } from 'mongoose';

export interface ICart extends Document {
  touristId: mongoose.Types.ObjectId;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    hostId: mongoose.Types.ObjectId;
    name: string; image: string; price: number; quantity: number; subtotal: number;
  }>;
  totalItems: number;
  totalAmount: number;
}

const cartSchema = new Schema<ICart>(
  {
    touristId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [{
      productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      image: String,
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
      subtotal: { type: Number, required: true },
    }],
    totalItems: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ICart>('Cart', cartSchema);
