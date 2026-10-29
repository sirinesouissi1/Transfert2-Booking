const express = require('express');
const router = express.Router();
const { getExcursions, getExcursion, createExcursion, updateExcursion, deleteExcursion } = require('../controllers/excursionController');
const uploadImage = require('../middleware/upload'); // c'est la factory, pas multer

router.get('/', getExcursions);
router.get('/:id', getExcursion);

// ⬇️ on appelle la factory avec le nom du champ
router.post('/', uploadImage('coverImage'), createExcursion);
router.put('/:id', uploadImage('coverImage'), updateExcursion);

router.delete('/:id', deleteExcursion);

module.exports = router;