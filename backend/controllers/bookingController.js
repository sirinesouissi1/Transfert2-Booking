const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle'); // ✅ AJOUT : pour valider la capacité
const { sendBookingConfirmation, sendAdminNotification } = require('../utils/emailService');

// Champs autorisés (évite qu'un client force status, confirmationCode, etc.)
const ALLOWED_FIELDS = [
  'firstName', 'lastName', 'email', 'phone', 'whatsapp',
  'bookingType', 'tripType', 'from', 'to',
  'departureDate', 'returnDate', 'vehicle', 'totalPrice',
  'passengers', 'flightNumber', 'specialRequests',
  'language', // ✅ AJOUT
];

exports.createBooking = asyncHandler(async (req, res) => {
  const body = {};
  ALLOWED_FIELDS.forEach((f) => {
    if (req.body[f] !== undefined) body[f] = req.body[f];
  });

  // "one-way" / "round-trip" → "one_way" / "round_trip"
  body.tripType = String(body.tripType || 'one_way').replace(/-/g, '_');

  // Prix absent ou invalide = 0 ("sur demande")
  body.totalPrice = Number(body.totalPrice) || 0;

  // ✅ Sécurise la langue
  body.language = body.language === 'en' ? 'en' : 'fr';

  if (!body.vehicle || !mongoose.Types.ObjectId.isValid(body.vehicle)) {
    res.status(400);
    throw new Error('Véhicule invalide ou manquant');
  }
  if (!body.departureDate || isNaN(new Date(body.departureDate).getTime())) {
    res.status(400);
    throw new Error('Date de départ invalide');
  }
  if (!body.returnDate) delete body.returnDate;

  // ✅ VALIDATION CAPACITÉ : on vérifie que le véhicule existe,
  // qu'il est actif et que le nombre de passagers ne dépasse pas sa capacité.
  const vehicle = await Vehicle.findById(body.vehicle).select('name capacity isActive');
  if (!vehicle) {
    res.status(404);
    throw new Error('Véhicule introuvable.');
  }
  if (vehicle.isActive === false) {
    res.status(400);
    throw new Error('Ce véhicule n\'est plus disponible à la réservation.');
  }

  const adults = Number(body.passengers?.adults || 0);
  const children = Number(body.passengers?.children || 0);
  const totalPassengers = adults + children;

  if (adults < 1) {
    res.status(400);
    throw new Error('Au moins un adulte est requis pour réserver.');
  }

  if (vehicle.capacity && totalPassengers > vehicle.capacity) {
    res.status(400);
    throw new Error(
      `Capacité maximale du véhicule "${vehicle.name}" : ${vehicle.capacity} passager(s). Vous avez demandé ${totalPassengers}.`
    );
  }

  // ✅ Normalise passengers pour être sûr du format stocké
  body.passengers = {
    adults,
    children,
  };

  const booking = await Booking.create(body);
  const fullBooking = await Booking.findById(booking._id).populate('vehicle');

  // Emails en arrière-plan : on ne fait PAS attendre le client
  Promise.resolve()
    .then(() => sendBookingConfirmation(fullBooking))
    .catch((err) => console.error('❌ Email client :', err.message));

  Promise.resolve()
    .then(() => sendAdminNotification(fullBooking))
    .catch((err) => console.error('❌ Email admin :', err.message));

  res.status(201).json({ success: true, booking: fullBooking });
});

// @desc    Obtenir toutes les réservations (Admin)
exports.getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .populate('vehicle')
    .sort({ createdAt: -1 });

  res.json({ success: true, bookings });
});

// @desc    Obtenir une réservation par ID
// @route   GET /api/bookings/:id
exports.getBookingById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('ID de réservation invalide');
  }
  const booking = await Booking.findById(req.params.id).populate('vehicle');
  if (booking) {
    res.json({ success: true, booking });
  } else {
    res.status(404);
    throw new Error('Réservation non trouvée');
  }
});

// @desc    Mettre à jour le statut (Admin)
// @route   PUT /api/bookings/:id/status
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