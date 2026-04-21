/**
 * User Model
 * Database schema for users table
 */

const { loadDb, saveDb, clone, randomUUID, nowIso } = require('../utils/localDb');
const supabase = require('../config/supabase');

const useLocalDb = process.env.USE_LOCAL_DB === 'true';
const isNoRowError = (error) => error && error.code === 'PGRST116';

const Users = {
  /**
   * Create a new user
   */
  async create(userData) {
    if (!useLocalDb) {
      const payload = {
        email: userData.email,
        full_name: userData.fullName,
        password_hash: userData.passwordHash,
        avatar_url: null,
        role: userData.role || 'user',
        is_active: true,
      };

      const { data, error } = await supabase.from('users').insert(payload).select('*').single();
      if (error) throw error;
      return data;
    }

    const db = loadDb();
    const user = {
      id: randomUUID(),
      email: userData.email,
      full_name: userData.fullName,
      password_hash: userData.passwordHash,
      avatar_url: null,
      role: userData.role || 'user',
      is_active: true,
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    db.users.push(user);
    saveDb(db);
    return clone(user);
  },

  /**
   * Find user by email
   */
  async findByEmail(email) {
    if (!useLocalDb) {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const user = db.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());
    return user ? clone(user) : null;
  },

  /**
   * Find user by ID
   */
  async findById(userId) {
    if (!useLocalDb) {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const user = db.users.find((entry) => entry.id === userId);
    return user ? clone(user) : null;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: nowIso() })
        .eq('id', userId)
        .select('*')
        .maybeSingle();

      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const user = db.users.find((entry) => entry.id === userId);
    if (!user) return null;

    Object.assign(user, updates, { updated_at: nowIso() });
    saveDb(db);
    return clone(user);
  },

  /**
   * Update user password hash
   */
  async updatePassword(userId, passwordHash) {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('users')
        .update({ password_hash: passwordHash, updated_at: nowIso() })
        .eq('id', userId)
        .select('*')
        .maybeSingle();

      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const user = db.users.find((entry) => entry.id === userId);
    if (!user) return null;

    user.password_hash = passwordHash;
    user.updated_at = nowIso();
    saveDb(db);
    return clone(user);
  },

  /**
   * Get all users (admin)
   */
  async getAll(limit = 50, offset = 0) {
    if (!useLocalDb) {
      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { users: data || [], total: count || 0 };
    }

    const db = loadDb();
    const users = db.users.slice(offset, offset + limit);
    return { users: clone(users), total: db.users.length };
  },

  /**
   * Get admin dashboard stats
   */
  async getStats() {
    if (!useLocalDb) {
      const [{ count: totalUsers, error: usersError }, { count: activeSubscriptions, error: subsError }, { data: contributions, error: contributionsError }, { data: draws, error: drawsError }] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('charity_contributions').select('amount'),
        supabase.from('draws').select('total_pool'),
      ]);

      if (usersError) throw usersError;
      if (subsError) throw subsError;
      if (contributionsError) throw contributionsError;
      if (drawsError) throw drawsError;

      const charityContributions = (contributions || []).reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
      const poolSize = (draws || []).reduce((sum, entry) => sum + Number(entry.total_pool || 0), 0);

      return {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        poolSize,
        charityContributions,
      };
    }

    const db = loadDb();
    const activeSubscriptions = db.subscriptions.filter((entry) => entry.status === 'active').length;
    const charityContributions = db.charity_contributions.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const poolSize = db.draws.reduce((sum, entry) => sum + Number(entry.total_pool || 0), 0);

    return {
      totalUsers: db.users.length,
      activeSubscriptions,
      poolSize,
      charityContributions,
    };
  },
};

module.exports = Users;
