const express = require('express');
const { body } = require('express-validator');
const scoreController = require('../../controllers/scoreController');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

/**
 * POST /api/scores
 * Add a new golf score
 */
router.post('/', authenticate, [
  body('scoreValue').isInt({ min: 1, max: 45 }).withMessage('Score must be between 1 and 45'),
  body('scoreDate').isISO8601().withMessage('Valid date is required'),
  body('holes').optional().isInt({ min: 9, max: 18 }).withMessage('Holes must be 9 or 18'),
], scoreController.addScore);

/**
 * GET /api/scores
 * Get user's last 5 scores
 */
router.get('/', authenticate, scoreController.getScores);

/**
 * GET /api/scores/:scoreId
 * Get a specific score
 */
router.get('/:scoreId', authenticate, scoreController.getScore);

/**
 * PUT /api/scores/:scoreId
 * Update a score
 */
router.put('/:scoreId', authenticate, scoreController.updateScore);

/**
 * DELETE /api/scores/:scoreId
 * Delete a score
 */
router.delete('/:scoreId', authenticate, scoreController.deleteScore);

module.exports = router;
