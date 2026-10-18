// ─── transferRoutes.js ────────────────────────────────────────────────────────
const express = require('express');
const { getTransfers, getTransfer, createTransfer, updateTransfer, deleteTransfer } = require('../controllers/transferController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/', getTransfers);
router.get('/:id', getTransfer);
router.post('/', protect, authorize('admin'), createTransfer);
router.put('/:id', protect, authorize('admin'), updateTransfer);
router.delete('/:id', protect, authorize('admin'), deleteTransfer);

module.exports = router;
