const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide workshop title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide workshop description'],
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artisan',
      required: [true, 'Workshop must be associated with an Artisan']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    location: {
      type: String,
      required: [true, 'Please provide workshop location/address'],
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'Please provide duration in minutes'],
      min: [1, 'Duration must be at least 1 minute']
    },
    price: {
      type: Number,
      required: [true, 'Please provide workshop price'],
      min: [0, 'Price cannot be negative']
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide workshop capacity'],
      min: [1, 'Capacity must be at least 1 person']
    },
    availableSlots: {
      type: Number,
      required: [true, 'Please provide available slots'],
      min: [0, 'Available slots cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED'],
        message: 'Status must be DRAFT, ACTIVE, PAUSED, or CLOSED'
      },
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Workshop', workshopSchema);
