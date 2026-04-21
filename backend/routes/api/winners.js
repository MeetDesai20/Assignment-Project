const express = require('express');
const winnerController = require('../../controllers/winnerController');
const { authenticate, authorize } = require('../../middleware/auth');

const router = express.Router();

/**
 * GET /api/winners/pending
 * Get pending verifications (admin only)
 */
router.get('/pending', authenticate, authorize(['admin']), winnerController.getPendingVerifications);

/**
 * GET /api/winners/my-winnings
 * Get user's winnings
 */
router.get('/my-winnings', authenticate, winnerController.getUserWinnings);

/**
 * POST /api/winners/:winnerId/proof
 * Submit proof of win
 */
router.post('/:winnerId/proof', authenticate, winnerController.submitProof);

/**
 * PUT /api/winners/:winnerId/verify
 * Verify winner (admin only)
 */
router.put('/:winnerId/verify', authenticate, authorize(['admin']), winnerController.verify);

/**
 * PUT /api/winners/:winnerId/paid
 * Mark as paid (admin only)
 */
router.put('/:winnerId/paid', authenticate, authorize(['admin']), winnerController.markAsPaid);

module.exports = router;
