const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artisan',
      required: [true, 'Product must be associated with an Artisan']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price cannot be negative']
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    status: {
      type: String,
      enum: {
        values: ['DRAFT', 'ACTIVE', 'OUT_OF_STOCK'],
        message: 'Status must be DRAFT, ACTIVE, or OUT_OF_STOCK'
      },
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
