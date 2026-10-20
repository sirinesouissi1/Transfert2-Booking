const asyncHandler = require('express-async-handler');
const Vehicle = require('../models/Vehicle');

// Convertit le fichier reçu par multer en valeur à stocker dans MongoDB
// - production (memoryStorage) : image encodée en data URL (base64)
// - local (diskStorage)        : nom du fichier enregistré dans backend/images
const getImageValue = (file) =>
  file.buffer
    ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
    : file.filename;

// @desc   Obtenir tous les véhicules actifs
// @route  GET /api/vehicles
// @access Public
exports.getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ isActive: true }).sort({ capacity: 1 });

  res.json({
    success: true,
    count: vehicles.length,
    vehicles,
  });
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

  res.json({
    success: true,
    vehicle,
  });
});

// @desc   Créer un véhicule (avec image optionnelle)
// @route  POST /api/vehicles
// @access Private/Admin
exports.createVehicle = asyncHandler(async (req, res) => {
  const { name, description, capacity } = req.body;

  const data = {
    name,
    description,
    capacity: Number(capacity),
  };
  if (req.file) data.image = getImageValue(req.file);

  const vehicle = await Vehicle.create(data);

  res.status(201).json({
    success: true,
    vehicle,
  });
});

// @desc   Mettre à jour un véhicule (avec nouvelle image optionnelle)
// @route  PUT /api/vehicles/:id
// @access Private/Admin
exports.updateVehicle = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.capacity !== undefined) data.capacity = Number(data.capacity);
  if (req.file) data.image = getImageValue(req.file);

  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });

  if (!vehicle) {
    res.status(404);
    throw new Error('Véhicule non trouvé');
  }

  res.json({
    success: true,
    vehicle,
  });
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

  res.json({
    success: true,
    message: 'Véhicule désactivé avec succès',
  });
});