const studentFeeService = require('../services/studentFeeService');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/responseHelper');

const getStudentFees = async (req, res) => {
  try {
    const result = await studentFeeService.getAllStudentFees(req.query);
    return paginatedResponse(res, result.data, result.pagination, 'Student fees retrieved successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getStudentFeeDetails = async (req, res) => {
  try {
    const details = await studentFeeService.getStudentFeeDetails(req.params.studentId);
    if (!details) {
      return errorResponse(res, `Student with ID '${req.params.studentId}' not found`, 404);
    }
    return successResponse(res, details, 'Student fee details retrieved successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getPendingFees = async (req, res) => {
  try {
    const result = await studentFeeService.getPendingFees(req.query);
    return paginatedResponse(res, result.data, result.pagination, 'Pending fees retrieved successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getStudentFees,
  getStudentFeeDetails,
  getPendingFees
};
