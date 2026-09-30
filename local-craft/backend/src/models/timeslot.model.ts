import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeslot extends Document {
  workshopId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  tourGuideId?: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  price: number;
  status: 'AVAILABLE' | 'FULL' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  note?: string;
}

const timeslotSchema = new Schema<ITimeslot>(
  {
    workshopId: { type: Schema.Types.ObjectId, ref: 'Workshop', required: true },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tourGuideId: { type: Schema.Types.ObjectId, ref: 'User' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalSlots: { type: Number, required: true, min: 1 },
    bookedSlots: { type: Number, default: 0 },
    availableSlots: { type: Number, required: true },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['AVAILABLE', 'FULL', 'ONGOING', 'COMPLETED', 'CANCELLED'], default: 'AVAILABLE' },
    note: { type: String },
  },
  { timestamps: true }
);

timeslotSchema.index({ workshopId: 1 });
timeslotSchema.index({ hostId: 1 });
timeslotSchema.index({ tourGuideId: 1 });
timeslotSchema.index({ startTime: 1 });
timeslotSchema.index({ status: 1 });

export default mongoose.model<ITimeslot>('Timeslot', timeslotSchema);
