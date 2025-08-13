import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, VALIDATION_RULES } from '../../../shared/src/constants';

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('rollNumber')
    .trim()
    .isLength({ min: 10, max: 10 })
    .matches(VALIDATION_RULES.ROLL_NUMBER.PATTERN)
    .withMessage(VALIDATION_RULES.ROLL_NUMBER.MESSAGE),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage(VALIDATION_RULES.EMAIL.MESSAGE),
  body('password')
    .isLength({ min: 8 })
    .matches(VALIDATION_RULES.PASSWORD.PATTERN)
    .withMessage(VALIDATION_RULES.PASSWORD.MESSAGE),
  body('department')
    .isIn(['Computer Science and Engineering', 'Information Technology', 'Electronics and Communication Engineering', 'Electrical and Electronics Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Biotechnology'])
    .withMessage('Please select a valid department'),
  body('year')
    .isInt({ min: 1, max: 4 })
    .withMessage('Year must be between 1 and 4'),
  body('phone')
    .optional()
    .matches(VALIDATION_RULES.PHONE.PATTERN)
    .withMessage(VALIDATION_RULES.PHONE.MESSAGE),
  body('telegramUsername')
    .optional()
    .matches(/^@?[a-zA-Z0-9_]{5,32}$/)
    .withMessage('Please enter a valid Telegram username')
];

const validateLogin = [
  body('identifier')
    .notEmpty()
    .withMessage('Roll number or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/auth/register
// @desc    Register a new CBIT student
// @access  Public
router.post('/register', validateRegistration, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        errors: errors.array()
      });
    }

    const {
      rollNumber,
      name,
      email,
      password,
      department,
      year,
      phone,
      telegramUsername
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ rollNumber }, { email: email.toLowerCase() }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.USER_ALREADY_EXISTS,
        error: 'User with this roll number or email already exists'
      });
    }

    // Create new user
    const user = new User({
      rollNumber,
      name,
      email: email.toLowerCase(),
      password,
      department,
      year,
      phone,
      telegramUsername
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    // Log successful registration
    logger.info(`New user registered: ${rollNumber} - ${name}`);

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_REGISTERED,
      data: {
        user: {
          id: user._id,
          rollNumber: user.rollNumber,
          name: user.name,
          email: user.email,
          department: user.department,
          year: user.year,
          phone: user.phone,
          telegramUsername: user.telegramUsername,
          notificationPreferences: user.notificationPreferences
        },
        token
      }
    });

  } catch (error: any) {
    logger.error('Registration error:', error);

    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.USER_ALREADY_EXISTS,
        error: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.INTERNAL_ERROR,
      error: 'Registration failed'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        errors: errors.array()
      });
    }

    const { identifier, password } = req.body;

    // Find user by roll number or email
    const user = await User.findOne({
      $or: [
        { rollNumber: identifier },
        { email: identifier.toLowerCase() }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
        error: 'Invalid roll number/email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        error: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
        error: 'Invalid roll number/email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    // Log successful login
    logger.info(`User logged in: ${user.rollNumber} - ${user.name}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.USER_LOGGED_IN,
      data: {
        user: {
          id: user._id,
          rollNumber: user.rollNumber,
          name: user.name,
          email: user.email,
          department: user.department,
          year: user.year,
          phone: user.phone,
          telegramUsername: user.telegramUsername,
          notificationPreferences: user.notificationPreferences,
          lastLogin: user.lastLogin
        },
        token
      }
    });

  } catch (error: any) {
    logger.error('Login error:', error);

    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.INTERNAL_ERROR,
      error: 'Login failed'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client should remove token)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Log logout
    logger.info(`User logged out: ${req.user.rollNumber} - ${req.user.name}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.USER_LOGGED_OUT
    });

  } catch (error: any) {
    logger.error('Logout error:', error);

    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.INTERNAL_ERROR,
      error: 'Logout failed'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error: any) {
    logger.error('Get profile error:', error);

    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.INTERNAL_ERROR,
      error: 'Failed to get profile'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
        error: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET!
    ) as any;

    if (!decoded || decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
        error: 'Invalid refresh token'
      });
    }

    // Check if user exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        error: 'User not found or inactive'
      });
    }

    // Generate new access token
    const newToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: user._id,
          rollNumber: user.rollNumber,
          name: user.name,
          email: user.email,
          department: user.department,
          year: user.year
        }
      }
    });

  } catch (error: any) {
    logger.error('Token refresh error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
        error: 'Refresh token has expired'
      });
    }

    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.INTERNAL_ERROR,
      error: 'Token refresh failed'
    });
  }
});

// @route   POST /api/auth/verify-roll
// @desc    Check if roll number is available (for frontend validation)
// @access  Public
router.post('/verify-roll', [
  body('rollNumber')
    .trim()
    .isLength({ min: 10, max: 10 })
    .matches(VALIDATION_RULES.ROLL_NUMBER.PATTERN)
    .withMessage(VALIDATION_RULES.ROLL_NUMBER.MESSAGE)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        errors: errors.array()
      });
    }

    const { rollNumber } = req.body;

    // Check if roll number exists
    const existingUser = await User.findOne({ rollNumber });

    res.json({
      success: true,
      data: {
        available: !existingUser,
        rollNumber
      }
    });

  } catch (error: any) {
    logger.error('Roll number verification error:', error);

    res.status(500).json({
      success: false,
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        error: 'Verification failed'
    });
  }
});

export default router;