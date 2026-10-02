/**
 * Global Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Unhandled Application Error:', err);

  // PostgreSQL Unique Violation
  if (err.code === '23505') {
    let field = 'record';
    if (err.detail) {
      const match = err.detail.match(/\((.*?)\)=\((.*?)\)/);
      if (match) field = `${match[1]} (${match[2]})`;
    }
    return res.status(409).json({
      success: false,
      message: `A duplicate entry already exists with this ${field}.`,
      detail: err.detail,
    });
  }

  // PostgreSQL Foreign Key Violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Cannot complete operation because related records depend on this entry.',
      detail: err.detail,
    });
  }

  // PostgreSQL Invalid Input Syntax (e.g., passing string for integer)
  if (err.code === '22P02') {
    return res.status(400).json({
      success: false,
      message: 'Invalid data format provided in request parameter or body.',
    });
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error. Please try again later.',
  });
}

/**
 * 404 Route Not Found Handler
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`,
  });
}

module.exports = { errorHandler, notFoundHandler };
