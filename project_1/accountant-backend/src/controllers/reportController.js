const reportService = require('../services/reportService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getReports = async (req, res) => {
  try {
    const reportData = await reportService.getFinancialReports(req.query);
    return successResponse(res, reportData, 'Financial reports retrieved successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { getReports };
