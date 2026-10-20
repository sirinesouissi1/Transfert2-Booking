const express = require('express');
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicleController');
const upload = require('../middleware/upload');

const router = express.Router();

// Routes publiques
router.get('/', getVehicles);
router.get('/:id', getVehicle);

// Routes admin
// Le champ du formulaire doit s'appeler "image"
router.post('/', upload.single('image'), createVehicle);
router.put('/:id', upload.single('image'), updateVehicle);
router.delete('/:id', deleteVehicle);

module.exports = router;