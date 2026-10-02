module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'cms-faculty-mock-secret-key-2026',
  tokenPrefix: 'mock-token-',
  corsOrigin: process.env.CORS_ORIGIN || '*'
};
