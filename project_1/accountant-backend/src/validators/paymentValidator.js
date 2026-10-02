const { errorResponse } = require('../utils/responseHelper');

const validatePayment = (req, res, next) => {
  const { student_id, student_fee_id, amount, payment_method, transaction_id } = req.body;
  const errors = [];

  if (!student_id || !student_id.toString().trim()) {
    errors.push('Student ID is required.');
  }

  if (!student_fee_id) {
    errors.push('Student fee reference (student_fee_id) is required.');
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    errors.push('Payment amount must be a positive number greater than zero.');
  }

  const validMethods = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Online'];
  if (!payment_method || !validMethods.includes(payment_method)) {
    errors.push(`Payment method must be one of: ${validMethods.join(', ')}.`);
  }

  if (!transaction_id || !transaction_id.toString().trim()) {
    errors.push('Transaction ID / Reference number is required.');
  }

  if (errors.length > 0) {
    return errorResponse(res, 'Validation failed for Payment record.', 400, errors);
  }

  next();
};

module.exports = { validatePayment };
