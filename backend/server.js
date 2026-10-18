const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ─── Static files ──────────────────────────────────────────────
// Le dossier "images" est exposé à l'URL /uploads
// Ex: backend/images/sidibou.jpg → http://localhost:5002/uploads/sidibou.jpg
app.use('/uploads', express.static(path.join(__dirname, 'images')));

// ─── Routes ────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/users',        require('./routes/userRoutes'));
app.use('/api/transfers',    require('./routes/transferRoutes'));
app.use('/api/excursions',   require('./routes/excursionRoutes'));
app.use('/api/bookings',     require('./routes/bookingRoutes'));
app.use('/api/reviews',      require('./routes/reviewRoutes'));
app.use('/api/payments',     require('./routes/paymentRoutes'));
app.use('/api/admin',        require('./routes/adminRoutes'));
app.use('/api/vehicles',     require('./routes/vehicleRoutes'));
app.use('/api/prices',       require('./routes/priceRoutes'));
app.use('/api/excursion-bookings', require('./routes/excursionBookingRoutes'));

// ─── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', message: 'Lumina API running' })
);

// ─── Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// ─── DB + Start ────────────────────────────────────────────────
const PORT = process.env.PORT || 5002;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connecté');
    app.listen(PORT, () => console.log(`🚀  Serveur sur http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌  Erreur MongoDB :', err.message);
    process.exit(1);
  });