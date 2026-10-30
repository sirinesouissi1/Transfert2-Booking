const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String }, // Optionnel
    subject: { type: String },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }, // Pour le badge de notification
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);