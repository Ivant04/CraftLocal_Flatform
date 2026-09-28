const userService = require('../services/user.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class UserController {
  getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers(req.query);
    return ApiResponse.success(res, 200, 'Users retrieved successfully', users);
  });

  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    return ApiResponse.success(res, 200, 'User retrieved successfully', user);
  });

  updateProfile = asyncHandler(async (req, res) => {
    const updated = await userService.updateUserProfile(req.user._id, req.body);
    return ApiResponse.success(res, 200, 'Profile updated successfully', updated);
  });

  updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const user = await userService.updateUserStatus(req.params.id, status);
    return ApiResponse.success(res, 200, 'User status updated successfully', user);
  });

  updateRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const user = await userService.updateUserRole(req.params.id, role);
    return ApiResponse.success(res, 200, 'User role updated successfully', user);
  });
}

module.exports = new UserController();
