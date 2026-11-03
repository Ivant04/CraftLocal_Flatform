import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlist extends Document {
  touristId: mongoose.Types.ObjectId;
  itemType: 'WORKSHOP' | 'PRODUCT';
  workshopId?: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    touristId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: { type: String, enum: ['WORKSHOP', 'PRODUCT'], required: true },
    workshopId: { type: Schema.Types.ObjectId, ref: 'Workshop' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  },
  { timestamps: true }
);

wishlistSchema.index({ touristId: 1 });
wishlistSchema.index({ touristId: 1, itemType: 1 });

export default mongoose.model<IWishlist>('Wishlist', wishlistSchema);
