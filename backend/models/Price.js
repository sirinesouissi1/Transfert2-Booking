const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  from: {
    type: String,
    required: true,
    trim: true
  },
  to: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  tripType: {
  type: String,
  enum: ['one_way', 'round_trip'],  // underscore partout
  required: true,
  default: 'one_way'
}
}, { timestamps: true });

// Unicité : un seul prix par (vehicle, from, to)
priceSchema.index({ vehicle: 1, from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('Price', priceSchema);