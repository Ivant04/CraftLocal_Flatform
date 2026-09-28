const ApiResponse = require('../utils/apiResponse');

const notFoundHandler = (req, res, next) => {
  return ApiResponse.error(res, 404, `Endpoint [${req.method}] ${req.originalUrl} not found`);
};

module.exports = notFoundHandler;
