const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  number: { type: Number, required: true,unique:true },
  chairs: { type: Number, enum: [2, 4, 6], required: true },
  isReserved: { type: Boolean, default: false },
  reservedAt: { type: Date } 
}, { timestamps: true });

module.exports = mongoose.model("Table", tableSchema);
