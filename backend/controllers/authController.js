const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Générer le token JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

// @desc   Inscription (création de compte)
// @route  POST /api/auth/register
// @access Public
exports.register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  // Vérifier si l'email existe déjà
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email déjà utilisé');
  }

  // Créer l'utilisateur (rôle 'user' par défaut)
  const user = await User.create({ firstName, lastName, email, password, phone });

  // Réponse sans le mot de passe
  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

// @desc   Connexion
// @route  POST /api/auth/login
// @access Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Email ou mot de passe incorrect');
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

// @desc   Obtenir le profil de l'utilisateur connecté
// @route  GET /api/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @desc   Mettre à jour le profil
// @route  PUT /api/auth/me
// @access Private
exports.updateMe = asyncHandler(async (req, res) => {
  const allowed = ['firstName', 'lastName', 'phone', 'avatar'];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, user });
});

// @desc   Changer le mot de passe
// @route  PUT /api/auth/change-password
// @access Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Mot de passe actuel incorrect');
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Mot de passe mis à jour' });
});