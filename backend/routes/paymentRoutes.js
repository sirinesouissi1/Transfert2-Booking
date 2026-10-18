// paymentRoutes.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Create Stripe payment intent
router.post('/create-intent', protect, asyncHandler(async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) { res.status(404); throw new Error('Réservation non trouvée'); }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.total * 100), // cents
    currency: 'tnd',
    metadata: { bookingId: booking._id.toString() },
  });

  res.json({ success: true, clientSecret: paymentIntent.client_secret });
}));

// Confirm payment
router.post('/confirm', protect, asyncHandler(async (req, res) => {
  const { bookingId, paymentIntentId } = req.body;
  const booking = await Booking.findByIdAndUpdate(bookingId, {
    paymentStatus: 'paid',
    stripePaymentId: paymentIntentId,
    status: 'confirmed',
  }, { new: true });
  res.json({ success: true, booking });
}));

module.exports = router;
