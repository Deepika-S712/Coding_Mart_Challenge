const facultyRepository = require('../repositories/facultyRepository');
const { registerMockToken, revokeMockToken } = require('../middleware/authMiddleware');

class AuthService {
  async login(email, password) {
    const faculty = await facultyRepository.findByEmail(email);

    // Constant-time-like generic check to not reveal whether email or password was wrong
    if (!faculty || faculty.password !== password) {
      const error = new Error('Invalid email or password');
      error.code = 'INVALID_CREDENTIALS';
      error.statusCode = 401;
      throw error;
    }

    const accessToken = `mock-token-${faculty.id}-${Date.now()}`;
    registerMockToken(accessToken, faculty);

    return {
      accessToken,
      user: {
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        department: faculty.department,
        designation: faculty.designation
      }
    };
  }

  async logout(token) {
    if (token) {
      revokeMockToken(token);
    }
    return true;
  }
}

module.exports = new AuthService();
