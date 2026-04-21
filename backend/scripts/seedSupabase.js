require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function upsertUser(email, fullName, password, role) {
  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        email,
        full_name: fullName,
        password_hash: passwordHash,
        role,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function ensureCharity(charity) {
  const { data: existing, error: fetchError } = await supabase
    .from('charities')
    .select('*')
    .eq('name', charity.name)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
  if (existing) return existing;

  const { data, error } = await supabase.from('charities').insert(charity).select('*').single();
  if (error) throw error;
  return data;
}

async function seed() {
  console.log('Seeding Supabase data...');

  const admin = await upsertUser('admin@system.com', 'System Admin', 'admin123', 'admin');
  const demoUser = await upsertUser('user1@example.com', 'Demo Golfer', 'password123', 'user');

  const charityA = await ensureCharity({
    name: 'Community Golf Foundation',
    description: 'Helps expand access to golf for young players and local communities.',
    website: 'https://example.com/community-golf',
    logo_url: null,
    is_featured: true,
    is_active: true,
  });

  await ensureCharity({
    name: 'Fairway Futures',
    description: 'Supports coaching, equipment, and mentorship for youth golf programs.',
    website: 'https://example.com/fairway-futures',
    logo_url: null,
    is_featured: false,
    is_active: true,
  });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { error: drawError } = await supabase.from('draws').upsert(
    {
      draw_month: currentMonth,
      draw_year: currentYear,
      draw_date: now.toISOString().slice(0, 10),
      logic_type: 'random',
      is_published: false,
      status: 'pending',
      total_pool: 15000,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'draw_month,draw_year' }
  );
  if (drawError) throw drawError;

  const { error: userCharityError } = await supabase.from('user_charities').upsert(
    {
      user_id: demoUser.id,
      charity_id: charityA.id,
      contribution_percentage: 10,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
  if (userCharityError) throw userCharityError;

  const scoreDates = [0, 1, 2].map((d) => {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    return date.toISOString().slice(0, 10);
  });

  for (const [idx, scoreDate] of scoreDates.entries()) {
    const { data: existingScore, error: findScoreError } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', demoUser.id)
      .eq('score_date', scoreDate)
      .maybeSingle();

    if (findScoreError && findScoreError.code !== 'PGRST116') throw findScoreError;
    if (existingScore) continue;

    const { error: insertScoreError } = await supabase.from('scores').insert({
      user_id: demoUser.id,
      score_value: 22 + idx,
      score_date: scoreDate,
      course: 'Riverside Golf Club',
      holes: 18,
      stableford_points: 30 + idx,
    });

    if (insertScoreError) throw insertScoreError;
  }

  console.log('Seed complete.');
  console.log('Admin login: admin@system.com / admin123');
  console.log('Demo login: user1@example.com / password123');
  console.log({
    adminId: admin.id,
    demoUserId: demoUser.id,
    charityId: charityA.id,
    draw: `${currentMonth}/${currentYear}`,
  });
}

seed().catch((error) => {
  console.error('Seed failed:', error.message || error);
  process.exit(1);
});
