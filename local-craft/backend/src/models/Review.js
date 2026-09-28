const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a Customer']
    },
    targetType: {
      type: String,
      required: [true, 'Target type is required (WORKSHOP, PRODUCT, ARTISAN)'],
      enum: {
        values: ['WORKSHOP', 'PRODUCT', 'ARTISAN'],
        message: 'targetType must be WORKSHOP, PRODUCT, or ARTISAN'
      }
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target resource ID is required'],
      refPath: 'targetModel'
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5']
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'APPROVED', 'HIDDEN'],
        message: 'Status must be PENDING, APPROVED, or HIDDEN'
      },
      default: 'APPROVED'
    }
  },
  {
    timestamps: true
  }
);

// Virtual field for dynamic ref
reviewSchema.virtual('targetModel').get(function () {
  switch (this.targetType) {
    case 'WORKSHOP':
      return 'Workshop';
    case 'PRODUCT':
      return 'Product';
    case 'ARTISAN':
      return 'Artisan';
    default:
      return null;
  }
});

module.exports = mongoose.model('Review', reviewSchema);
