const express = require('express');
const router = express.Router();
const {
  sendContactMessage,
  getContactMessages,
  markAsRead,
  deleteContactMessage,
} = require('../controllers/contactController');

// ⬇️ On importe protect et authorize (et non "admin")
const { protect, authorize } = require('../middleware/authMiddleware');

// Route publique
router.post('/', sendContactMessage);

// Routes protégées (Admin uniquement)
// ⬇️ On appelle authorize('admin') pour vérifier le rôle
router.get('/', protect, authorize('admin'), getContactMessages);
router.put('/:id/read', protect, authorize('admin'), markAsRead);
router.delete('/:id', protect, authorize('admin'), deleteContactMessage);

module.exports = router;