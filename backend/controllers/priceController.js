const asyncHandler = require('express-async-handler');
const Price = require('../models/Price');
const Vehicle = require('../models/Vehicle');

// Échappe les caractères spéciaux regex (sinon "Aéroport (Tunis)" casse la regex)
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ============================================================
// ADMIN — Liste des prix
// @route GET /api/prices?vehicleId=xxx (vehicleId optionnel)
// @access Private/Admin
// ============================================================
exports.getPrices = asyncHandler(async (req, res) => {
  const { vehicleId } = req.query;

  const filter = {};
  if (vehicleId) filter.vehicle = vehicleId;

  const prices = await Price.find(filter)
    .populate('vehicle', 'name')
    .sort({ from: 1, to: 1, tripType: 1 });

  res.json({ success: true, count: prices.length, prices });
});

// ============================================================
// PUBLIC — Prix pour un trajet donné (tous les véhicules)
// @route GET /api/prices/trip?from=X&to=Y&tripType=one_way
// @access Public
// ============================================================
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

  // Recherche insensible à la casse
  const priceFilter = {
    from: { $regex: `^${escapeRegex(from.trim())}$`, $options: 'i' },
    to:   { $regex: `^${escapeRegex(to.trim())}$`,   $options: 'i' },
  };
  if (tripType) priceFilter.tripType = tripType;

  const prices = await Price.find(priceFilter).lean();

  // Map vehicleId_tripType -> price
  const priceMap = {};
  prices.forEach((p) => {
    const key = `${p.vehicle.toString()}_${p.tripType}`;
    priceMap[key] = p.price;
  });

  const vehiclesWithPrice = vehicles.map((v) => {
    const id = v._id.toString();

    if (tripType) {
      const exact = priceMap[`${id}_${tripType}`];
      // Fallback : si pas de prix exact mais vehicle.price existe → l'utiliser
      return {
        ...v,
        price: exact ?? v.price ?? null,
        priceSource: exact ? 'price' : v.price ? 'vehicle_fallback' : 'on_request',
        tripType,
      };
    }

    // Sans tripType → retourner les deux prix (avec fallback)
    const oneWay = priceMap[`${id}_one_way`];
    const roundTrip = priceMap[`${id}_round_trip`];
    return {
      ...v,
      prices: {
        one_way: oneWay ?? v.price ?? null,
        round_trip: roundTrip ?? (v.price ? v.price * 2 : null),
      },
    };
  });

  res.json({
    success: true,
    count: vehiclesWithPrice.length,
    vehicles: vehiclesWithPrice,
  });
});

// ============================================================
// PUBLIC — Résoudre le prix d'UN véhicule pour un trajet
// @route GET /api/prices/resolve?vehicleId=X&from=Y&to=Z&tripType=one_way
// @access Public
// ============================================================
exports.resolvePrice = asyncHandler(async (req, res) => {
  const { vehicleId, from, to, tripType } = req.query;

  if (!vehicleId || !from || !to || !tripType) {
    res.status(400);
    throw new Error('Paramètres manquants : vehicleId, from, to, tripType requis');
  }
  if (!['one_way', 'round_trip'].includes(tripType)) {
    res.status(400);
    throw new Error('tripType doit être "one_way" ou "round_trip"');
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Véhicule introuvable');
  }

  // 1. Chercher un tarif exact (insensible à la casse)
  const exact = await Price.findOne({
    vehicle: vehicleId,
    from: { $regex: `^${escapeRegex(from.trim())}$`, $options: 'i' },
    to:   { $regex: `^${escapeRegex(to.trim())}$`,   $options: 'i' },
    tripType,
  });

  if (exact) {
    return res.json({
      success: true,
      source: 'price',
      price: exact.price,
      tripType,
    });
  }

  // 2. Fallback : prix "à partir de" du véhicule
  if (vehicle.price != null && vehicle.price > 0) {
    const fallbackPrice =
      tripType === 'round_trip' ? vehicle.price * 2 : vehicle.price;
    return res.json({
      success: true,
      source: 'vehicle_fallback',
      price: fallbackPrice,
      tripType,
    });
  }

  // 3. Rien configuré → "Prix sur demande"
  return res.json({
    success: true,
    source: 'on_request',
    price: null,
    tripType,
  });
});

// ============================================================
// ADMIN — Créer un prix
// @route POST /api/prices
// @access Private/Admin
// ============================================================
exports.createPrice = asyncHandler(async (req, res) => {
  // Lire tripType aussi
  const { vehicle, from, to, price, tripType } = req.body;

  if (!vehicle || !from || !to || price === undefined) {
    res.status(400);
    throw new Error('Champs requis : vehicle, from, to, price');
  }

  const vehicleExists = await Vehicle.findById(vehicle);
  if (!vehicleExists) {
    res.status(404);
    throw new Error('Véhicule non trouvé');
  }

  // Normalisation
  const numericPrice = Number(price);
  if (isNaN(numericPrice) || numericPrice < 0) {
    res.status(400);
    throw new Error('Le prix doit être un nombre positif');
  }

  const normalizedTripType = ['one_way', 'round_trip'].includes(tripType)
    ? tripType
    : 'one_way';

  // Vérification explicite de doublon (l'index unique laisse passer si tripType diffère)
  const existing = await Price.findOne({
    vehicle,
    from: { $regex: `^${escapeRegex(from.trim())}$`, $options: 'i' },
    to:   { $regex: `^${escapeRegex(to.trim())}$`,   $options: 'i' },
    tripType: normalizedTripType,
  });

  if (existing) {
    res.status(409);
    throw new Error(
      'Un tarif existe déjà pour ce trajet et ce type de voyage'
    );
  }

  const newPrice = await Price.create({
    vehicle,
    from: from.trim(),
    to: to.trim(),
    price: numericPrice,
    tripType: normalizedTripType,
  });

  res.status(201).json({ success: true, price: newPrice });
});

// ============================================================
// ADMIN — Mettre à jour un prix
// @route PUT /api/prices/:id
// @access Private/Admin
// ============================================================
exports.updatePrice = asyncHandler(async (req, res) => {
  const { from, to, price, tripType } = req.body;

  const update = {};
  if (from !== undefined) update.from = String(from).trim();
  if (to !== undefined) update.to = String(to).trim();
  if (price !== undefined) {
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      res.status(400);
      throw new Error('Le prix doit être un nombre positif');
    }
    update.price = numericPrice;
  }
  if (tripType !== undefined) {
    if (!['one_way', 'round_trip'].includes(tripType)) {
      res.status(400);
      throw new Error('tripType doit être "one_way" ou "round_trip"');
    }
    update.tripType = tripType;
  }

  // ✅ CORRECTION : variable locale renommée en `updatedPrice`
  // pour éviter le conflit avec le `price` déstructuré de req.body
  const updatedPrice = await Price.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });

  if (!updatedPrice) {
    res.status(404);
    throw new Error('Prix non trouvé');
  }
  res.json({ success: true, price: updatedPrice });
});

// ============================================================
// ADMIN — Supprimer un prix
// @route DELETE /api/prices/:id
// @access Private/Admin
// ============================================================
exports.deletePrice = asyncHandler(async (req, res) => {
  const price = await Price.findByIdAndDelete(req.params.id);
  if (!price) {
    res.status(404);
    throw new Error('Prix non trouvé');
  }
  res.json({ success: true, message: 'Prix supprimé' });
});