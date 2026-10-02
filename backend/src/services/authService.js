import { userRepository } from '../repositories/userRepository.js';

export const authService = {
  login({ email, password, role }) {
    if (!email || !password) {
      throw { status: 400, code: "MISSING_CREDENTIALS", message: "Email and password are required." };
    }

    const user = userRepository.findByEmail(email);
    if (!user || user.password !== password) {
      throw { status: 401, code: "INVALID_CREDENTIALS", message: "Invalid email or password." };
    }

    if (role && user.role.toUpperCase() !== role.toUpperCase()) {
      throw { status: 403, code: "ROLE_MISMATCH", message: `Account exists, but does not match role '${role}'.` };
    }

    const token = `mock-token-${user.id}-${Date.now()}`;
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  },

  getCurrentUser(userId) {
    const user = userRepository.findById(userId);
    if (!user) {
      throw { status: 404, code: "USER_NOT_FOUND", message: "User session expired or user not found." };
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
};
