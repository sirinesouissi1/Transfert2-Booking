const mongoose = require('mongoose');

const excursionSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    slug:        { type: String, unique: true },
    description: { type: String, required: true },
    shortDesc:   { type: String },
    destination: { type: String, required: true },
    duration:    { type: String, required: true },
    maxCapacity: { type: Number, default: 10 },
    minPersons:  { type: Number, default: 1 },
    pricePerPerson: { type: Number, required: true },
    priceGroup:  { type: Number },
    
    // Ancien système (prix par groupe uniquement)
    groupPrices: {
      type: Map,
      of: Number,
      default: {},
    },

    // ⬇️ NOUVEAU : Prix par point de départ + taille de groupe
    // Ex: { "Hammamet": { "4": 80, "6": 120 }, "Sousse": { "4": 130 } }
    departurePrices: {
      type: Map,
      of: new mongoose.Schema({
        "4": { type: Number, default: 0 },
        "6": { type: Number, default: 0 },
        "8": { type: Number, default: 0 },
      }, { _id: false }),
      default: {},
    },

    coverImage:  { type: String, },
    itinerary: [
      {
        time:        String,
        title:       String,
        description: String,
      }
    ],
    includes:    [{ type: String }],
    excludes:    [{ type: String }],
    highlights:  [{ type: String }],
    category:    { type: String, enum: ['culture', 'nature', 'desert', 'beach', 'city', 'roman'], default: 'culture' },
    badge:       { type: String },
    rating:      { type: Number, default: 0 },
    numReviews:  { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
    departurePoints: [{ type: String }],
  },
  { timestamps: true }
);

// Auto-generate slug
excursionSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Excursion', excursionSchema);