/**
 * Winner Controller
 * Handles winner verification and payout tracking
 */

const Winners = require('../models/Winner');
const { handleSuccess, handleError } = require('../utils/responseHandler');

// Get pending verifications (admin)
exports.getPendingVerifications = async (req, res) => {
  try {
    const winners = await Winners.getPendingVerifications();
    return handleSuccess(res, winners);
  } catch (error) {
    return handleError(res, error);
  }
};

// Get user's winnings
exports.getUserWinnings = async (req, res) => {
  try {
    const winnings = await Winners.getUserWinnings(req.user.userId);
    return handleSuccess(res, winnings);
  } catch (error) {
    return handleError(res, error);
  }
};

// Submit proof of win
exports.submitProof = async (req, res) => {
  try {
    const { proofUrl } = req.body;

    if (!proofUrl) {
      return handleError(res, new Error('Proof URL is required'), 400);
    }

    const winner = await Winners.submitProof(req.params.winnerId, proofUrl);
    return handleSuccess(res, winner, 200, 'Proof submitted for verification');
  } catch (error) {
    return handleError(res, error);
  }
};

// Verify winner (admin)
exports.verify = async (req, res) => {
  try {
    const { isVerified } = req.body;

    const winner = await Winners.verify(req.params.winnerId, isVerified);
    return handleSuccess(res, winner, 200, `Winner ${isVerified ? 'verified' : 'rejected'}`);
  } catch (error) {
    return handleError(res, error);
  }
};

// Mark as paid (admin)
exports.markAsPaid = async (req, res) => {
  try {
    const winner = await Winners.markAsPaid(req.params.winnerId);
    return handleSuccess(res, winner, 200, 'Winner marked as paid');
  } catch (error) {
    return handleError(res, error);
  }
};
