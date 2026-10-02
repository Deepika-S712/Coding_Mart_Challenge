const paymentService = require('../services/paymentService');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/responseHelper');

const getPayments = async (req, res) => {
  try {
    const result = await paymentService.getAllPayments(req.query);
    return paginatedResponse(res, result.data, result.pagination, 'Payments retrieved successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getPayment = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    if (!payment) {
      return errorResponse(res, `Payment with ID ${req.params.id} not found`, 404);
    }
    return successResponse(res, payment, 'Payment details retrieved');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const createPayment = async (req, res) => {
  try {
    const accountantName = req.user?.fullName || req.user?.username || 'College Accountant';
    const result = await paymentService.recordPayment(req.body, accountantName);
    return successResponse(
      res,
      result,
      'Payment recorded and receipt generated successfully',
      201
    );
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

module.exports = {
  getPayments,
  getPayment,
  createPayment
};
