const receiptService = require('../services/receiptService');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/responseHelper');

const getReceipts = async (req, res) => {
  try {
    const result = await receiptService.getAllReceipts(req.query);
    return paginatedResponse(res, result.data, result.pagination, 'Receipts retrieved successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getReceipt = async (req, res) => {
  try {
    const receipt = await receiptService.getReceiptById(req.params.id);
    if (!receipt) {
      return errorResponse(res, `Receipt with ID ${req.params.id} not found`, 404);
    }
    return successResponse(res, receipt, 'Receipt details retrieved');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getReceipts,
  getReceipt
};
