const express = require('express');
const router = express.Router();
const {
  getPrices,
  getPriceForTrip,
  resolvePrice,
  createPrice,
  updatePrice,
  deletePrice,
} = require('../controllers/priceController');

// ============================================================
// ROUTES PUBLIQUES
// ============================================================

// Prix pour un trajet (tous les véhicules)
router.get('/trip', getPriceForTrip);

// ✅ NOUVEAU : prix pour UN véhicule + fallback sur vehicle.price
router.get('/resolve', resolvePrice);

// ============================================================
// ROUTES PROTÉGÉES (admin)
// ============================================================
router.route('/')
  .get(getPrices)
  .post(createPrice);

router.route('/:id')
  .put(updatePrice)
  .delete(deletePrice);

module.exports = router;