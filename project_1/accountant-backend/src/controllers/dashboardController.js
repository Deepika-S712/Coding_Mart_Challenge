const dashboardService = require('../services/dashboardService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardData();
    return successResponse(res, data, 'Dashboard data retrieved successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { getDashboard };
