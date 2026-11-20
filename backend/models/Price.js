const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  from: {
    type: String,
    required: true,
    trim: true,
  },
  to: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  tripType: {
    type: String,
    enum: ['one_way', 'round_trip'],
    required: true,
    default: 'one_way',
  },
}, { timestamps: true });

// ✅ CORRECTION : inclure tripType dans l'index unique
// → un tarif "one_way" et un "round_trip" peuvent coexister pour le même trajet.
priceSchema.index({ vehicle: 1, from: 1, to: 1, tripType: 1 }, { unique: true });

module.exports = mongoose.model('Price', priceSchema);