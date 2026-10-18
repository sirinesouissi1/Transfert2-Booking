const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    description: { type: String },
    from:        { type: String, required: true },   // ex: "Aéroport Tunis-Carthage"
    to:          { type: String, required: true },   // ex: "Hammamet"
    distance:    { type: Number },                   // km
    duration:    { type: Number },                   // minutes
    basePrice:   { type: Number, required: true },   // TND
    pricePerKm:  { type: Number, default: 0 },
    vehicleTypes: [
      {
        type:     { type: String, enum: ['sedan', 'minivan', 'vip', 'bus'] },
        capacity: Number,
        price:    Number,
        image:    String,
      }
    ],
    image:       { type: String, default: '' },
    isActive:    { type: Boolean, default: true },
    isAirport:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transfer', transferSchema);
