const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  capacity:    { type: Number, required: true },
  features:    [{ type: String }],
  description: { type: String },
  image:       { type: String }, // This will store the image path/filename
  isActive:    { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);