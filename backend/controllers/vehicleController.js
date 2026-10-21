const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');

// Convertit le fichier multer en valeur à stocker dans MongoDB
const getImageValue = (file) =>
  file.buffer
    ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
    : file.filename;

// @route GET /api/vehicles
exports.getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ isActive: true }).sort({ capacity: 1 });
  res.json({ success: true, count: vehicles.length, vehicles });
});

// @route GET /api/vehicles/:id
exports.getVehicle = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('ID de véhicule invalide');
  }
  const vehicle = await Vehicle.findOne({ _id: req.params.id, isActive: true });
  if (!vehicle) {
    res.status(404);
    throw new Error('Véhicule non trouvé');
  }
  res.json({ success: true, vehicle });
});

// @route POST /api/vehicles
exports.createVehicle = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const { name, description, capacity, price } = body;

  if (!name || !String(name).trim()) {
    res.status(400);
    throw new Error('Le nom du véhicule est requis');
  }
  if (
    capacity === undefined ||
    capacity === null ||
    capacity === '' ||
    isNaN(Number(capacity))
  ) {
    res.status(400);
    throw new Error('La capacité est requise et doit être un nombre');
  }

  const data = {
    name: String(name).trim(),
    description: description ? String(description).trim() : '',
    capacity: Number(capacity),
    price: null,
  };

  // Prix optionnel : vide ou <= 0 → null ("sur demande")
  if (price !== undefined && price !== '' && !isNaN(Number(price)) && Number(price) > 0) {
    data.price = Number(price);
  }

  if (req.file) data.image = getImageValue(req.file);

  const vehicle = await Vehicle.create(data);
  res.status(201).json({ success: true, vehicle });
});

// @route PUT /api/vehicles/:id
exports.updateVehicle = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('ID de véhicule invalide');
  }

  const body = req.body || {};
  const allowed = ['name', 'description', 'capacity', 'price', 'features', 'isActive'];
  const data = {};
  allowed.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });

  if (data.name !== undefined) data.name = String(data.name).trim();

  if (data.capacity !== undefined) {
    if (data.capacity === '' || isNaN(Number(data.capacity))) {
      res.status(400);
      throw new Error('La capacité doit être un nombre');
    }
    data.capacity = Number(data.capacity);
  }

  if (data.price !== undefined) {
    if (
      data.price === '' ||
      data.price === null ||
      data.price === 'null' ||
      isNaN(Number(data.price)) ||
      Number(data.price) <= 0
    ) {
      data.price = null;
    } else {
      data.price = Number(data.price);
    }
  }

  if (data.features !== undefined && typeof data.features === 'string') {
    data.features = data.features.split(',').map((f) => f.trim()).filter(Boolean);
  }

  if (data.isActive !== undefined && typeof data.isActive === 'string') {
    data.isActive = data.isActive === 'true';
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

// @route DELETE /api/vehicles/:id  (soft delete)
exports.deleteVehicle = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('ID de véhicule invalide');
  }
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { isActive: false });
  if (!vehicle) {
    res.status(404);
    throw new Error('Véhicule non trouvé');
  }
  res.json({ success: true, message: 'Véhicule désactivé avec succès' });
});