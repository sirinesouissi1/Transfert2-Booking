const express = require('express');
const router = express.Router();
const {
  createExcursionBooking,
  getExcursionBookingById,
  getAllExcursionBookings,   // <-- Correction : ajout du 's'
  updateExcursionBookingStatus
} = require('../controllers/excursionBookingController');

// Routes publiques
router.post('/', createExcursionBooking);
router.get('/:id', getExcursionBookingById);

// Routes admin (protégées)
router.get('/', getAllExcursionBookings);
router.put('/:id/status', updateExcursionBookingStatus);

module.exports = router;