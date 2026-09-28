const User = require('../models/User');
const ApiError = require('../utils/apiError');

class UserService {
  async getAllUsers(query = {}) {
    const filter = {};
    if (query.role) filter.role = query.role;
    if (query.status) filter.status = query.status;
    return await User.find(filter).sort({ createdAt: -1 });
  }

  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  async updateUserProfile(userId, updateData) {
    const allowedFields = ['name', 'phone', 'avatar'];
    const filteredUpdate = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredUpdate[field] = updateData[field];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, filteredUpdate, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) {
      throw new ApiError(404, 'User not found');
    }

    return updatedUser;
  }

  async updateUserStatus(userId, status) {
    const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  async updateUserRole(userId, role) {
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
}

module.exports = new UserService();
