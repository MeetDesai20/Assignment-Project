const express = require('express');
const drawController = require('../../controllers/drawController');
const { authenticate, authorize } = require('../../middleware/auth');

const router = express.Router();

/**
 * GET /api/draws
 * Get all draws (admin only)
 */
router.get('/', authenticate, authorize(['admin']), drawController.getAll);

/**
 * GET /api/draws/current
 * Get current month draw
 */
router.get('/current', drawController.getCurrentDraw);

/**
 * GET /api/draws/:drawId/results
 * Get draw results
 */
router.get('/:drawId/results', drawController.getResults);

/**
 * POST /api/draws
 * Create draw (admin only)
 */
router.post('/', authenticate, authorize(['admin']), drawController.create);

/**
 * PUT /api/draws/:drawId
 * Update draw (admin only)
 */
router.put('/:drawId', authenticate, authorize(['admin']), drawController.update);

/**
 * POST /api/draws/:drawId/simulate
 * Simulate draw (admin only)
 */
router.post('/:drawId/simulate', authenticate, authorize(['admin']), drawController.simulate);

/**
 * POST /api/draws/:drawId/publish
 * Publish draw results (admin only)
 */
router.post('/:drawId/publish', authenticate, authorize(['admin']), drawController.publish);

module.exports = router;
