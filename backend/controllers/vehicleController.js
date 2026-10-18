const asyncHandler = require('express-async-handler');
const Vehicle = require('../models/Vehicle');

// @desc   Obtenir tous les véhicules actifs
// @route  GET /api/vehicles
// @access Public
exports.getVehicles = asyncHandler(async (req, res) => {
  // On ne récupère que les véhicules marqués comme actifs
  const vehicles = await Vehicle.find({ isActive: true }).sort({ capacity: 1 });
  
  res.json({
    success: true,
    count: vehicles.length,
    vehicles
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
    vehicle
  });
});

// @desc   Créer un véhicule
// @route  POST /api/vehicles
// @access Private/Admin
exports.createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.create(req.body);
  
  res.status(201).json({
    success: true,
    vehicle
  });
});

// @desc   Mettre à jour un véhicule
// @route  PUT /api/vehicles/:id
// @access Private/Admin
exports.updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!vehicle) {
    res.status(404);
    throw new Error('Véhicule non trouvé');
  }

  res.json({
    success: true,
    vehicle
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
    message: 'Véhicule désactivé avec succès'
  });
});