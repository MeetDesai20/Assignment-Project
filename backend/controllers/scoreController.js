/**
 * Score Controller
 * Handles golf score entry and management
 */

const { validationResult } = require('express-validator');
const Scores = require('../models/Score');
const { handleSuccess, handleError, handleValidationError } = require('../utils/responseHandler');

// Add score
exports.addScore = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleValidationError(res, errors);
    }

    const { scoreValue, scoreDate, course, holes, stablefordPoints } = req.body;

    const score = await Scores.addScore({
      userId: req.user.userId,
      scoreValue,
      scoreDate,
      course,
      holes,
      stablefordPoints,
    });

    return handleSuccess(res, score, 201, 'Score added successfully');
  } catch (error) {
    return handleError(res, error, 400);
  }
};

// Get user's last 5 scores
exports.getScores = async (req, res) => {
  try {
    const scores = await Scores.getLastFive(req.user.userId);
    return handleSuccess(res, scores);
  } catch (error) {
    return handleError(res, error);
  }
};

// Get single score
exports.getScore = async (req, res) => {
  try {
    const score = await Scores.getById(req.params.scoreId);
    if (!score) {
      return handleError(res, new Error('Score not found'), 404);
    }

    // Verify ownership
    if (score.user_id !== req.user.userId) {
      return handleError(res, new Error('Unauthorized'), 403);
    }

    return handleSuccess(res, score);
  } catch (error) {
    return handleError(res, error);
  }
};

// Update score
exports.updateScore = async (req, res) => {
  try {
    const score = await Scores.getById(req.params.scoreId);
    if (!score) {
      return handleError(res, new Error('Score not found'), 404);
    }

    // Verify ownership
    if (score.user_id !== req.user.userId) {
      return handleError(res, new Error('Unauthorized'), 403);
    }

    const updates = {};
    if (req.body.scoreValue !== undefined) updates.score_value = req.body.scoreValue;
    if (req.body.scoreDate !== undefined) updates.score_date = req.body.scoreDate;
    if (req.body.course !== undefined) updates.course = req.body.course;
    if (req.body.stablefordPoints !== undefined) updates.stableford_points = req.body.stablefordPoints;

    const updatedScore = await Scores.update(req.params.scoreId, updates);
    return handleSuccess(res, updatedScore, 200, 'Score updated successfully');
  } catch (error) {
    return handleError(res, error);
  }
};

// Delete score
exports.deleteScore = async (req, res) => {
  try {
    const score = await Scores.getById(req.params.scoreId);
    if (!score) {
      return handleError(res, new Error('Score not found'), 404);
    }

    // Verify ownership
    if (score.user_id !== req.user.userId) {
      return handleError(res, new Error('Unauthorized'), 403);
    }

    await Scores.delete(req.params.scoreId);
    return handleSuccess(res, null, 200, 'Score deleted successfully');
  } catch (error) {
    return handleError(res, error);
  }
};
