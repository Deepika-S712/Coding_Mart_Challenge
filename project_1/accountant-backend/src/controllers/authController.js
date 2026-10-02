const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return errorResponse(res, 'Username and password are required', 400);
  }

  try {
    const result = await authService.login(username, password);
    return successResponse(res, result, 'Login successful');
  } catch (err) {
    return errorResponse(res, err.message, 401);
  }
};

const getMe = async (req, res) => {
  return successResponse(res, req.user, 'Current user profile');
};

module.exports = {
  login,
  getMe
};
