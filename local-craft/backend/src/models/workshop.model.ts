import mongoose, { Schema, Document } from 'mongoose';
import type { WorkshopPromotion } from '../../../shared/workshopPricing';

export interface IWorkshop extends Document {
  hostId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  address: {
    addressLine: string; ward?: string; district?: string;
    city: string; province: string; country: string; fullAddress: string;
  };
  locationLabel: string;
  mapLocation: { lat: number; lng: number };
  hostName: string;
  hostPhone: string;
  hostWorkshopName: string;
  price: number;
  promotion?: WorkshopPromotion | null;
  duration: number;
  maxGuestsPerSlot: number;
  images: string[];
  thumbnail?: string;
  includedItems: string[];
  requiredItems: string[];
  languages: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'DRAFT' | 'ACTIVE' | 'HIDDEN' | 'DELETED';
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  totalViews: number;
}

const workshopSchema = new Schema<IWorkshop>(
  {
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: String,
    address: {
      addressLine: { type: String, required: true },
      ward: String, district: String,
      city: { type: String, required: true },
      province: { type: String, required: true },
      country: { type: String, default: 'Việt Nam' },
      fullAddress: { type: String, required: true },
    },
    locationLabel: { type: String, required: true },
    mapLocation: { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
    hostName: { type: String, required: true },
    hostPhone: { type: String, required: true },
    hostWorkshopName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    promotion: {
      type: new Schema({
        code: { type: String, required: true, trim: true, uppercase: true, match: /^[A-Z0-9_-]{3,32}$/ },
        percentOff: { type: Number, required: true, min: 1, max: 99, validate: Number.isInteger },
      }, { _id: false }),
      default: null,
    },
    duration: { type: Number, required: true, min: 1 },
    maxGuestsPerSlot: { type: Number, default: 10 },
    images: [String],
    thumbnail: String,
    includedItems: [String],
    requiredItems: [String],
    languages: [{ type: String, default: 'Tiếng Việt' }],
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
    status: { type: String, enum: ['DRAFT', 'ACTIVE', 'HIDDEN', 'DELETED'], default: 'ACTIVE' },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

workshopSchema.index({ hostId: 1 });
workshopSchema.index({ categoryId: 1 });
workshopSchema.index({ status: 1 });
workshopSchema.index({ locationLabel: 1 });
workshopSchema.index({ price: 1 });
workshopSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<IWorkshop>('Workshop', workshopSchema);
