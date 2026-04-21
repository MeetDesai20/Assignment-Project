/**
 * Draw Controller
 * Handles draw management and simulation
 */

const Draws = require('../models/Draw');
const { handleSuccess, handleError } = require('../utils/responseHandler');
const { generateReference } = require('../utils/auth');

/**
 * Random number generation for draws
 */
const generateRandomNumbers = () => {
  const numbers = [];
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
};

// Get current draw
exports.getCurrentDraw = async (req, res) => {
  try {
    const draw = await Draws.getCurrentDraw();
    if (!draw) {
      return handleSuccess(res, null, 200, 'No current draw found');
    }
    return handleSuccess(res, draw);
  } catch (error) {
    return handleError(res, error);
  }
};

// Get all draws (admin)
exports.getAll = async (req, res) => {
  try {
    const draws = await Draws.getAll();
    return handleSuccess(res, draws);
  } catch (error) {
    return handleError(res, error);
  }
};

// Create draw (admin)
exports.create = async (req, res) => {
  try {
    const { drawMonth, drawYear, logicType } = req.body;

    if (!drawMonth || !drawYear) {
      return handleError(res, new Error('Month and year are required'), 400);
    }

    const existing = (await Draws.getAll()).find(
      (entry) => entry.draw_month === Number(drawMonth) && entry.draw_year === Number(drawYear)
    );
    if (existing) {
      return handleError(res, new Error('Draw already exists for this month and year'), 400);
    }

    const draw = await Draws.create({
      drawMonth,
      drawYear,
      drawDate: new Date().toISOString(),
      logicType: logicType || 'random',
      totalPool: 0,
    });

    return handleSuccess(res, draw, 201, 'Draw created successfully');
  } catch (error) {
    return handleError(res, error);
  }
};

// Update draw (admin)
exports.update = async (req, res) => {
  try {
    const { drawId } = req.params;
    const draw = await Draws.getById(drawId);
    if (!draw) {
      return handleError(res, new Error('Draw not found'), 404);
    }

    const updates = {};
    if (req.body.drawMonth !== undefined) updates.draw_month = Number(req.body.drawMonth);
    if (req.body.drawYear !== undefined) updates.draw_year = Number(req.body.drawYear);
    if (req.body.logicType !== undefined) updates.logic_type = req.body.logicType;
    if (req.body.totalPool !== undefined) updates.total_pool = Number(req.body.totalPool) || 0;
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.drawDate !== undefined) updates.draw_date = req.body.drawDate;

    if (updates.draw_month !== undefined || updates.draw_year !== undefined) {
      const month = updates.draw_month !== undefined ? updates.draw_month : draw.draw_month;
      const year = updates.draw_year !== undefined ? updates.draw_year : draw.draw_year;
      const existing = (await Draws.getAll()).find(
        (entry) => entry.id !== drawId && entry.draw_month === Number(month) && entry.draw_year === Number(year)
      );
      if (existing) {
        return handleError(res, new Error('Another draw already exists for this month and year'), 400);
      }
    }

    const updatedDraw = await Draws.update(drawId, updates);
    return handleSuccess(res, updatedDraw, 200, 'Draw updated successfully');
  } catch (error) {
    return handleError(res, error);
  }
};

// Simulate draw (admin)
exports.simulate = async (req, res) => {
  try {
    const draw = await Draws.getCurrentDraw();
    if (!draw) {
      return handleError(res, new Error('No current draw found'), 404);
    }

    // Generate winning numbers
    const winningNumbers = generateRandomNumbers();

    // TODO: Calculate winners based on user scores
    // This would involve:
    // 1. Fetch all active users with scores in current period
    // 2. Check each user's latest 5 scores
    // 3. Compare with winning numbers
    // 4. Create draw results

    return handleSuccess(res, {
      drawId: draw.id,
      winningNumbers,
      simulatedAt: new Date().toISOString(),
    }, 200, 'Draw simulation completed');
  } catch (error) {
    return handleError(res, error);
  }
};

// Publish draw results (admin)
exports.publish = async (req, res) => {
  try {
    const draw = await Draws.getCurrentDraw();
    if (!draw) {
      return handleError(res, new Error('No current draw found'), 404);
    }

    if (draw.is_published) {
      return handleError(res, new Error('Draw already published'), 400);
    }

    const results = {
      winningNumbers: generateRandomNumbers(),
      publishedAt: new Date().toISOString(),
    };

    const publishedDraw = await Draws.publish(draw.id, results);
    return handleSuccess(res, publishedDraw, 200, 'Draw published successfully');
  } catch (error) {
    return handleError(res, error);
  }
};

// Get draw results
exports.getResults = async (req, res) => {
  try {
    const results = await Draws.getResults(req.params.drawId);
    return handleSuccess(res, results);
  } catch (error) {
    return handleError(res, error);
  }
};
