const ResponseDto = require('../dto/responseDto');

function validateLoginInput(req, res, next) {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    return ResponseDto.error(res, 'Email is required', 'VALIDATION_ERROR', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return ResponseDto.error(res, 'Invalid email format', 'VALIDATION_ERROR', 400);
  }

  if (!password || typeof password !== 'string' || !password.trim()) {
    return ResponseDto.error(res, 'Password is required', 'VALIDATION_ERROR', 400);
  }

  next();
}

module.exports = { validateLoginInput };
