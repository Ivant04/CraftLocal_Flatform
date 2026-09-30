import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  type: 'WORKSHOP' | 'PRODUCT' | 'BOTH';
  icon?: string;
  image?: string;
  status: 'ACTIVE' | 'HIDDEN';
  displayOrder: number;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: { type: String, enum: ['WORKSHOP', 'PRODUCT', 'BOTH'], default: 'BOTH' },
    icon: String,
    image: String,
    status: { type: String, enum: ['ACTIVE', 'HIDDEN'], default: 'ACTIVE' },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.index({ type: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ displayOrder: 1 });

export default mongoose.model<ICategory>('Category', categorySchema);
