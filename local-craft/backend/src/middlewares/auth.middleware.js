const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication token missing or invalid format (Bearer token required)');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Token has expired. Please log in again');
      }
      throw new ApiError(401, 'Invalid authentication token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }

    if (user.status === 'BLOCKED') {
      throw new ApiError(403, 'Your account has been blocked. Please contact support');
    }

    if (user.status === 'INACTIVE') {
      throw new ApiError(403, 'Your account is inactive. Please activate your account');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 401, 'Unauthorized: Please authenticate first');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(res, 403, `Access denied: Role [${req.user.role}] does not have permission for this resource`);
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
