/**
 * Winner Model
 * Database schema for draw winners and verification
 */

const { loadDb, saveDb, clone, randomUUID, nowIso } = require('../utils/localDb');
const supabase = require('../config/supabase');

const useLocalDb = process.env.USE_LOCAL_DB === 'true';
const isNoRowError = (error) => error && error.code === 'PGRST116';

const Winners = {
  /**
   * Create winner entry
   */
  async create(winnerData) {
    if (!useLocalDb) {
      const payload = {
        draw_id: winnerData.drawId,
        user_id: winnerData.userId,
        match_type: winnerData.matchType,
        prize_amount: winnerData.prizeAmount,
        status: 'pending',
        proof_url: null,
        submitted_at: null,
        verified_at: null,
        paid_at: null,
      };

      const { data, error } = await supabase.from('winners').insert(payload).select('*').single();
      if (error) throw error;
      return data;
    }

    const db = loadDb();
    const winner = {
      id: randomUUID(),
      draw_id: winnerData.drawId,
      user_id: winnerData.userId,
      match_type: winnerData.matchType,
      prize_amount: winnerData.prizeAmount,
      status: 'pending',
      proof_url: null,
      submitted_at: null,
      verified_at: null,
      paid_at: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    db.winners.push(winner);
    saveDb(db);
    return clone(winner);
  },

  /**
   * Submit proof for verification
   */
  async submitProof(winnerId, proofUrl) {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('winners')
        .update({
          proof_url: proofUrl,
          status: 'verification_pending',
          submitted_at: nowIso(),
          updated_at: nowIso(),
        })
        .eq('id', winnerId)
        .select('*')
        .maybeSingle();

      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const winner = db.winners.find((entry) => entry.id === winnerId);
    if (!winner) return null;

    Object.assign(winner, {
      proof_url: proofUrl,
      status: 'verification_pending',
      submitted_at: nowIso(),
      updated_at: nowIso(),
    });
    saveDb(db);
    return clone(winner);
  },

  /**
   * Verify winner (admin)
   */
  async verify(winnerId, isVerified) {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('winners')
        .update({
          status: isVerified ? 'verified' : 'rejected',
          verified_at: nowIso(),
          updated_at: nowIso(),
        })
        .eq('id', winnerId)
        .select('*')
        .maybeSingle();

      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const winner = db.winners.find((entry) => entry.id === winnerId);
    if (!winner) return null;

    Object.assign(winner, {
      status: isVerified ? 'verified' : 'rejected',
      verified_at: nowIso(),
      updated_at: nowIso(),
    });
    saveDb(db);
    return clone(winner);
  },

  /**
   * Mark as paid
   */
  async markAsPaid(winnerId) {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('winners')
        .update({
          status: 'paid',
          paid_at: nowIso(),
          updated_at: nowIso(),
        })
        .eq('id', winnerId)
        .select('*')
        .maybeSingle();

      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const winner = db.winners.find((entry) => entry.id === winnerId);
    if (!winner) return null;

    Object.assign(winner, {
      status: 'paid',
      paid_at: nowIso(),
      updated_at: nowIso(),
    });
    saveDb(db);
    return clone(winner);
  },

  /**
   * Get pending verifications (admin)
   */
  async getPendingVerifications() {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('winners')
        .select('*, users(email, full_name)')
        .eq('status', 'verification_pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    const db = loadDb();
    return clone(
      db.winners
        .filter((winner) => winner.status === 'verification_pending')
        .map((winner) => {
          const user = db.users.find((entry) => entry.id === winner.user_id);
          return {
            ...winner,
            users: user ? { email: user.email, full_name: user.full_name } : null,
          };
        })
    );
  },

  /**
   * Get user's winnings
   */
  async getUserWinnings(userId) {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('winners')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    const db = loadDb();
    return clone(
      db.winners
        .filter((winner) => winner.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    );
  },
};

module.exports = Winners;
