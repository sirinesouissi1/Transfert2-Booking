const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Protect routes — verify JWT
/*exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Non autorisé — token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Non autorisé — token invalide' });
  }
});*/


exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Non autorisé — token manquant' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // 🔒 Timeout d'inactivité serveur (30 min)
    const INACTIVITY_MS = 30 * 60 * 1000;
    const now = Date.now();
    if (user.lastActivityAt && now - new Date(user.lastActivityAt).getTime() > INACTIVITY_MS) {
      return res.status(401).json({ success: false, message: 'Session expirée pour inactivité' });
    }
    user.lastActivityAt = new Date();
    await user.save({ validateBeforeSave: false });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Non autorisé — token invalide' });
  }
});

// Role-based access
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Rôle "${req.user.role}" non autorisé` });
  }
  next();
};