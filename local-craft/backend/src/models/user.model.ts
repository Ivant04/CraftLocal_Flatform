import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress {
  addressLine: string;
  ward?: string;
  district?: string;
  city: string;
  province: string;
  country: string;
  fullAddress: string;
  note?: string;
  mapLocation?: { lat: number; lng: number };
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  avatar?: string;
  role: 'ADMIN' | 'HOST' | 'TOUR_GUIDE' | 'TOURIST';
  status: 'PENDING' | 'ACTIVE' | 'BLOCKED';
  hostId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  hostProfile?: {
    workshopName?: string;
    ownerName?: string;
    ownerPhone?: string;
    businessAddress?: IAddress;
    description?: string;
    identityCardFront?: string;
    identityCardBack?: string;
    certificate?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountHolder?: string;
    approvedAt?: Date;
    approvedBy?: mongoose.Types.ObjectId;
    rejectedReason?: string;
  };
  defaultAddress?: IAddress;
  lastLoginAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const addressSchema = {
  addressLine: String,
  ward: String,
  district: String,
  city: String,
  province: String,
  country: { type: String, default: 'Việt Nam' },
  fullAddress: String,
  note: String,
  mapLocation: { lat: Number, lng: Number },
};

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    avatar: String,
    role: { type: String, enum: ['ADMIN', 'HOST', 'TOUR_GUIDE', 'TOURIST'], default: 'TOURIST' },
    status: { type: String, enum: ['PENDING', 'ACTIVE', 'BLOCKED'], default: 'ACTIVE' },
    hostId: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    hostProfile: {
      workshopName: String,
      ownerName: String,
      ownerPhone: String,
      businessAddress: addressSchema,
      description: String,
      identityCardFront: String,
      identityCardBack: String,
      certificate: String,
      bankName: String,
      bankAccountNumber: String,
      bankAccountHolder: String,
      approvedAt: Date,
      approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      rejectedReason: String,
    },
    defaultAddress: addressSchema,
    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ hostId: 1 });
userSchema.index({ 'hostProfile.workshopName': 'text' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
