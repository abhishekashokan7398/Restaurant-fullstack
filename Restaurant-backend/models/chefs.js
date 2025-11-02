const mongoose = require("mongoose");

const chefSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  ordersTaken: {
    type: Number,
    default: 0  
  },  lastAssignedAt: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model("Chef", chefSchema);