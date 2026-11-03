const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const {
  hashToken,
  generateAccessToken,
  generateRefreshToken
} = require('../utils/generateTokens');

// Cookie options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

class AuthController {
  // @desc    Register a new user (with role support: user, owner, admin)
  // @route   POST /api/auth/register
  // @access  Public
  register = asyncHandler(async (req, res, next) => {
    const { name, email, password, phone, role = 'user' } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(409, 'User with this email already exists'));
    }

    const assignedRole = ['user', 'owner', 'admin'].includes(role) ? role : 'user';

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: assignedRole
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  });

  // @desc    Login user & issue tokens
  // @route   POST /api/auth/login
  // @access  Public
  login = asyncHandler(async (req, res, next) => {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    if (role && user.role !== role) {
      return next(
        new ApiError(
          403,
          `Role mismatch: This account is registered as "${user.role}", not "${role}"`
        )
      );
    }

    if (user.isBlocked) {
      return next(new ApiError(403, 'Account is blocked. Please contact support.'));
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store hashed refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      user: user._id,
      token: hashToken(refreshToken),
      expiresAt
    });

    res.cookie('refreshToken', refreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        accessToken
      }
    });
  });

  // @desc    Refresh access token & rotate refresh token
  // @route   POST /api/auth/refresh-token
  // @access  Public
  refreshAccessToken = asyncHandler(async (req, res, next) => {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      return next(new ApiError(401, 'Refresh token is required'));
    }

    let decoded;
    try {
      decoded = jwt.verify(
        incomingRefreshToken,
        process.env.JWT_REFRESH_SECRET
      );
    } catch (err) {
      return next(new ApiError(401, 'Invalid or expired refresh token signature'));
    }

    const hashedIncoming = hashToken(incomingRefreshToken);
    const storedToken = await RefreshToken.findOne({
      user: decoded.id,
      token: hashedIncoming
    });

    if (!storedToken) {
      return next(new ApiError(401, 'Invalid or revoked refresh token'));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return next(new ApiError(401, 'User no longer exists'));
    }

    if (user.isBlocked) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return next(new ApiError(403, 'Account is blocked. Please contact support.'));
    }

    // Token Rotation: revoke current refresh token
    await RefreshToken.deleteOne({ _id: storedToken._id });

    // Generate new token pair
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      user: user._id,
      token: hashToken(newRefreshToken),
      expiresAt
    });

    res.cookie('refreshToken', newRefreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    });
  });

  // @desc    Logout user & revoke refresh token
  // @route   POST /api/auth/logout
  // @access  Public
  logout = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (incomingRefreshToken) {
      const hashed = hashToken(incomingRefreshToken);
      await RefreshToken.deleteMany({ token: hashed });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: {}
    });
  });

  // @desc    Get current authenticated user profile
  // @route   GET /api/auth/me
  // @access  Private
  getMe = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
          role: req.user.role
        }
      }
    });
  });
}

const authController = new AuthController();
module.exports = authController;
module.exports.AuthController = AuthController;
