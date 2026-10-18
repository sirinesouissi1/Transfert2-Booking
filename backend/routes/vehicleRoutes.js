const express = require('express');
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicleController');


const router = express.Router();

// Routes publiques
router.get('/', getVehicles);
router.get('/:id', getVehicle);

// Routes protégées (Admin seulement)
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

module.exports = router;