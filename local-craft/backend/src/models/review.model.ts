import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  touristId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  workshopId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  images: string[];
  status: 'VISIBLE' | 'HIDDEN';
  hostReply?: { message: string; repliedAt: Date };
}

const reviewSchema = new Schema<IReview>(
  {
    touristId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workshopId: { type: Schema.Types.ObjectId, ref: 'Workshop', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    images: [String],
    status: { type: String, enum: ['VISIBLE', 'HIDDEN'], default: 'VISIBLE' },
    hostReply: { message: String, repliedAt: Date },
  },
  { timestamps: true }
);

reviewSchema.index({ touristId: 1 });
reviewSchema.index({ workshopId: 1 });
reviewSchema.index({ hostId: 1 });
reviewSchema.index({ status: 1 });

export default mongoose.model<IReview>('Review', reviewSchema);
