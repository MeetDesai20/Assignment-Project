/**
 * Subscription Model
 * Database schema for subscriptions
 */

const { loadDb, saveDb, clone, randomUUID, nowIso } = require('../utils/localDb');
const supabase = require('../config/supabase');

const useLocalDb = process.env.USE_LOCAL_DB === 'true';
const isNoRowError = (error) => error && error.code === 'PGRST116';

const Subscriptions = {
  /**
   * Create a new subscription
   */
  async create(subscriptionData) {
    if (!useLocalDb) {
      const payload = {
        user_id: subscriptionData.userId,
        razorpay_customer_id: subscriptionData.razorpayCustomerId || null,
        razorpay_subscription_id: subscriptionData.razorpaySubscriptionId || null,
        razorpay_payment_id: subscriptionData.razorpayPaymentId || null,
        plan_type: subscriptionData.planType,
        status: subscriptionData.status,
        current_period_start: subscriptionData.currentPeriodStart,
        current_period_end: subscriptionData.currentPeriodEnd,
        renewal_date: subscriptionData.renewalDate,
        price_amount: subscriptionData.priceAmount,
        cancelled_at: null,
      };

      const { data, error } = await supabase.from('subscriptions').insert(payload).select('*').single();
      if (error) throw error;
      return data;
    }

    const db = loadDb();
    const subscription = {
      id: randomUUID(),
      user_id: subscriptionData.userId,
      razorpay_customer_id: subscriptionData.razorpayCustomerId || null,
      razorpay_subscription_id: subscriptionData.razorpaySubscriptionId || null,
      razorpay_payment_id: subscriptionData.razorpayPaymentId || null,
      plan_type: subscriptionData.planType,
      status: subscriptionData.status,
      current_period_start: subscriptionData.currentPeriodStart,
      current_period_end: subscriptionData.currentPeriodEnd,
      renewal_date: subscriptionData.renewalDate,
      price_amount: subscriptionData.priceAmount,
      cancelled_at: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    db.subscriptions.push(subscription);
    saveDb(db);
    return clone(subscription);
  },

  /**
   * Get current subscription
   */
  async getCurrentByUserId(userId) {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const subscription = db.subscriptions
      .filter((entry) => entry.user_id === userId && entry.status === 'active')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    return subscription ? clone(subscription) : null;
  },

  /**
   * Get latest subscription by user ID regardless of status
   */
  async getLatestByUserId(userId) {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const subscription = db.subscriptions
      .filter((entry) => entry.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    return subscription ? clone(subscription) : null;
  },

  /**
   * Update subscription
   */
  async update(subscriptionId, updates) {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ ...updates, updated_at: nowIso() })
        .eq('id', subscriptionId)
        .select('*')
        .maybeSingle();

      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const subscription = db.subscriptions.find((entry) => entry.id === subscriptionId);
    if (!subscription) return null;

    Object.assign(subscription, updates, { updated_at: nowIso() });
    saveDb(db);
    return clone(subscription);
  },

  /**
   * Cancel subscription
   */
  async cancel(subscriptionId) {
    return this.update(subscriptionId, {
      status: 'cancelled',
      cancelled_at: nowIso(),
    });
  },

  /**
   * Get subscription by Razorpay subscription ID
   */
  async getByRazorpaySubscriptionId(razorpaySubscriptionId) {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('razorpay_subscription_id', razorpaySubscriptionId)
        .maybeSingle();

      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const subscription = db.subscriptions.find((entry) => entry.razorpay_subscription_id === razorpaySubscriptionId);
    return subscription ? clone(subscription) : null;
  },
};

module.exports = Subscriptions;
