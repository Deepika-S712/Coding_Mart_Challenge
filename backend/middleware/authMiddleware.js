const ResponseDto = require('../dto/responseDto');
const facultyRepository = require('../repositories/facultyRepository');

// Temporary mock token decoder / session manager
// Structured so it can later be replaced with JWT or central CMS auth service
const activeTokens = new Map();
// Pre-seed default faculty token for testing/convenience
activeTokens.set('mock-token-FAC001', {
  userId: 'FAC001',
  role: 'FACULTY',
  expiresAt: Date.now() + 24 * 60 * 60 * 1000
});

function registerMockToken(token, user) {
  activeTokens.set(token, {
    userId: user.id,
    role: user.role,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  });
}

function revokeMockToken(token) {
  activeTokens.delete(token);
}

async function authenticateFaculty(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return ResponseDto.error(res, 'Authorization token missing', 'UNAUTHORIZED', 401);
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return ResponseDto.error(res, 'Invalid authorization format. Format: Bearer <token>', 'UNAUTHORIZED', 401);
  }

  const token = parts[1];
  let session = activeTokens.get(token);

  // If token is in format mock-token-<id> or mock-token
  if (!session && token.startsWith('mock-token')) {
    // Fallback support for mock token
    session = {
      userId: 'FAC001',
      role: 'FACULTY',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    };
  }

  if (!session) {
    return ResponseDto.error(res, 'Invalid or expired session token', 'UNAUTHORIZED', 401);
  }

  // Verify Role is FACULTY
  if (session.role !== 'FACULTY') {
    return ResponseDto.error(res, 'Access denied. Requires FACULTY role', 'FORBIDDEN', 403);
  }

  // Load faculty details from repository
  const faculty = await facultyRepository.findById(session.userId);
  if (!faculty) {
    return ResponseDto.error(res, 'Faculty user not found', 'UNAUTHORIZED', 401);
  }

  // Attach faculty user to request
  req.user = faculty;
  req.token = token;
  next();
}

module.exports = {
  authenticateFaculty,
  registerMockToken,
  revokeMockToken
};
