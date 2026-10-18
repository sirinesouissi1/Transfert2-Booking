const asyncHandler = require('express-async-handler');
const Price = require('../models/Price');
const Vehicle = require('../models/Vehicle');

// @desc    Obtenir tous les prix (admin)
// @route   GET /api/prices
// @access  Private/Admin
exports.getPrices = asyncHandler(async (req, res) => {
  const prices = await Price.find().populate('vehicle', 'name');
  res.json({ success: true, prices });
});

// @desc    Obtenir le prix pour un trajet donné (pour tous les véhicules)
// @route   GET /api/prices/trip?from=X&to=Y
// @access  Public
// controllers/priceController.js
exports.getPriceForTrip = asyncHandler(async (req, res) => {
  const { from, to, tripType } = req.query;

  if (!from || !to) {
    res.status(400);
    throw new Error('Les paramètres "from" et "to" sont requis');
  }

  if (tripType && !['one_way', 'round_trip'].includes(tripType)) {
    res.status(400);
    throw new Error('tripType doit être "one_way" ou "round_trip"');
  }

  const vehicles = await Vehicle.find({ isActive: true }).lean();

  // ✅ Filtrer par tripType si fourni
  const priceFilter = { from, to };
  if (tripType) priceFilter.tripType = tripType;

  const prices = await Price.find(priceFilter).lean();

  // Map vehicleId_tripType -> price
  const priceMap = {};
  prices.forEach(p => {
    const key = `${p.vehicle.toString()}_${p.tripType}`;
    priceMap[key] = p.price;
  });

  const vehiclesWithPrice = vehicles.map(v => {
    const id = v._id.toString();

    if (tripType) {
      return {
        ...v,
        price: priceMap[`${id}_${tripType}`] ?? null,
        tripType
      };
    }

    // Sans tripType → retourner les deux prix
    return {
      ...v,
      prices: {
        one_way:    priceMap[`${id}_one_way`]    ?? null,
        round_trip: priceMap[`${id}_round_trip`] ?? null,
      }
    };
  });

  res.json({ success: true, count: vehiclesWithPrice.length, vehicles: vehiclesWithPrice });
});

// @desc    Créer un nouveau prix
// @route   POST /api/prices
// @access  Private/Admin
exports.createPrice = asyncHandler(async (req, res) => {
  const { vehicle, from, to, price } = req.body;

  // Vérifier que le véhicule existe
  const vehicleExists = await Vehicle.findById(vehicle);
  if (!vehicleExists) {
    res.status(404);
    throw new Error('Véhicule non trouvé');
  }

  const newPrice = await Price.create({ vehicle, from, to, price });
  res.status(201).json({ success: true, price: newPrice });
});

// @desc    Mettre à jour un prix
// @route   PUT /api/prices/:id
// @access  Private/Admin
exports.updatePrice = asyncHandler(async (req, res) => {
  const price = await Price.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!price) {
    res.status(404);
    throw new Error('Prix non trouvé');
  }
  res.json({ success: true, price });
});

// @desc    Supprimer un prix
// @route   DELETE /api/prices/:id
// @access  Private/Admin
exports.deletePrice = asyncHandler(async (req, res) => {
  const price = await Price.findByIdAndDelete(req.params.id);
  if (!price) {
    res.status(404);
    throw new Error('Prix non trouvé');
  }
  res.json({ success: true, message: 'Prix supprimé' });
});