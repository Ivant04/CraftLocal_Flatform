const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide category name'],
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Please provide category slug'],
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    type: {
      type: String,
      enum: {
        values: ['WORKSHOP', 'PRODUCT', 'BOTH'],
        message: 'Category type must be WORKSHOP, PRODUCT, or BOTH'
      },
      default: 'BOTH'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Category', categorySchema);
