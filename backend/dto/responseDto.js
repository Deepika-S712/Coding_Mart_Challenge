class ResponseDto {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static error(res, message = 'An error occurred', errorCode = 'INTERNAL_ERROR', statusCode = 500, details = null) {
    const payload = {
      success: false,
      message,
      error: errorCode
    };
    if (details) payload.details = details;
    return res.status(statusCode).json(payload);
  }
}

module.exports = ResponseDto;
