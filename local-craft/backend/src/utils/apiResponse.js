/**
 * Unified API Response Formatter
 * Success: { success: true, message: string, data: any }
 * Error: { success: false, message: string, errors?: any }
 */

class ApiResponse {
  static success(res, statusCode = 200, message = 'Success', data = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static error(res, statusCode = 500, message = 'Internal Server Error', errors = null) {
    const payload = {
      success: false,
      message
    };
    if (errors && process.env.NODE_ENV !== 'production') {
      payload.errors = errors;
    }
    return res.status(statusCode).json(payload);
  }
}

module.exports = ApiResponse;
