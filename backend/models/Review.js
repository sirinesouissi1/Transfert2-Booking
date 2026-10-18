const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    excursion:  { type: mongoose.Schema.Types.ObjectId, ref: 'Excursion' },
    transfer:   { type: mongoose.Schema.Types.ObjectId, ref: 'Transfer' },
    booking:    { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    rating:     { type: Number, required: true, min: 1, max: 5 },
    comment:    { type: String, required: true },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Update excursion rating after review
reviewSchema.statics.calcAverageRating = async function (excursionId) {
  const stats = await this.aggregate([
    { $match: { excursion: excursionId, isApproved: true } },
    { $group: { _id: '$excursion', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await mongoose.model('Excursion').findByIdAndUpdate(excursionId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].count,
    });
  }
};

reviewSchema.post('save', function () {
  if (this.excursion) this.constructor.calcAverageRating(this.excursion);
});

module.exports = mongoose.model('Review', reviewSchema);
