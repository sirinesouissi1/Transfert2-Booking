// userRoutes.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/', asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, users });
}));
router.put('/:id/role', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  res.json({ success: true, user });
}));
router.delete('/:id', asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Utilisateur supprimé' });
}));

module.exports = router;
