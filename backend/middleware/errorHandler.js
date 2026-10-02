const ResponseDto = require('../dto/responseDto');

function errorHandler(err, req, res, next) {
  console.error('Unhandled Server Error:', err);
  return ResponseDto.error(res, 'Internal server error', 'SERVER_ERROR', 500, process.env.NODE_ENV === 'development' ? err.message : null);
}

module.exports = errorHandler;
