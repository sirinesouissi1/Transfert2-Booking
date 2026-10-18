const asyncHandler = require('express-async-handler');
const Transfer = require('../models/Transfer');

// @desc   Get all transfers
// @route  GET /api/transfers
// @access Public
exports.getTransfers = asyncHandler(async (req, res) => {
  const { from, to, isAirport } = req.query;
  const query = { isActive: true };
  if (from) query.from = { $regex: from, $options: 'i' };
  if (to)   query.to   = { $regex: to,   $options: 'i' };
  if (isAirport === 'true') query.isAirport = true;

  const transfers = await Transfer.find(query).sort({ basePrice: 1 });
  res.json({ success: true, count: transfers.length, transfers });
});

// @desc   Get single transfer
// @route  GET /api/transfers/:id
// @access Public
exports.getTransfer = asyncHandler(async (req, res) => {
  const transfer = await Transfer.findOne({ _id: req.params.id, isActive: true });
  if (!transfer) { res.status(404); throw new Error('Transfert non trouvé'); }
  res.json({ success: true, transfer });
});

// @desc   Create transfer (Admin)
// @route  POST /api/transfers
// @access Private/Admin
exports.createTransfer = asyncHandler(async (req, res) => {
  const transfer = await Transfer.create(req.body);
  res.status(201).json({ success: true, transfer });
});

// @desc   Update transfer (Admin)
// @route  PUT /api/transfers/:id
// @access Private/Admin
exports.updateTransfer = asyncHandler(async (req, res) => {
  const transfer = await Transfer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!transfer) { res.status(404); throw new Error('Transfert non trouvé'); }
  res.json({ success: true, transfer });
});

// @desc   Delete transfer (Admin)
// @route  DELETE /api/transfers/:id
// @access Private/Admin
exports.deleteTransfer = asyncHandler(async (req, res) => {
  await Transfer.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Transfert supprimé' });
});
