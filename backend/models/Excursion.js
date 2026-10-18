const mongoose = require('mongoose');

const excursionSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    slug:        { type: String, unique: true },
    description: { type: String, required: true },
    shortDesc:   { type: String },
    destination: { type: String, required: true },
    duration:    { type: String, required: true },   // ex: "8h", "2 jours"
    maxCapacity: { type: Number, default: 10 },
    minPersons:  { type: Number, default: 1 },
    pricePerPerson: { type: Number, required: true },
    priceGroup:  { type: Number },                   // prix pour groupe
    groupPrices: {                            // NOUVEAU : prix fixes par taille de groupe
    type: Map,
    of: Number,
    default: {},
    description: "Prix par taille de groupe (ex: { '4': 160, '6': 220, '8': 280 })"
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
    badge:       { type: String },                   // ex: "Populaire", "Coup de coeur"
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
