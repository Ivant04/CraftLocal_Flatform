import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "BOOKING" | "ORDER" | "PAYMENT" | "SYSTEM" | "REVIEW" | "TIMESLOT";
  isRead: boolean;
  relatedId?: mongoose.Types.ObjectId;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["BOOKING", "ORDER", "PAYMENT", "SYSTEM", "REVIEW", "TIMESLOT"],
      required: true,
    },
    isRead: { type: Boolean, default: false },
    relatedId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);
