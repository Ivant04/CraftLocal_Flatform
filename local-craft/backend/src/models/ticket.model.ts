import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  bookingId: mongoose.Types.ObjectId;
  touristId: mongoose.Types.ObjectId;
  workshopId: mongoose.Types.ObjectId;
  timeslotId: mongoose.Types.ObjectId;
  qrToken: string;
  qrCodeImage: string;
  status: 'UNUSED' | 'USED' | 'EXPIRED' | 'CANCELLED';
  usedAt?: Date;
  checkedBy?: mongoose.Types.ObjectId;
  expiredAt?: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    touristId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workshopId: { type: Schema.Types.ObjectId, ref: 'Workshop', required: true },
    timeslotId: { type: Schema.Types.ObjectId, ref: 'Timeslot', required: true },
    qrToken: { type: String, required: true, unique: true },
    qrCodeImage: { type: String, required: true },
    status: { type: String, enum: ['UNUSED', 'USED', 'EXPIRED', 'CANCELLED'], default: 'UNUSED' },
    usedAt: Date,
    checkedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    expiredAt: Date,
  },
  { timestamps: true }
);

ticketSchema.index({ touristId: 1 });
ticketSchema.index({ status: 1 });

export default mongoose.model<ITicket>('Ticket', ticketSchema);
