const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"]
  },
  contact: {
    type: String,
    required: [true, "Contact (phone) number is required"],
    unique: true,
    trim: true
  },
  address: {
    type: String,
    required: [true, "Address is required"]
  },
  numberOfPersons: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);
