import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  hostId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  stock: number;
  sold: number;
  images: string[];
  thumbnail?: string;
  material?: string;
  origin?: string;
  originAddress?: {
    addressLine: string; ward?: string; district?: string;
    city: string; province: string; country: string; fullAddress: string;
  };
  weight?: number;
  status: 'ACTIVE' | 'HIDDEN' | 'OUT_OF_STOCK' | 'DELETED';
  averageRating: number;
  totalReviews: number;
}

const productSchema = new Schema<IProduct>(
  {
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    shortDescription: String,
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    sold: { type: Number, default: 0 },
    images: [String],
    thumbnail: String,
    material: String,
    origin: String,
    originAddress: {
      addressLine: String, ward: String, district: String,
      city: String, province: String, country: { type: String, default: 'Việt Nam' },
      fullAddress: String,
    },
    weight: Number,
    status: { type: String, enum: ['ACTIVE', 'HIDDEN', 'OUT_OF_STOCK', 'DELETED'], default: 'ACTIVE' },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ hostId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', productSchema);
