const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getBookings, 
  getBookingById, 
  updateBookingStatus 
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route publique pour créer la commande
router.post('/', createBooking);

// Route publique pour voir sa confirmation
router.get('/:id', getBookingById);

// Routes protégées pour le Dashboard Admin
router.get('/', getBookings);
router.put('/:id/status',  updateBookingStatus);

module.exports = router;