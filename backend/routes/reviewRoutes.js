// reviewRoutes.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/excursion/:excursionId', asyncHandler(async (req, res) => {
  const reviews = await Review.find({ excursion: req.params.excursionId, isApproved: true })
    .populate('user', 'firstName lastName avatar').sort({ createdAt: -1 });
  res.json({ success: true, reviews });
}));

router.post('/', protect, asyncHandler(async (req, res) => {
  const review = await Review.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, review });
}));

router.put('/:id/approve', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  res.json({ success: true, review });
}));

module.exports = router;
