/**
 * Charity Model
 * Database schema for charities
 */

const { loadDb, saveDb, clone, randomUUID, nowIso } = require('../utils/localDb');
const supabase = require('../config/supabase');

const useLocalDb = process.env.USE_LOCAL_DB === 'true';
const isNoRowError = (error) => error && error.code === 'PGRST116';

const Charities = {
  /**
   * Create a new charity
   */
  async create(charityData) {
    if (!useLocalDb) {
      const payload = {
        name: charityData.name,
        description: charityData.description,
        logo_url: charityData.logoUrl || null,
        website: charityData.website || null,
        is_featured: charityData.isFeatured || false,
        is_active: true,
      };

      const { data, error } = await supabase.from('charities').insert(payload).select('*').single();
      if (error) throw error;
      return data;
    }

    const db = loadDb();
    const charity = {
      id: randomUUID(),
      name: charityData.name,
      description: charityData.description,
      logo_url: charityData.logoUrl || null,
      website: charityData.website || null,
      is_featured: charityData.isFeatured || false,
      is_active: true,
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    db.charities.push(charity);
    saveDb(db);
    return clone(charity);
  },

  /**
   * Get all charities
   */
  async getAll() {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('charities')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    const db = loadDb();
    return clone(db.charities.filter((charity) => charity.is_active).sort((a, b) => Number(b.is_featured) - Number(a.is_featured)));
  },

  /**
   * Get featured charities
   */
  async getFeatured() {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('charities')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    const db = loadDb();
    return clone(db.charities.filter((charity) => charity.is_active && charity.is_featured));
  },

  /**
   * Get charity by ID
   */
  async getById(charityId) {
    if (!useLocalDb) {
      const { data, error } = await supabase.from('charities').select('*').eq('id', charityId).maybeSingle();
      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const charity = db.charities.find((entry) => entry.id === charityId);
    return charity ? clone(charity) : null;
  },

  /**
   * Update charity
   */
  async update(charityId, updates) {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('charities')
        .update({ ...updates, updated_at: nowIso() })
        .eq('id', charityId)
        .select('*')
        .maybeSingle();

      if (error && !isNoRowError(error)) throw error;
      return data || null;
    }

    const db = loadDb();
    const charity = db.charities.find((entry) => entry.id === charityId);
    if (!charity) return null;

    Object.assign(charity, updates, { updated_at: nowIso() });
    saveDb(db);
    return clone(charity);
  },

  /**
   * Select a charity for a user
   */
  async selectForUser(userId, charityId, contributionPercentage = 10) {
    if (!useLocalDb) {
      const charity = await this.getById(charityId);
      if (!charity || !charity.is_active) {
        throw new Error('Charity not found');
      }

      const payload = {
        user_id: userId,
        charity_id: charityId,
        contribution_percentage: contributionPercentage,
        updated_at: nowIso(),
      };

      const { data, error } = await supabase
        .from('user_charities')
        .upsert(payload, { onConflict: 'user_id' })
        .select('*')
        .single();

      if (error) throw error;

      return {
        ...data,
        charity,
      };
    }

    const db = loadDb();
    const charity = db.charities.find((entry) => entry.id === charityId && entry.is_active);
    if (!charity) {
      throw new Error('Charity not found');
    }

    const existingIndex = db.user_charities.findIndex((entry) => entry.user_id === userId);
    const selection = {
      id: existingIndex >= 0 ? db.user_charities[existingIndex].id : randomUUID(),
      user_id: userId,
      charity_id: charityId,
      contribution_percentage: contributionPercentage,
      created_at: existingIndex >= 0 ? db.user_charities[existingIndex].created_at : nowIso(),
      updated_at: nowIso(),
    };

    if (existingIndex >= 0) {
      db.user_charities[existingIndex] = selection;
    } else {
      db.user_charities.push(selection);
    }

    saveDb(db);
    return clone({
      ...selection,
      charity,
    });
  },

  /**
   * Get selected charity for a user
   */
  async getUserSelection(userId) {
    if (!useLocalDb) {
      const { data, error } = await supabase
        .from('user_charities')
        .select('*, charities(*)')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && !isNoRowError(error)) throw error;
      if (!data) return null;

      const selection = {
        ...data,
        charity: data.charities || null,
      };
      delete selection.charities;
      return selection;
    }

    const db = loadDb();
    const selection = db.user_charities.find((entry) => entry.user_id === userId);
    if (!selection) return null;

    const charity = db.charities.find((entry) => entry.id === selection.charity_id) || null;
    return clone(
      charity
        ? {
            ...selection,
            charity,
          }
        : selection
    );
  },
};

module.exports = Charities;
