const express = require('express');
const router = express.Router();
const {
  getPrices,
  getPriceForTrip,
  createPrice,
  updatePrice,
  deletePrice
} = require('../controllers/priceController');

// Routes publiques : obtenir les prix pour un trajet donné
router.get('/trip', getPriceForTrip); // /api/prices/trip?from=X&to=Y

// Routes protégées (admin)
router.route('/')
  .get(getPrices)       // tous les prix (admin)
  .post(createPrice);   // créer un prix

router.route('/:id')
  .put(updatePrice)
  .delete(deletePrice);

module.exports = router;