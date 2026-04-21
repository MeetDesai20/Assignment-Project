/**
 * Draw Model
 * Database schema for monthly draws and results
 */

const { loadDb, saveDb, clone, randomUUID, nowIso } = require('../utils/localDb');
const supabase = require('../config/supabase');

const useLocalDb = process.env.USE_LOCAL_DB === 'true';
const isNoRowError = (error) => error && error.code === 'PGRST116';

const Draws = {
  /**
   * Create a new draw
   */
  async create(drawData) {
    if (!useLocalDb) {
      const payload = {
        draw_month: drawData.drawMonth,
        draw_year: drawData.drawYear,
        draw_date: drawData.drawDate,
        logic_type: drawData.logicType,
        is_published: false,
        status: 'pending',
        total_pool: drawData.totalPool || 0,
        published_at: null,
      };

      const { data, error } = await supabase.from('draws').insert(payload).select('*').single();
      if (error) throw error;
      return data;
    }

    const db = loadDb();
    const draw = {
      id: randomUUID(),
      draw_month: drawData.drawMonth,
      draw_year: drawData.drawYear,
      draw_date: drawData.drawDate,
      logic_type: drawData.logicType,
      is_published: false,
      status: 'pending',
      total_pool: drawData.totalPool || 0,
      published_at: null,
      results: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    db.draws.push(draw);
    saveDb(db);
    return clone(draw);
  },

  /**
   * Get all draws (latest first)
   */
  async getAll() {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('draws')
        .select('*')
        .order('draw_year', { ascending: false })
        .order('draw_month', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    const db = loadDb();
    const draws = [...db.draws].sort((a, b) => {
      if (b.draw_year !== a.draw_year) {
        return b.draw_year - a.draw_year;
      }
      return b.draw_month - a.draw_month;
    });
    return clone(draws);
  },

  /**
   * Get draw by ID
   */
  async getById(drawId) {
    if (!useLocalDb) {
      const { data, error } = await supabase.from('draws').select('*').eq('id', drawId).maybeSingle();
      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const draw = db.draws.find((entry) => entry.id === drawId);
    return draw ? clone(draw) : null;
  },

  /**
   * Get current month draw
   */
  async getCurrentDraw() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('draws')
        .select('*')
        .eq('draw_month', month)
        .eq('draw_year', year)
        .maybeSingle();

      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const draw = db.draws.find((entry) => entry.draw_month === month && entry.draw_year === year);
    return draw ? clone(draw) : null;
  },

  /**
   * Update draw details
   */
  async update(drawId, updates) {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('draws')
        .update({ ...updates, updated_at: nowIso() })
        .eq('id', drawId)
        .select('*')
        .maybeSingle();

      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const draw = db.draws.find((entry) => entry.id === drawId);
    if (!draw) return null;

    Object.assign(draw, updates, { updated_at: nowIso() });
    saveDb(db);
    return clone(draw);
  },

  /**
   * Publish draw results
   */
  async publish(drawId, results) {
    if (!useLocalDb) {
      const { data: draw, error: drawError } = await supabase
        .from('draws')
        .update({
          is_published: true,
          status: 'published',
          published_at: nowIso(),
          updated_at: nowIso(),
        })
        .eq('id', drawId)
        .select('*')
        .maybeSingle();

      if (drawError && !isNoRowError(drawError)) throw drawError;
      if (!draw) return null;

      const { error: deleteError } = await supabase.from('draw_results').delete().eq('draw_id', drawId);
      if (deleteError) throw deleteError;

      const rows = Array.isArray(results)
        ? results.map((result) => ({
            draw_id: drawId,
            match_type: String(result.match_type || result.matchType || '5'),
            winning_numbers: result.winning_numbers || result.winningNumbers || [],
            pool_share: result.pool_share || result.poolShare || 0,
          }))
        : [
            {
              draw_id: drawId,
              match_type: '5',
              winning_numbers: results?.winningNumbers || [],
              pool_share: results?.poolShare || 0,
            },
          ];

      if (rows.length > 0) {
        const { error: insertError } = await supabase.from('draw_results').insert(rows);
        if (insertError) throw insertError;
      }

      return draw;
    }

    const db = loadDb();
    const draw = db.draws.find((entry) => entry.id === drawId);
    if (!draw) return null;

    draw.is_published = true;
    draw.status = 'published';
    draw.results = results;
    draw.published_at = nowIso();
    draw.updated_at = nowIso();

    db.draw_results = db.draw_results.filter((entry) => entry.draw_id !== drawId);
    if (Array.isArray(results)) {
      results.forEach((result) => {
        db.draw_results.push({
          id: randomUUID(),
          draw_id: drawId,
          match_type: String(result.match_type || result.matchType || '5'),
          winning_numbers: result.winning_numbers || result.winningNumbers || [],
          pool_share: result.pool_share || result.poolShare || 0,
          created_at: nowIso(),
        });
      });
    } else {
      db.draw_results.push({
        id: randomUUID(),
        draw_id: drawId,
        match_type: '5',
        winning_numbers: results?.winningNumbers || [],
        pool_share: results?.poolShare || 0,
        created_at: nowIso(),
      });
    }

    saveDb(db);
    return clone(draw);
  },

  /**
   * Get draw results
   */
  async getResults(drawId) {
    if (!useLocalDb) {
      const { data, error } = await supabase.from('draw_results').select('*').eq('draw_id', drawId);
      if (error) throw error;
      return data || [];
    }

    const db = loadDb();
    return clone(db.draw_results.filter((entry) => entry.draw_id === drawId));
  },
};

module.exports = Draws;
