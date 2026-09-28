const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class AuthController {
  register = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role } = req.body;
    const result = await authService.register({ name, email, password, phone, role });
    return ApiResponse.success(res, 201, 'User registered successfully', result);
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return ApiResponse.success(res, 200, 'Login successful', result);
  });

  logout = asyncHandler(async (req, res) => {
    // For stateless JWT, logout is primarily handled by the client removing the token.
    // If token blacklisting or cookies are introduced, invalidate here.
    return ApiResponse.success(res, 200, 'Logout successful', null);
  });

  getMe = asyncHandler(async (req, res) => {
    const data = await authService.getMe(req.user._id);
    return ApiResponse.success(res, 200, 'Fetched current user profile successfully', data);
  });
}

module.exports = new AuthController();
