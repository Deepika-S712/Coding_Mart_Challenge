const { errorResponse } = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  console.error('[Accountant Backend Error]:', err);

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode, err.errors || null);
};

module.exports = errorHandler;
