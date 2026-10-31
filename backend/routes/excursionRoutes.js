const express = require('express');
const router = express.Router();
const { getExcursions, getExcursion, createExcursion, updateExcursion, deleteExcursion } = require('../controllers/excursionController');
const uploadImage = require('../middleware/upload');

router.get('/', getExcursions);
router.get('/:id', getExcursion);

// ⬇️ CHANGER 'image' EN 'coverImage'
router.post('/', uploadImage('coverImage'), createExcursion);
router.put('/:id', uploadImage('coverImage'), updateExcursion);

router.delete('/:id', deleteExcursion);

module.exports = router;