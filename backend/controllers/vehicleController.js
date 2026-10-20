const asyncHandler = require('express-async-handler');
const Vehicle = require('../models/Vehicle');

// Convertit le fichier reçu par multer en valeur à stocker dans MongoDB
const getImageValue = (file) =>
  file.buffer
    ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
    : file.filename;

// @desc   Obtenir tous les véhicules actifs
// @route  GET /api/vehicles
// @access Public
exports.getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ isActive: true }).sort({ capacity: 1 });
  res.json({ success: true, count: vehicles.length, vehicles });
});

// @desc   Obtenir un seul véhicule par ID
// @route  GET /api/vehicles/:id
// @access Public
exports.getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, isActive: true });
  if (!vehicle) {
    res.status(404);
    throw new Error('Véhicule non trouvé');
  }
  res.json({ success: true, vehicle });
});

// @desc   Créer un véhicule (avec image optionnelle)
// @route  POST /api/vehicles
// @access Private/Admin
exports.createVehicle = asyncHandler(async (req, res) => {
  const { name, description, capacity, price } = req.body;

  const data = {
    name,
    description,
    capacity: Number(capacity),
  };

  // Prix optionnel : si vide ou <= 0 → null (= "sur demande")
  if (price !== undefined && price !== '' && !isNaN(Number(price)) && Number(price) > 0) {
    data.price = Number(price);
  } else {
    data.price = null;
  }

  if (req.file) data.image = getImageValue(req.file);

  const vehicle = await Vehicle.create(data);
  res.status(201).json({ success: true, vehicle });
});

// @desc   Mettre à jour un véhicule (avec nouvelle image optionnelle)
// @route  PUT /api/vehicles/:id
// @access Private/Admin
exports.updateVehicle = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (data.capacity !== undefined) data.capacity = Number(data.capacity);

  // Prix optionnel
  if (data.price !== undefined) {
    if (data.price === '' || data.price === null || isNaN(Number(data.price)) || Number(data.price) <= 0) {
      data.price = null;
    } else {
      data.price = Number(data.price);
    }
  }

  if (req.file) data.image = getImageValue(req.file);

  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });

  if (!vehicle) {
    res.status(404);
    throw new Error('Véhicule non trouvé');
  }
  res.json({ success: true, vehicle });
});

// @desc   Désactiver/Supprimer un véhicule (Soft Delete)
// @route  DELETE /api/vehicles/:id
// @access Private/Admin
exports.deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { isActive: false });
  if (!vehicle) {
    res.status(404);
    throw new Error('Véhicule non trouvé');
  }
  res.json({ success: true, message: 'Véhicule désactivé avec succès' });
});