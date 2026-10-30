const asyncHandler = require('express-async-handler');
const ExcursionBooking = require('../models/ExcursionBooking');
const Excursion = require('../models/Excursion');
const {
  sendExcursionBookingConfirmation,
  sendExcursionAdminNotification
} = require('../utils/emailService');
// @desc    Créer une nouvelle réservation d'excursion
// @route   POST /api/excursion-bookings
// @access  Public
// controllers/excursionBookingController.js
exports.createExcursionBooking = asyncHandler(async (req, res) => {
  const { excursion: excursionId, groupSize, departurePoint } = req.body;

  const excursion = await Excursion.findOne({ _id: excursionId, isActive: true });
  if (!excursion) {
    res.status(404);
    throw new Error('Excursion non trouvée ou indisponible');
  }

  const groupSizeNumber = parseInt(groupSize, 10);
  if (isNaN(groupSizeNumber) || groupSizeNumber <= 0) {
    res.status(400);
    throw new Error('Taille de groupe invalide');
  }

  let price = null;

  // ── 1. On cherche le prix par point de départ (Nouveau système) ──
  if (excursion.departurePrices && departurePoint) {
    const rawDeparturePrices = excursion.departurePrices instanceof Map
      ? Object.fromEntries(excursion.departurePrices)
      : excursion.departurePrices;

    const cityPrices = rawDeparturePrices[departurePoint];
    
    if (cityPrices && cityPrices[groupSize]) {
      price = Number(cityPrices[groupSize]);
      console.log(`💰 Prix trouvé dans departurePrices[${departurePoint}][${groupSize}] = ${price}€`);
    }
  }

  // ── 2. Fallback : ancien système groupPrices ──
  if (price === null && excursion.groupPrices) {
    const rawGroupPrices = excursion.groupPrices instanceof Map
      ? Object.fromEntries(excursion.groupPrices)
      : excursion.groupPrices;
    
    if (rawGroupPrices[groupSize] !== undefined) {
      price = Number(rawGroupPrices[groupSize]);
      console.log(`💰 Prix trouvé dans groupPrices[${groupSize}] = ${price}€`);
    }
  }

  // ── 3. Dernier recours : priceGroup ou pricePerPerson ──
  if (price === null) {
    if (excursion.priceGroup) {
      price = Number(excursion.priceGroup);
    } else {
      price = (Number(excursion.pricePerPerson) || 0) * groupSizeNumber;
    }
    console.log(`💰 Prix fallback = ${price}€`);
  }

  if (!price || price <= 0) {
    res.status(400);
    throw new Error('Prix non défini pour cette combinaison');
  }

  const bookingData = {
    ...req.body,
    totalPrice: price,
    status: 'pending'
  };

  const booking = await ExcursionBooking.create(bookingData);
  const populated = await ExcursionBooking.findById(booking._id).populate('excursion');

  try {
    await sendExcursionBookingConfirmation(populated);
    await sendExcursionAdminNotification(populated);
    console.log('✅ Emails envoyés');
  } catch (error) {
    console.error('❌ Erreur envoi email :', error);
  }

  res.status(201).json({ success: true, booking: populated });
});
// @desc    Obtenir une réservation par son ID (pour la page de confirmation)
// @route   GET /api/excursion-bookings/:id
// @access  Public
exports.getExcursionBookingById = asyncHandler(async (req, res) => {
  const booking = await ExcursionBooking.findById(req.params.id).populate('excursion');
  if (!booking) {
    res.status(404);
    throw new Error('Réservation non trouvée');
  }
  res.json({ success: true, booking });
});

// @desc    Obtenir toutes les réservations d'excursions (admin)
// @route   GET /api/excursion-bookings
// @access  Private/Admin
exports.getAllExcursionBookings = asyncHandler(async (req, res) => {
  const bookings = await ExcursionBooking.find({})
    .populate('excursion')
    .sort({ createdAt: -1 });
  res.json({ success: true, bookings });
});

// @desc    Mettre à jour le statut d'une réservation (admin)
// @route   PUT /api/excursion-bookings/:id/status
// @access  Private/Admin
exports.updateExcursionBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await ExcursionBooking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Réservation non trouvée');
  }
  booking.status = status;
  await booking.save();
  res.json({ success: true, booking });
});