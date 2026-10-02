const authService = require('../services/authService');
const ResponseDto = require('../dto/responseDto');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return ResponseDto.success(res, result, 'Login successful', 200);
    } catch (err) {
      if (err.code === 'INVALID_CREDENTIALS') {
        return ResponseDto.error(res, 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
      }
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.logout(req.token);
      return ResponseDto.success(res, null, 'Logged out successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const faculty = req.user;
      return ResponseDto.success(res, {
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        department: faculty.department,
        designation: faculty.designation,
        assignedSubjects: faculty.assignedSubjects,
        assignedClasses: faculty.assignedClasses
      }, 'Authenticated user profile retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
