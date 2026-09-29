import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  bookingCode: string;
  touristId: mongoose.Types.ObjectId;
  workshopId: mongoose.Types.ObjectId;
  timeslotId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  bookingStatus: 'PENDING' | 'PAID' | 'CANCELLED' | 'CHECKED_IN' | 'COMPLETED' | 'REFUNDED';
  paymentId?: mongoose.Types.ObjectId;
  ticketId?: mongoose.Types.ObjectId;
  customerInfo?: { fullName: string; email: string; phone: string };
  checkedInAt?: Date;
  checkedInBy?: mongoose.Types.ObjectId;
  cancelReason?: string;
  cancelledAt?: Date;
  refundStatus: 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  refundAmount?: number;
}

const bookingSchema = new Schema<IBooking>(
  {
    bookingCode: { type: String, required: true, unique: true },
    touristId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workshopId: { type: Schema.Types.ObjectId, ref: 'Workshop', required: true },
    timeslotId: { type: Schema.Types.ObjectId, ref: 'Timeslot', required: true },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    bookingStatus: { type: String, enum: ['PENDING', 'PAID', 'CANCELLED', 'CHECKED_IN', 'COMPLETED', 'REFUNDED'], default: 'PENDING' },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket' },
    customerInfo: { fullName: String, email: String, phone: String },
    checkedInAt: Date,
    checkedInBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancelReason: String,
    cancelledAt: Date,
    refundStatus: { type: String, enum: ['NONE', 'REQUESTED', 'APPROVED', 'REJECTED', 'REFUNDED'], default: 'NONE' },
    refundAmount: Number,
  },
  { timestamps: true }
);

bookingSchema.index({ touristId: 1 });
bookingSchema.index({ hostId: 1 });
bookingSchema.index({ workshopId: 1 });
bookingSchema.index({ timeslotId: 1 });
bookingSchema.index({ bookingStatus: 1 });

export default mongoose.model<IBooking>('Booking', bookingSchema);
