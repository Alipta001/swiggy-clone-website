const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    image: {
      type: String,
      default: ''
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant reference is required']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required']
    },
    isVeg: {
      type: Boolean,
      required: [true, 'isVeg indicator is required'],
      default: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

foodSchema.index({ name: 'text', description: 'text' });
foodSchema.index({ restaurant: 1, category: 1, price: 1, isVeg: 1, isAvailable: 1 });

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;
