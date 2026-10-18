const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Price = require('../models/Price'); // à ajouter en haut

const { sendBookingConfirmation, sendAdminNotification } = require('../utils/emailService'); // IMPORTANT

exports.createBooking = asyncHandler(async (req, res) => {
  // On n'effectue plus aucune vérification de prix en base.
  // Le frontend envoie totalPrice (qui peut être 0 pour "sur demande").
  // On s'assure simplement que totalPrice existe (valeur par défaut 0)
  if (req.body.totalPrice === undefined) {
    req.body.totalPrice = 0;
  }

  const booking = await Booking.create(req.body);
  const fullBooking = await Booking.findById(booking._id).populate('vehicle');

  try {
    await sendBookingConfirmation(fullBooking);
    await sendAdminNotification(fullBooking);
  } catch (error) {
    console.error('❌ Erreur envoi email :', error);
  }

  res.status(201).json({ success: true, booking: fullBooking });
});

// @desc    Obtenir toutes les réservations (Admin)
exports.getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .populate('vehicle') // Récupère le nom, l'image, etc.
    .sort({ createdAt: -1 });
    
  res.json({ success: true, bookings });
});

// @desc    Obtenir une réservation par ID
// @route   GET /api/bookings/:id
// @access  Public
exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (booking) {
    res.json({ success: true, booking });
  } else {
    res.status(404);
    throw new Error('Réservation non trouvée');
  }
});

// @desc    Mettre à jour le statut (Admin)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (booking) {
    booking.status = req.body.status || booking.status;
    const updatedBooking = await booking.save();
    res.json({ success: true, updatedBooking });
  } else {
    res.status(404);
    throw new Error('Réservation non trouvée');
  }
});

