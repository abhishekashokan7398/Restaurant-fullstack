const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["dine-in", "take-away"],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table",
    default: null
  },
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chef",
    default: null
  },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  amount: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  cookingTime: {
    type: Number,
    required: true
  },
  served: {
    type: Boolean,
    default: false
  },
  servedAt: {
    type: Date,
    default: null
  },
  partySize: {
    type: Number,
    required: [
      function () {
        return this.type === "dine-in";
      },
      "Party size is required for dine-in orders"
    ],
    min: [1, "Party size must be at least 1"],
    max: [6, "Party size cannot exceed 6"]
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
