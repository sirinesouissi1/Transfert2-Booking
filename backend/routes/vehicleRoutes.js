const express = require('express');
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');
const uploadImage = require('../middleware/upload');
// const { protect, admin } = require('../middleware/auth'); // décommente avec ton vrai middleware

const router = express.Router();

// Routes publiques
router.get('/', getVehicles);
router.get('/:id', getVehicle);

// Routes admin (ajoute protect, admin quand ton middleware est prêt)
router.post('/', /* protect, admin, */ uploadImage('image'), createVehicle);
router.put('/:id', /* protect, admin, */ uploadImage('image'), updateVehicle);
router.delete('/:id', /* protect, admin, */ deleteVehicle);

module.exports = router;