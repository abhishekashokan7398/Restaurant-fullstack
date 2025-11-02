const mongoose = require('mongoose');

const FoodProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true  },
  description: { type: String, required: true, trim: true },
  imageUrl: { type: String },
  price: { type: Number, required: true },
  inStock: { type: Boolean, default: true },
  stockQuantity: { type: Number, min: 0, default: 100 },
  averagePrepTime: { type: Number, required: true, min: 1 },
  category: { type: String, required: true, enum: ['Burgers','Pizza','Drinks','Fries','Veggies','Desserts'] },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Menu', FoodProductSchema);
