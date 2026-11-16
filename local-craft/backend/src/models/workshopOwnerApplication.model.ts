import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkshopOwnerApplication extends Document {
  userId: mongoose.Types.ObjectId;
  workshopName: string;
  ownerName: string;
  phone: string;
  email: string;
  workshopAddress: string;
  description: string;
  workshopImages: string[];
  idCardFront?: string;
  idCardBack?: string;
  businessLicense?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const workshopOwnerApplicationSchema = new Schema<IWorkshopOwnerApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workshopName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    workshopAddress: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    workshopImages: [{ type: String }],
    idCardFront: { type: String },
    idCardBack: { type: String },
    businessLicense: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    rejectionReason: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

workshopOwnerApplicationSchema.index({ userId: 1 });
workshopOwnerApplicationSchema.index({ status: 1 });
workshopOwnerApplicationSchema.index({ createdAt: -1 });

export default mongoose.model<IWorkshopOwnerApplication>(
  'WorkshopOwnerApplication',
  workshopOwnerApplicationSchema
);
