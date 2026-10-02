import { userRepository } from '../repositories/userRepository.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Missing or invalid authorization token." }
    });
  }

  const token = authHeader.split(' ')[1];
  // Parse user id from mock token (e.g. mock-token-STU001 or mock-token-FAC001)
  const parts = token.split('-');
  const userId = parts[2]; // e.g. STU001 or FAC001 or ACC001

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: { code: "INVALID_TOKEN", message: "Token is malformed or invalid." }
    });
  }

  const user = userRepository.findById(userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: "USER_NOT_FOUND", message: "User associated with token was not found." }
    });
  }

  req.user = user;
  next();
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required." }
      });
    }

    const userRole = req.user.role.toUpperCase();
    const upperAllowed = allowedRoles.map(r => r.toUpperCase());

    if (!upperAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Access denied. Role '${userRole}' is not authorized to access this resource.`
        }
      });
    }

    next();
  };
};
