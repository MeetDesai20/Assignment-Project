/**
 * Charity Controller
 * Handles charity listings and selection
 */

const Charities = require('../models/Charity');
const { handleSuccess, handleError } = require('../utils/responseHandler');

// Get all charities
exports.getAll = async (req, res) => {
  try {
    const charities = await Charities.getAll();
    return handleSuccess(res, charities);
  } catch (error) {
    return handleError(res, error);
  }
};

// Get featured charities
exports.getFeatured = async (req, res) => {
  try {
    const charities = await Charities.getFeatured();
    return handleSuccess(res, charities);
  } catch (error) {
    return handleError(res, error);
  }
};

// Get charity by ID
exports.getById = async (req, res) => {
  try {
    const charity = await Charities.getById(req.params.charityId);
    if (!charity) {
      return handleError(res, new Error('Charity not found'), 404);
    }
    return handleSuccess(res, charity);
  } catch (error) {
    return handleError(res, error);
  }
};

// Create charity (admin)
exports.create = async (req, res) => {
  try {
    const { name, description, logoUrl, website, isFeatured } = req.body;

    const charity = await Charities.create({
      name,
      description,
      logoUrl,
      website,
      isFeatured,
    });

    return handleSuccess(res, charity, 201, 'Charity created successfully');
  } catch (error) {
    return handleError(res, error);
  }
};

// Update charity (admin)
exports.update = async (req, res) => {
  try {
    const charity = await Charities.getById(req.params.charityId);
    if (!charity) {
      return handleError(res, new Error('Charity not found'), 404);
    }

    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.description) updates.description = req.body.description;
    if (req.body.logoUrl !== undefined) updates.logo_url = req.body.logoUrl;
    if (req.body.website !== undefined) updates.website = req.body.website;
    if (req.body.isFeatured !== undefined) updates.is_featured = req.body.isFeatured;

    const updatedCharity = await Charities.update(req.params.charityId, updates);
    return handleSuccess(res, updatedCharity, 200, 'Charity updated successfully');
  } catch (error) {
    return handleError(res, error);
  }
};

// Select charity for current user
exports.select = async (req, res) => {
  try {
    const { charityId, percentage } = req.body;
    if (!charityId) {
      return handleError(res, new Error('Charity ID is required'), 400);
    }

    const selection = await Charities.selectForUser(req.user.userId, charityId, percentage || 10);
    return handleSuccess(res, selection, 200, 'Charity selected successfully');
  } catch (error) {
    return handleError(res, error);
  }
};

// Get current user's selected charity
exports.getCurrent = async (req, res) => {
  try {
    const selection = await Charities.getUserSelection(req.user.userId);
    return handleSuccess(res, selection, 200, selection ? 'Selected charity found' : 'No charity selected');
  } catch (error) {
    return handleError(res, error);
  }
};
