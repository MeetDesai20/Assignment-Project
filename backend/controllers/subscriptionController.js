/**
 * Subscription Controller
 * Handles subscription management and Razorpay integration
 */

const crypto = require('crypto');
const { validationResult } = require('express-validator');
const Subscriptions = require('../models/Subscription');
const razorpay = require('../config/razorpay');
const { handleSuccess, handleError, handleValidationError } = require('../utils/responseHandler');
const Users = require('../models/User');

const PLAN_CONFIG = {
  monthly: {
    amount: 4999,
    renewalDays: 30,
    totalCount: 120,
    planId: process.env.RAZORPAY_PLAN_ID_MONTHLY,
  },
  yearly: {
    amount: 49999,
    renewalDays: 365,
    totalCount: 10,
    planId: process.env.RAZORPAY_PLAN_ID_YEARLY,
  },
};

const buildRenewalDate = (days) => {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
};

const verifySignature = (payload, signature, secret) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return expectedSignature === signature;
};

// Get current subscription
exports.getCurrent = async (req, res) => {
  try {
    const subscription = await Subscriptions.getCurrentByUserId(req.user.userId);
    if (!subscription) {
      return handleSuccess(res, null, 200, 'No active subscription');
    }
    return handleSuccess(res, subscription);
  } catch (error) {
    return handleError(res, error);
  }
};

// Create Razorpay subscription checkout
exports.createCheckoutSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleValidationError(res, errors);
    }

    const { planType } = req.body;
    const user = await Users.findById(req.user.userId);

    if (!user) {
      return handleError(res, new Error('User not found'), 404);
    }

    const plan = PLAN_CONFIG[planType];

    if (!plan) {
      return handleError(res, new Error('Invalid plan type'), 400);
    }

    if (process.env.MOCK_RAZORPAY === 'true') {
      const subscription = await Subscriptions.create({
        userId: user.id,
        razorpaySubscriptionId: `mock_sub_${Date.now()}`,
        razorpayPaymentId: `mock_pay_${Date.now()}`,
        planType,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: buildRenewalDate(plan.renewalDays),
        renewalDate: buildRenewalDate(plan.renewalDays),
        priceAmount: plan.amount / 100,
      });

      return handleSuccess(
        res,
        {
          mock: true,
          subscription,
        },
        201,
        'Mock subscription activated'
      );
    }

    if (!plan.planId) {
      return handleError(res, new Error('Plan is not configured for checkout'), 400);
    }

    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: plan.planId,
      total_count: plan.totalCount,
      customer_notify: 1,
      quantity: 1,
      notes: {
        userId: user.id,
        planType,
        email: user.email,
      },
    });

    await Subscriptions.create({
      userId: user.id,
      razorpaySubscriptionId: razorpaySubscription.id,
      planType,
      status: 'pending',
      currentPeriodStart: null,
      currentPeriodEnd: null,
      renewalDate: buildRenewalDate(plan.renewalDays),
      priceAmount: plan.amount / 100,
    });

    return handleSuccess(
      res,
      {
        subscriptionId: razorpaySubscription.id,
        shortUrl: razorpaySubscription.short_url,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: plan.amount,
        currency: 'INR',
      },
      201,
      'Razorpay subscription created'
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// Verify Razorpay checkout signature
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpaySubscriptionId, razorpaySignature } = req.body;

    if (!razorpayPaymentId || !razorpaySubscriptionId || !razorpaySignature) {
      return handleError(res, new Error('Missing payment verification details'), 400);
    }

    const payload = `${razorpaySubscriptionId}|${razorpayPaymentId}`;
    const isValid = verifySignature(payload, razorpaySignature, process.env.RAZORPAY_KEY_SECRET);

    if (!isValid) {
      return handleError(res, new Error('Invalid payment signature'), 400);
    }

    const subscription = await Subscriptions.getByRazorpaySubscriptionId(razorpaySubscriptionId);

    if (!subscription) {
      return handleError(res, new Error('Subscription not found'), 404);
    }

    const plan = PLAN_CONFIG[subscription.plan_type] || PLAN_CONFIG.monthly;
    const updated = await Subscriptions.update(subscription.id, {
      status: 'active',
      razorpay_payment_id: razorpayPaymentId,
      current_period_start: new Date().toISOString(),
      current_period_end: buildRenewalDate(plan.renewalDays),
      renewal_date: buildRenewalDate(plan.renewalDays),
    });

    return handleSuccess(res, updated, 200, 'Payment verified successfully');
  } catch (error) {
    return handleError(res, error);
  }
};

// Cancel subscription
exports.cancel = async (req, res) => {
  try {
    const subscription = await Subscriptions.getCurrentByUserId(req.user.userId);

    if (!subscription) {
      return handleError(res, new Error('No active subscription'), 404);
    }

    if (subscription.razorpay_subscription_id) {
      await razorpay.subscriptions.cancel(subscription.razorpay_subscription_id, false);
    }

    const updated = await Subscriptions.cancel(subscription.id);

    return handleSuccess(res, updated, 200, 'Subscription cancelled');
  } catch (error) {
    return handleError(res, error);
  }
};

// Webhook handler for Razorpay events
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);

    if (!verifySignature(rawBody, signature, process.env.RAZORPAY_WEBHOOK_SECRET)) {
      return res.status(400).send('Invalid webhook signature');
    }

    const event = typeof req.body === 'object' && !Buffer.isBuffer(req.body)
      ? req.body
      : JSON.parse(rawBody);

    const subscriptionId =
      event?.payload?.subscription?.entity?.id ||
      event?.payload?.payment?.entity?.subscription_id ||
      null;

    switch (event.event) {
      case 'subscription.activated':
      case 'payment.captured': {
        if (subscriptionId) {
          const subscription = await Subscriptions.getByRazorpaySubscriptionId(subscriptionId);
          if (subscription) {
            const plan = PLAN_CONFIG[subscription.plan_type] || PLAN_CONFIG.monthly;
            await Subscriptions.update(subscription.id, {
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: buildRenewalDate(plan.renewalDays),
              renewal_date: buildRenewalDate(plan.renewalDays),
            });
          }
        }
        break;
      }

      case 'subscription.cancelled':
        if (subscriptionId) {
          const subscription = await Subscriptions.getByRazorpaySubscriptionId(subscriptionId);
          if (subscription) {
            await Subscriptions.update(subscription.id, {
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
            });
          }
        }
        break;

      case 'payment.failed':
        if (subscriptionId) {
          const subscription = await Subscriptions.getByRazorpaySubscriptionId(subscriptionId);
          if (subscription) {
            await Subscriptions.update(subscription.id, {
              status: 'expired',
            });
          }
        }
        break;

      default:
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
