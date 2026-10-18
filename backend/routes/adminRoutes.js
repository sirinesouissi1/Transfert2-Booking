const express = require('express');
const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Excursion = require('../models/Excursion');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect, authorize('admin'));

// Dashboard stats
router.get('/stats', asyncHandler(async (req, res) => {
  const [totalBookings, totalUsers, totalRevenue, pendingBookings] = await Promise.all([
    Booking.countDocuments(),
    User.countDocuments({ role: 'client' }),
    Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Booking.countDocuments({ status: 'pending' }),
  ]);

  // Monthly bookings (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyBookings = await Booking.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$total' },
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    stats: {
      totalBookings,
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingBookings,
      monthlyBookings,
    },
  });
}));

module.exports = router;
