/**
 * User Controller
 * Handles user profile, settings, and admin user management
 */

const Users = require('../models/User');
const Subscriptions = require('../models/Subscription');
const { handleSuccess, handleError } = require('../utils/responseHandler');
const { comparePassword, hashPassword } = require('../utils/auth');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await Users.findById(req.user.userId);
    if (!user) {
      return handleError(res, new Error('User not found'), 404);
    }

    // Get subscription info
    const subscription = await Subscriptions.getCurrentByUserId(user.id);

    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      subscription: subscription ? {
        status: subscription.status,
        planType: subscription.plan_type,
        renewalDate: subscription.renewal_date,
      } : null,
    };

    return handleSuccess(res, userData);
  } catch (error) {
    return handleError(res, error);
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;

    const updatedUser = await Users.updateProfile(req.user.userId, {
      full_name: fullName,
      updated_at: new Date().toISOString(),
    });

    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.full_name,
    };

    return handleSuccess(res, userData, 200, 'Profile updated successfully');
  } catch (error) {
    return handleError(res, error);
  }
};

// Get all users (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    const search = String(req.query.search || '').trim().toLowerCase();
    const subscriptionFilter = String(req.query.subscription || '').trim().toLowerCase();
    const statusFilter = String(req.query.status || '').trim().toLowerCase();

    const requiresFullScan = !!(search || subscriptionFilter || statusFilter);
    const { users, total } = requiresFullScan
      ? await Users.getAll(10000, 0)
      : await Users.getAll(limit, offset);

    const withSubscription = await Promise.all(
      users.map(async (u) => {
        const latestSubscription = await Subscriptions.getLatestByUserId(u.id);
        const subscriptionStatus = latestSubscription?.status || 'none';
        return {
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          role: u.role,
          isActive: u.is_active,
          createdAt: u.created_at,
          subscription: {
            status: subscriptionStatus,
            planType: latestSubscription?.plan_type || null,
            renewalDate: latestSubscription?.renewal_date || null,
          },
        };
      })
    );

    const filteredUsers = withSubscription.filter((u) => {
      const searchable = `${u.fullName} ${u.email} ${u.subscription.planType || ''} ${u.subscription.status}`.toLowerCase();
      const matchesSearch = !search || searchable.includes(search);
      const matchesSubscription = !subscriptionFilter || (u.subscription.planType || '').toLowerCase() === subscriptionFilter;
      const activeStatus = u.isActive ? 'active' : 'inactive';
      const matchesStatus = !statusFilter || statusFilter === activeStatus;
      return matchesSearch && matchesSubscription && matchesStatus;
    });

    return handleSuccess(res, {
      users: filteredUsers,
      total: filteredUsers.length,
      sourceTotal: total,
      limit,
      offset,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get user by ID (admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId);
    if (!user) {
      return handleError(res, new Error('User not found'), 404);
    }

    const latestSubscription = await Subscriptions.getLatestByUserId(user.id);

    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      subscription: latestSubscription
        ? {
            status: latestSubscription.status,
            planType: latestSubscription.plan_type,
            renewalDate: latestSubscription.renewal_date,
            priceAmount: latestSubscription.price_amount,
          }
        : null,
    };

    return handleSuccess(res, userData);
  } catch (error) {
    return handleError(res, error);
  }
};

// Get admin dashboard stats
exports.getStats = async (req, res) => {
  try {
    const stats = await Users.getStats();
    return handleSuccess(res, stats);
  } catch (error) {
    return handleError(res, error);
  }
};

// Change current user password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return handleError(res, new Error('Current and new password are required'), 400);
    }

    if (String(newPassword).length < 6) {
      return handleError(res, new Error('New password must be at least 6 characters'), 400);
    }

    const user = await Users.findById(req.user.userId);
    if (!user) {
      return handleError(res, new Error('User not found'), 404);
    }

    const isValid = await comparePassword(currentPassword, user.password_hash);
    if (!isValid) {
      return handleError(res, new Error('Current password is incorrect'), 400);
    }

    const nextHash = await hashPassword(newPassword);
    await Users.updatePassword(user.id, nextHash);

    return handleSuccess(res, null, 200, 'Password changed successfully');
  } catch (error) {
    return handleError(res, error);
  }
};
