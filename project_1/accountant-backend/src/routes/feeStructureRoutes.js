const express = require('express');
const router = express.Router();
const feeStructureController = require('../controllers/feeStructureController');
const { validateFeeStructure } = require('../validators/feeStructureValidator');

router.get('/', feeStructureController.getFeeStructures);
router.get('/:id', feeStructureController.getFeeStructure);
router.post('/', validateFeeStructure, feeStructureController.createFeeStructure);
router.put('/:id', validateFeeStructure, feeStructureController.updateFeeStructure);
router.delete('/:id', feeStructureController.deleteFeeStructure);

module.exports = router;
