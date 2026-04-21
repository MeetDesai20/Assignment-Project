const express = require('express');
const { body } = require('express-validator');
const authController = require('../../controllers/authController');

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').notEmpty().withMessage('Full name is required'),
], authController.signup);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], authController.login);

/**
 * GET /api/auth/me
 * Get current user (requires authentication)
 */
router.get('/me', require('../../middleware/auth').authenticate, authController.getCurrentUser);

module.exports = router;
