const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'local-db.json');

const nowIso = () => new Date().toISOString();

const createSeedData = () => {
  const timestamp = nowIso();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  return {
    users: [
      {
        id: randomUUID(),
        email: 'demo@local.test',
        full_name: 'Demo User',
        password_hash: bcrypt.hashSync('password123', 10),
        avatar_url: null,
        role: 'user',
        is_active: true,
        created_at: timestamp,
        updated_at: timestamp,
      },
    ],
    subscriptions: [],
    scores: [],
    charities: [
      {
        id: randomUUID(),
        name: 'Community Golf Foundation',
        description: 'Helps expand access to golf for young players and local communities.',
        logo_url: null,
        website: 'https://example.com/community-golf',
        is_featured: true,
        is_active: true,
        created_at: timestamp,
        updated_at: timestamp,
      },
      {
        id: randomUUID(),
        name: 'Fairway Futures',
        description: 'Supports coaching, equipment, and mentorship for youth golf programs.',
        logo_url: null,
        website: 'https://example.com/fairway-futures',
        is_featured: false,
        is_active: true,
        created_at: timestamp,
        updated_at: timestamp,
      },
    ],
    draws: [
      {
        id: randomUUID(),
        draw_month: currentMonth,
        draw_year: currentYear,
        draw_date: timestamp,
        logic_type: 'random',
        is_published: false,
        status: 'pending',
        total_pool: 0,
        published_at: null,
        results: null,
        created_at: timestamp,
        updated_at: timestamp,
      },
    ],
    draw_results: [],
    winners: [],
    charity_contributions: [],
    user_charities: [],
  };
};

const ensureDataFile = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(createSeedData(), null, 2));
  }
};

const loadDb = () => {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
};

const saveDb = (db) => {
  ensureDataFile();
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2));
};

const clone = (value) => JSON.parse(JSON.stringify(value));

module.exports = {
  loadDb,
  saveDb,
  clone,
  randomUUID,
  nowIso,
};