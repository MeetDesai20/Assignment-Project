const express = require('express');
const charityController = require('../../controllers/charityController');
const { authenticate, authorize } = require('../../middleware/auth');

const router = express.Router();

/**
 * GET /api/charities
 * Get all charities
 */
router.get('/', charityController.getAll);

/**
 * GET /api/charities/featured
 * Get featured charities
 */
router.get('/featured', charityController.getFeatured);

/**
 * GET /api/charities/current
 * Get current user's selected charity
 */
router.get('/current', authenticate, charityController.getCurrent);

/**
 * POST /api/charities/select
 * Select a charity for the current user
 */
router.post('/select', authenticate, charityController.select);

/**
 * POST /api/charities
 * Create charity (admin only)
 */
router.post('/', authenticate, authorize(['admin']), charityController.create);

/**
 * PUT /api/charities/:charityId
 * Update charity (admin only)
 */
router.put('/:charityId', authenticate, authorize(['admin']), charityController.update);

/**
 * GET /api/charities/:charityId
 * Get charity by ID
 */
router.get('/:charityId', charityController.getById);

module.exports = router;
