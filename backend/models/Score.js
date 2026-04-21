/**
 * Golf Score Model
 * Database schema for golf scores (5-score rolling system)
 */

const { loadDb, saveDb, clone, randomUUID, nowIso } = require('../utils/localDb');
const supabase = require('../config/supabase');

const useLocalDb = process.env.USE_LOCAL_DB === 'true';
const isNoRowError = (error) => error && error.code === 'PGRST116';

const Scores = {
  /**
   * Add a new score
   * Automatically removes oldest score if user has 5 scores
   */
  async addScore(scoreData) {
    if (!useLocalDb) {
      const { data: existing, error: existingError } = await supabase
        .from('scores')
        .select('id')
        .eq('user_id', scoreData.userId)
        .eq('score_date', scoreData.scoreDate)
        .maybeSingle();

      if (existingError && !isNoRowError(existingError)) throw existingError;
      if (existing) {
        throw new Error('Score for this date already exists. Please edit or delete the existing score.');
      }

      const { data: userScores, error: listError } = await supabase
        .from('scores')
        .select('id, created_at')
        .eq('user_id', scoreData.userId)
        .order('created_at', { ascending: true });

      if (listError) throw listError;

      if ((userScores || []).length >= 5) {
        const oldestScore = userScores[0];
        const { error: deleteError } = await supabase.from('scores').delete().eq('id', oldestScore.id);
        if (deleteError) throw deleteError;
      }

      const payload = {
        user_id: scoreData.userId,
        score_value: scoreData.scoreValue,
        score_date: scoreData.scoreDate,
        course: scoreData.course || null,
        holes: scoreData.holes || 18,
        stableford_points: scoreData.stablefordPoints || 0,
      };

      const { data, error } = await supabase.from('scores').insert(payload).select('*').single();
      if (error) throw error;
      return data;
    }

    const db = loadDb();
    const existing = db.scores.find((entry) => entry.user_id === scoreData.userId && entry.score_date === scoreData.scoreDate);

    if (existing) {
      throw new Error('Score for this date already exists. Please edit or delete the existing score.');
    }

    const scores = db.scores.filter((entry) => entry.user_id === scoreData.userId).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    if (scores.length >= 5) {
      const oldestScore = scores[0];
      db.scores = db.scores.filter((entry) => entry.id !== oldestScore.id);
    }

    const score = {
      id: randomUUID(),
      user_id: scoreData.userId,
      score_value: scoreData.scoreValue,
      score_date: scoreData.scoreDate,
      course: scoreData.course || null,
      holes: scoreData.holes || 18,
      stableford_points: scoreData.stablefordPoints || 0,
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    db.scores.push(score);
    saveDb(db);
    return clone(score);
  },

  /**
   * Get last 5 scores for user
   */
  async getLastFive(userId) {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .order('score_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    }

    const db = loadDb();
    const scores = db.scores
      .filter((entry) => entry.user_id === userId)
      .sort((a, b) => new Date(b.score_date) - new Date(a.score_date))
      .slice(0, 5);

    return clone(scores);
  },

  /**
   * Get score by ID
   */
  async getById(scoreId) {
    if (!useLocalDb) {
      const { data, error } = await supabase.from('scores').select('*').eq('id', scoreId).maybeSingle();
      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const score = db.scores.find((entry) => entry.id === scoreId);
    return score ? clone(score) : null;
  },

  /**
   * Update score
   */
  async update(scoreId, updates) {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('scores')
        .update({ ...updates, updated_at: nowIso() })
        .eq('id', scoreId)
        .select('*')
        .maybeSingle();

      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const score = db.scores.find((entry) => entry.id === scoreId);
    if (!score) return null;

    Object.assign(score, updates, { updated_at: nowIso() });
    saveDb(db);
    return clone(score);
  },

  /**
   * Delete score
   */
  async delete(scoreId) {
    if (!useLocalDb) {
      const { error } = await supabase.from('scores').delete().eq('id', scoreId);
      if (error) throw error;
      return true;
    }

    const db = loadDb();
    db.scores = db.scores.filter((entry) => entry.id !== scoreId);
    saveDb(db);
    return true;
  },
};

module.exports = Scores;
