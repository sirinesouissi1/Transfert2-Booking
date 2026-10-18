const express = require('express');
const router = express.Router();
const { getExcursions, getExcursion, createExcursion, updateExcursion, deleteExcursion } = require('../controllers/excursionController');


router.get('/', getExcursions);
router.get('/:id',getExcursion);
router.post('/',createExcursion);
router.put('/:id',updateExcursion);
router.delete('/:id',deleteExcursion);



module.exports = router;
