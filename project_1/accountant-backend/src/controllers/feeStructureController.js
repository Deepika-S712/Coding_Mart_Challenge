const feeStructureService = require('../services/feeStructureService');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/responseHelper');

const getFeeStructures = async (req, res) => {
  try {
    const result = await feeStructureService.getAllFeeStructures(req.query);
    return paginatedResponse(res, result.data, result.pagination, 'Fee structures retrieved successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getFeeStructure = async (req, res) => {
  try {
    const feeStructure = await feeStructureService.getFeeStructureById(req.params.id);
    if (!feeStructure) {
      return errorResponse(res, `Fee structure with ID ${req.params.id} not found`, 404);
    }
    return successResponse(res, feeStructure, 'Fee structure details retrieved');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const createFeeStructure = async (req, res) => {
  try {
    const created = await feeStructureService.createFeeStructure(req.body);
    return successResponse(res, created, 'Fee structure created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

const updateFeeStructure = async (req, res) => {
  try {
    const updated = await feeStructureService.updateFeeStructure(req.params.id, req.body);
    if (!updated) {
      return errorResponse(res, `Fee structure with ID ${req.params.id} not found`, 404);
    }
    return successResponse(res, updated, 'Fee structure updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

const deleteFeeStructure = async (req, res) => {
  try {
    const deleted = await feeStructureService.deleteFeeStructure(req.params.id);
    if (!deleted) {
      return errorResponse(res, `Fee structure with ID ${req.params.id} not found`, 404);
    }
    return successResponse(res, deleted, 'Fee structure deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

module.exports = {
  getFeeStructures,
  getFeeStructure,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure
};
