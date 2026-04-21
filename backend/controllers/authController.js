/**
 * Authentication Controller
 * Handles user signup, login, and token generation
 */

const { validationResult } = require('express-validator');
const Users = require('../models/User');
const { handleSuccess, handleError, handleValidationError } = require('../utils/responseHandler');
const { hashPassword, comparePassword, generateToken, validateEmail } = require('../utils/auth');

// Signup
exports.signup = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleValidationError(res, errors);
    }

    const { email, password, fullName } = req.body;

    // Check if user exists
    const existingUser = await Users.findByEmail(email);
    if (existingUser) {
      return handleError(res, new Error('User already exists'), 400, 'Email is already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await Users.create({
      email,
      fullName,
      passwordHash,
      role: 'user',
    });

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    // Return user (without password)
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };

    return handleSuccess(res, { user: userData, token }, 201, 'Signup successful');
  } catch (error) {
    return handleError(res, error);
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleValidationError(res, errors);
    }

    const { email, password } = req.body;

    // Find user
    const user = await Users.findByEmail(email);
    if (!user) {
      return handleError(res, new Error('Invalid credentials'), 401, 'Email or password is incorrect');
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return handleError(res, new Error('Invalid credentials'), 401, 'Email or password is incorrect');
    }

    // Check if user is active
    if (!user.is_active) {
      return handleError(res, new Error('Account disabled'), 403, 'Your account has been disabled');
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    // Return user (without password)
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };

    return handleSuccess(res, { user: userData, token }, 200, 'Login successful');
  } catch (error) {
    return handleError(res, error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await Users.findById(req.user.userId);
    if (!user) {
      return handleError(res, new Error('User not found'), 404, 'User not found');
    }

    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };

    return handleSuccess(res, userData, 200, 'User fetched successfully');
  } catch (error) {
    return handleError(res, error);
  }
};
