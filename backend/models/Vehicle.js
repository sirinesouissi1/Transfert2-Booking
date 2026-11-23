const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  capacity:    { type: Number, required: true },
  luggage:     { type: Number, default: 0, min: 0 },   // nombre de bagages (x3 Bagages)
  hasAC:       { type: Boolean, default: false },       // climatisation (Clim.)
  features:    [{ type: String }],
  description: { type: String },
  image:       { type: String }, // data URL (base64) ou nom de fichier local
  price:       { type: Number, default: null }, // null = prix sur demande
  isActive:    { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);