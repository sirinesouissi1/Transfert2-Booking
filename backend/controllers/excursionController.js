// controllers/excursionController.js
const asyncHandler = require('express-async-handler');
const Excursion = require('../models/Excursion');

// ─────────────────────────────────────────────────────────────────
// HELPER : normalise une coverImage en "/uploads/xxx.jpg"
// ─────────────────────────────────────────────────────────────────
function normalizeCoverImage(value) {
  if (!value) return null;
  let img = String(value).trim();

  // Si c'est déjà une URL absolue (http/https), on la garde telle quelle
  if (/^https?:\/\//i.test(img)) return img;

  // Retirer un éventuel préfixe "/uploads/" ou "uploads/" ou "/images/" ou "images/"
  img = img.replace(/^\/?uploads\//i, '');
  img = img.replace(/^\/?images\//i, '');
  // Retirer un slash initial restant
  img = img.replace(/^\/+/, '');

  return `/uploads/${img}`;
}

// ─────────────────────────────────────────────────────────────────
// HELPER : parse les champs JSON + normalise coverImage
// ─────────────────────────────────────────────────────────────────
function normalizeData(data, file) {
  console.log('🔧 Normalisation des données...');

  // Convertir les nombres
  if (data.pricePerPerson) data.pricePerPerson = Number(data.pricePerPerson);
  if (data.priceGroup)     data.priceGroup     = Number(data.priceGroup);
  if (data.maxCapacity)    data.maxCapacity    = Number(data.maxCapacity);
  if (data.minPersons)     data.minPersons     = Number(data.minPersons);

  // Parser les champs JSON envoyés en string (multipart/form-data)
  const jsonFields = [
    'itinerary',
    'includes',
    'excludes',
    'highlights',
    'departurePoints',
    'groupPrices',
  ];
  jsonFields.forEach((field) => {
    if (data[field] && typeof data[field] === 'string') {
      try {
        data[field] = JSON.parse(data[field]);
        console.log(`  ✔️  ${field} parsé`);
      } catch (e) {
        console.warn(`  ⚠️  Impossible de parser ${field} :`, data[field]);
      }
    }
  });

  // ── Gestion de l'image principale ───────────────────────────
  if (file) {
    // Fichier uploadé via multer → stocké dans backend/images/
    // ou backend/uploads/ selon votre config multer ; ici on suppose images/
    data.coverImage = `/uploads/${file.filename}`;
    console.log('🖼️  Image uploadée →', data.coverImage);
  } else if (data.coverImage) {
    data.coverImage = normalizeCoverImage(data.coverImage);
    console.log('🖼️  Image via string →', data.coverImage);
  } else {
    console.log('⚠️  Aucune image fournie');
  }

  // ── Galerie d'images ────────────────────────────────────────
  if (data.images) {
    // si envoyé en string JSON via multipart
    if (typeof data.images === 'string') {
      try { data.images = JSON.parse(data.images); } catch (_) { /* ignore */ }
    }
    if (Array.isArray(data.images)) {
      data.images = data.images.map(normalizeCoverImage).filter(Boolean);
      console.log('🖼️  Galerie →', data.images);
    }
  }

  // Booléens
  if (data.isFeatured !== undefined) {
    data.isFeatured = data.isFeatured === 'true' || data.isFeatured === true;
  }
  if (data.isActive !== undefined) {
    data.isActive = data.isActive === 'true' || data.isActive === true;
  }

  return data;
}

// ─────────────────────────────────────────────────────────────────
// GET ALL
// ─────────────────────────────────────────────────────────────────
exports.getExcursions = asyncHandler(async (req, res) => {
  console.log('📥 GET /api/excursions - query :', req.query);
  const { category, featured, search, page = 1, limit = 12 } = req.query;

  const query = { isActive: true };
  if (category) query.category = category;
  if (featured === 'true') query.isFeatured = true;
  if (search) {
    query.$or = [
      { name:        { $regex: search, $options: 'i' } },
      { destination: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Excursion.countDocuments(query);
  const excursions = await Excursion.find(query)
    .sort({ isFeatured: -1, rating: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  console.log(`✅ ${excursions.length} excursions trouvées sur ${total}`);

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    excursions,
  });
});

// ─────────────────────────────────────────────────────────────────
// GET ONE
// ─────────────────────────────────────────────────────────────────
exports.getExcursion = asyncHandler(async (req, res) => {
  console.log('📥 GET /api/excursions/:id - id =', req.params.id);

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = { isActive: true };
  if (isObjectId) query._id  = req.params.id;
  else            query.slug = req.params.id;

  const excursion = await Excursion.findOne(query);
  if (!excursion) {
    console.error('❌ Excursion non trouvée');
    res.status(404);
    throw new Error('Excursion non trouvée');
  }
  console.log('✅ Excursion trouvée :', excursion.name);
  res.json({ success: true, excursion });
});

// ─────────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────────
exports.createExcursion = asyncHandler(async (req, res) => {
  console.log('\n════════════════════════════════════════');
  console.log('📥 POST /api/excursions');
  console.log('Body :', req.body);
  console.log('File :', req.file);
  console.log('════════════════════════════════════════\n');

  const excursionData = normalizeData({ ...req.body }, req.file);

  console.log('📦 Données finales avant create :', excursionData);

  try {
    const excursion = await Excursion.create(excursionData);
    console.log('✅ Excursion créée :', excursion._id);
    res.status(201).json({ success: true, excursion });
  } catch (err) {
    console.error('❌ Erreur création excursion :', err.message);
    if (err.errors) {
      Object.keys(err.errors).forEach((key) => {
        console.error(`   - ${key} : ${err.errors[key].message}`);
      });
    }
    res.status(400);
    throw err;
  }
});

// ─────────────────────────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────────────────────────
exports.updateExcursion = asyncHandler(async (req, res) => {
  console.log('\n════════════════════════════════════════');
  console.log('📥 PUT /api/excursions/:id - id =', req.params.id);
  console.log('Body :', req.body);
  console.log('File :', req.file);
  console.log('════════════════════════════════════════\n');

  const updateData = normalizeData({ ...req.body }, req.file);
  console.log('📦 Données finales avant update :', updateData);

  try {
    const excursion = await Excursion.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!excursion) {
      console.error('❌ Excursion non trouvée');
      res.status(404);
      throw new Error('Excursion non trouvée');
    }
    console.log('✅ Excursion mise à jour :', excursion._id);
    res.json({ success: true, excursion });
  } catch (err) {
    console.error('❌ Erreur update excursion :', err.message);
    res.status(400);
    throw err;
  }
});

// ─────────────────────────────────────────────────────────────────
// DELETE (soft delete)
// ─────────────────────────────────────────────────────────────────
exports.deleteExcursion = asyncHandler(async (req, res) => {
  console.log('📥 DELETE /api/excursions/:id - id =', req.params.id);

  const excursion = await Excursion.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!excursion) {
    console.error('❌ Excursion non trouvée');
    res.status(404);
    throw new Error('Excursion non trouvée');
  }
  console.log('✅ Excursion désactivée :', excursion._id);
  res.json({ success: true, message: 'Excursion désactivée' });
});