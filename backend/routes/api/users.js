const express = require('express');
const userController = require('../../controllers/userController');
const { authenticate, authorize } = require('../../middleware/auth');

const router = express.Router();

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
router.put('/profile', authenticate, userController.updateProfile);

/**
 * PUT /api/users/password
 * Change current user's password
 */
router.put('/password', authenticate, userController.changePassword);

/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get('/stats', authenticate, authorize(['admin']), userController.getStats);

/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get('/', authenticate, authorize(['admin']), userController.getAllUsers);

/**
 * GET /api/users/:userId
 * Get user by ID (admin only)
 */
router.get('/:userId', authenticate, authorize(['admin']), userController.getUserById);

module.exports = router;
