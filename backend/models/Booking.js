const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true },
  phone:     { type: String, required: true },
  whatsapp:  { type: Boolean, default: true },

  bookingType: { type: String, default: 'transfer' },
tripType: { 
  type: String, 
  enum: ['one_way', 'round_trip'],  // ← was 'one-way'/'round-trip'
  required: true 
},
  from:        { type: String, required: true },
  to:          { type: String, required: true },
  departureDate: { type: Date, required: true },
  returnDate:    { type: Date },

  // --- RÉFÉRENCE À LA TABLE VEHICLE ---
  vehicle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', 
    required: true 
  },
  
  totalPrice:  { type: Number, required: true },

  passengers: {
    adults:   { type: Number, default: 1 },
    children: { type: Number, default: 0 }
  },
  flightNumber:   { type: String },
  specialRequests: { type: String },

  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  confirmationCode: { type: String, unique: true }
}, { timestamps: true });

bookingSchema.pre('save', function(next) {
  if (!this.confirmationCode) {
    this.confirmationCode = 'LMN-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);