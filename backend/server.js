const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const ensureAdmin = require('./utils/ensureAdmin');
const contactRoutes = require('./routes/contactRoutes');

dotenv.config();

const app = express();

// ─── CORS ──────────────────────────────────────────────────────
// Liste des origines autorisées.
// On ajoute CLIENT_URL si défini dans les variables d'env (Render → Environment).
const allowedOrigins = [
  'https://www.go-taxi-tunisie.com',
  'https://go-taxi-tunisie.com',
  'http://localhost:5173',
  'http://localhost:5174', // Vite prend 5174 quand 5173 est occupé
  'http://localhost:5175',
  'http://localhost:3000',
  'http://localhost:4173',
];

if (process.env.CLIENT_URL) {
  // CLIENT_URL peut contenir une ou plusieurs URLs séparées par des virgules
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) allowedOrigins.push(trimmed);
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Autorise les requêtes sans Origin (Postman, curl, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`⚠️  CORS bloqué pour l'origine: ${origin}`);
      return callback(new Error('Non autorisé par CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body parsers ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ─── Static files ──────────────────────────────────────────────
// Le dossier "images" est exposé à l'URL /uploads
app.use('/uploads', express.static(path.join(__dirname, 'images')));

// ─── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', message: 'Lumina API running' })
);

// ─── Routes ────────────────────────────────────────────────────
app.use('/api/auth',               require('./routes/authRoutes'));
app.use('/api/users',              require('./routes/userRoutes'));
app.use('/api/transfers',          require('./routes/transferRoutes'));
app.use('/api/excursions',         require('./routes/excursionRoutes'));
app.use('/api/bookings',           require('./routes/bookingRoutes'));
app.use('/api/reviews',            require('./routes/reviewRoutes'));
app.use('/api/payments',           require('./routes/paymentRoutes'));
app.use('/api/admin',              require('./routes/adminRoutes'));
app.use('/api/vehicles',           require('./routes/vehicleRoutes'));
app.use('/api/prices',             require('./routes/priceRoutes'));
app.use('/api/excursion-bookings', require('./routes/excursionBookingRoutes'));
app.use('/api/contact', contactRoutes);

// ─── 404 handler ───────────────────────────────────────────────
// Placé APRÈS toutes les routes, sans stack trace dans les logs
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Error Handler GLOBAL ──────────────────────────────────────
// ⚠️ DOIT être défini APRÈS toutes les routes (y compris 404)
app.use((err, req, res, next) => {
  // Log complet côté serveur (visible dans Render → Logs)
  console.error('❌ ERREUR SERVEUR:', err.message);
  if (err.stack) console.error(err.stack);

  // Erreurs multer (upload)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Image trop lourde (max 5 Mo)',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Champ de fichier inattendu: ${err.field}`,
      });
    }
    return res.status(400).json({
      success: false,
      message: `Erreur upload: ${err.message}`,
    });
  }

  // Erreur custom du fileFilter (format d'image)
  if (err.message && /Format d'image|image non supporté/i.test(err.message)) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Erreurs Mongoose : validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Erreurs Mongoose : CastError (mauvais ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Identifiant invalide pour le champ "${err.path}"`,
    });
  }

  // Erreur CORS
  if (err.message === 'Non autorisé par CORS') {
    return res.status(403).json({ success: false, message: err.message });
  }

  // Payload JSON invalide
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'JSON invalide' });
  }

  // Les contrôleurs font res.status(400); throw new Error(...) :
  // on réutilise le code déjà posé sur la réponse s'il est >= 400
  const status =
    err.statusCode ||
    err.status ||
    (res.statusCode && res.statusCode >= 400 ? res.statusCode : 500);

  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// ─── DB + Start ────────────────────────────────────────────────
// ─── DB + Start ────────────────────────────────────────────────
const PORT = process.env.PORT || 5002;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅  MongoDB connecté');

    try {
      await ensureAdmin();
    } catch (err) {
      console.error('❌ ensureAdmin :', err.message);
    }

    app.listen(PORT, () => console.log(`🚀  Serveur sur http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌  Erreur MongoDB :', err.message);
    process.exit(1);
  });

