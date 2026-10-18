const mongoose = require('mongoose');

const excursionBookingSchema = new mongoose.Schema({
  // --- Coordonnées client ---
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true },
  phone:     { type: String, required: true },
  whatsapp:  { type: Boolean, default: false }, // optionnel, si le client préfère WhatsApp

  // --- Informations de réservation ---
  excursion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Excursion',
    required: true
  },
  groupSize: {
    type: String,
    enum: ['4', '6', '8'], // Vous pouvez aussi utiliser Number si vous préférez
    required: true,
    description: "Taille du groupe : jusqu'à 4, 6 ou 8 personnes"
  },
  departurePoint: {
    type: String,
    enum: ['Hammamet', 'Sousse', 'Tunis'],
    required: true
  },
  preferredDate: {
    type: Date,
    required: true
  },
  customItinerary: {
    type: Boolean,
    default: false,
    description: "Le client souhaite un itinéraire personnalisé"
  },
  specialRequests: {
    type: String,
    trim: true,
    description: "Commentaires supplémentaires"
  },

  // --- Prix et statut ---
  totalPrice: { type: Number, required: true }, // Calculé lors de la création
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  confirmationCode: { type: String, unique: true, sparse: true }
}, { timestamps: true });

// Génération automatique d'un code de confirmation unique
excursionBookingSchema.pre('save', function(next) {
  if (!this.confirmationCode) {
    this.confirmationCode = 'EXC-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('ExcursionBooking', excursionBookingSchema);