const mongoose = require('mongoose');

const artisanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Artisan must be linked to a User account'],
      unique: true
    },
    studioName: {
      type: String,
      required: [true, 'Please provide studio or workshop name'],
      trim: true
    },
    bio: {
      type: String,
      trim: true,
      default: ''
    },
    craftSpecialty: {
      type: String,
      required: [true, 'Please provide craft specialty (e.g., Ceramic, Pottery, Lanterns)'],
      trim: true
    },
    experienceYears: {
      type: Number,
      min: [0, 'Experience years cannot be negative'],
      default: 0
    },
    workshopAddress: {
      type: String,
      trim: true,
      default: ''
    },
    socialLinks: {
      website: { type: String, default: '' },
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' }
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ['PENDING', 'APPROVED', 'REJECTED'],
        message: 'Status must be PENDING, APPROVED, or REJECTED'
      },
      default: 'PENDING'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Artisan', artisanSchema);
