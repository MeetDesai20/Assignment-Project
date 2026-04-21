const express = require('express');
const { body } = require('express-validator');
const subscriptionController = require('../../controllers/subscriptionController');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

/**
 * GET /api/subscriptions/current
 * Get current subscription
 */
router.get('/current', authenticate, subscriptionController.getCurrent);

/**
 * POST /api/subscriptions/checkout
 * Create Razorpay subscription checkout
 */
router.post('/checkout', authenticate, [
  body('planType').isIn(['monthly', 'yearly']).withMessage('Invalid plan type'),
], subscriptionController.createCheckoutSession);

/**
 * POST /api/subscriptions/verify
 * Verify Razorpay checkout payment signature
 */
router.post('/verify', authenticate, [
  body('razorpayPaymentId').notEmpty().withMessage('Payment ID is required'),
  body('razorpaySubscriptionId').notEmpty().withMessage('Subscription ID is required'),
  body('razorpaySignature').notEmpty().withMessage('Signature is required'),
], subscriptionController.verifyPayment);

/**
 * POST /api/subscriptions/cancel
 * Cancel subscription
 */
router.post('/cancel', authenticate, subscriptionController.cancel);

module.exports = router;
