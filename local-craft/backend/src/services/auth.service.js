const User = require('../models/User');
const Artisan = require('../models/Artisan');
const ApiError = require('../utils/apiError');
const { signToken } = require('../utils/jwt');

class AuthService {
  /**
   * Register a new user
   */
  async register({ name, email, password, phone, role = 'CUSTOMER' }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email address already exists');
    }

    // Role safety: default to CUSTOMER if not provided or valid
    const validRoles = ['CUSTOMER', 'ARTISAN'];
    const assignedRole = validRoles.includes(role) ? role : 'CUSTOMER';

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: assignedRole,
      status: 'ACTIVE'
    });

    // If user registered as ARTISAN, initialize an artisan profile
    if (user.role === 'ARTISAN') {
      await Artisan.create({
        user: user._id,
        studioName: `${user.name}'s Studio`,
        craftSpecialty: 'Handicraft',
        verificationStatus: 'PENDING'
      });
    }

    const token = signToken({ id: user._id, role: user.role });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        status: user.status
      },
      token
    };
  }

  /**
   * Log in user
   */
  async login({ email, password }) {
    if (!email || !password) {
      throw new ApiError(400, 'Please provide both email and password');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.status === 'BLOCKED') {
      throw new ApiError(403, 'Your account has been blocked. Please contact support');
    }

    if (user.status === 'INACTIVE') {
      throw new ApiError(403, 'Your account is inactive. Please activate your account');
    }

    const token = signToken({ id: user._id, role: user.role });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        status: user.status
      },
      token
    };
  }

  /**
   * Get current authenticated user details
   */
  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    let artisanProfile = null;
    if (user.role === 'ARTISAN') {
      artisanProfile = await Artisan.findOne({ user: user._id });
    }

    return {
      user,
      artisanProfile
    };
  }
}

module.exports = new AuthService();
