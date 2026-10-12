import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { User, GolfScore, Charity, Draw, Winner } from '@/types';
import { INITIAL_CHARITIES } from './mockData';

// ==============================================================================
// DIGITAL HEROES - SQLite HIGH PERFORMANCE PERSISTENT ENGINE
// Powered by better-sqlite3 with WAL Mode Enabled
// ==============================================================================

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'database.sqlite');

let sqliteDbInstance: InstanceType<typeof Database> | null = null;

export function getDb(): InstanceType<typeof Database> {
  if (sqliteDbInstance) return sqliteDbInstance;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);
  
  // Enable WAL (Write-Ahead Logging) mode for concurrent read/write performance
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  // 1. USERS TABLE
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'subscriber',
      subscription_status TEXT NOT NULL DEFAULT 'active',
      billing_cycle TEXT NOT NULL DEFAULT 'monthly',
      subscription_start_date TEXT,
      subscription_renewal_date TEXT,
      charity_id TEXT DEFAULT 'charity-1',
      charity_contribution_pct INTEGER DEFAULT 15,
      handicap REAL DEFAULT 15.0,
      home_club TEXT DEFAULT 'City Links Club',
      created_at TEXT NOT NULL
    );
  `);

  // 2. CHARITIES TABLE
  db.exec(`
    CREATE TABLE IF NOT EXISTS charities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      impact_story TEXT NOT NULL,
      image_url TEXT NOT NULL,
      website_url TEXT NOT NULL,
      is_spotlight INTEGER DEFAULT 0,
      total_raised REAL DEFAULT 0.0,
      supporter_count INTEGER DEFAULT 0,
      upcoming_events TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 3. GOLF SCORES TABLE
  db.exec(`
    CREATE TABLE IF NOT EXISTS golf_scores (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      date TEXT NOT NULL,
      course_name TEXT DEFAULT 'Local Course',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      UNIQUE(user_id, date)
    );
    CREATE INDEX IF NOT EXISTS idx_scores_user_date ON golf_scores(user_id, date DESC);
  `);

  // 4. DRAWS TABLE
  db.exec(`
    CREATE TABLE IF NOT EXISTS draws (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      month_year TEXT UNIQUE NOT NULL,
      draw_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      draw_logic TEXT NOT NULL DEFAULT 'algorithmic',
      winning_numbers TEXT DEFAULT '[]',
      total_prize_pool REAL DEFAULT 0.0,
      jackpot_pool REAL DEFAULT 0.0,
      tier4_pool REAL DEFAULT 0.0,
      tier3_pool REAL DEFAULT 0.0,
      rollover_from_previous REAL DEFAULT 0.0,
      rollover_to_next REAL DEFAULT 0.0,
      total_subscribers_entered INTEGER DEFAULT 0,
      published_at TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 5. WINNERS TABLE
  db.exec(`
    CREATE TABLE IF NOT EXISTS winners (
      id TEXT PRIMARY KEY,
      draw_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      match_type TEXT NOT NULL,
      matched_numbers TEXT NOT NULL,
      user_scores_at_draw TEXT NOT NULL,
      prize_amount REAL NOT NULL,
      verification_status TEXT DEFAULT 'pending',
      proof_image_url TEXT,
      proof_uploaded_at TEXT,
      payment_status TEXT DEFAULT 'pending',
      paid_at TEXT,
      admin_notes TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 6. ACTIVITIES TABLE
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      email TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT DEFAULT '',
      ip_address TEXT DEFAULT '127.0.0.1',
      timestamp TEXT NOT NULL
    );
  `);

  // 7. AUDIT LOGS TABLE
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      admin_name TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      ip_address TEXT DEFAULT '127.0.0.1',
      timestamp TEXT NOT NULL
    );
  `);

  // SEED INITIAL ADMIN ACCOUNTS IF MISSING
  seedInitialData(db);

  sqliteDbInstance = db;
  return sqliteDbInstance;
}

const INITIAL_ADMIN_ACCOUNTS = [
  {
    id: 'admin-mokshith',
    name: 'Mokshith P',
    email: 'mokshithp@gmail.com',
    pass: '16421642',
  },
  {
    id: 'admin-mokshith1642',
    name: 'Mokshith P 1642',
    email: 'mokshithp1642@gmail.com',
    pass: '16421642',
  },
  {
    id: 'admin-digitalheroes',
    name: 'Digital Heroes Admin',
    email: 'digital heroes@gmail.com',
    pass: 'Digiital Password12345',
  },
  {
    id: 'admin-digitalheroes-clean',
    name: 'Digital Heroes Admin',
    email: 'digitalheroes@gmail.com',
    pass: 'Digiital Password12345',
  },
];

function seedInitialData(db: InstanceType<typeof Database>) {
  const now = new Date().toISOString();
  const renewal = new Date(Date.now() + 365 * 86400000).toISOString();

  // Seed Admins
  const insertUserStmt = db.prepare(`
    INSERT OR IGNORE INTO users (
      id, name, email, password_hash, role, subscription_status, billing_cycle,
      subscription_start_date, subscription_renewal_date, charity_id, charity_contribution_pct, handicap, home_club, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const adm of INITIAL_ADMIN_ACCOUNTS) {
    const cleanEmail = adm.email.toLowerCase();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(adm.pass, salt);

    insertUserStmt.run(
      adm.id,
      adm.name,
      cleanEmail,
      hash,
      'admin',
      'active',
      'yearly',
      now,
      renewal,
      'charity-1',
      25,
      4.0,
      'Royal Club',
      now
    );
  }

  // Seed Initial Charities if table is empty
  const charityCount = db.prepare('SELECT COUNT(*) AS count FROM charities').get() as { count: number };
  if (charityCount.count === 0) {
    const insertCharityStmt = db.prepare(`
      INSERT INTO charities (
        id, name, tagline, category, description, impact_story, image_url, website_url, is_spotlight, total_raised, supporter_count, upcoming_events, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const c of INITIAL_CHARITIES) {
      insertCharityStmt.run(
        c.id,
        c.name,
        c.tagline,
        c.category,
        c.description,
        c.impactStory,
        c.imageUrl,
        c.websiteUrl,
        c.isSpotlight ? 1 : 0,
        c.totalRaised || 0,
        c.supporterCount || 0,
        JSON.stringify(c.upcomingEvents || []),
        now
      );
    }
  }

  // Seed Default Draws if table is empty
  const drawCount = db.prepare('SELECT COUNT(*) AS count FROM draws').get() as { count: number };
  if (drawCount.count === 0) {
    const insertDrawStmt = db.prepare(`
      INSERT INTO draws (
        id, name, month_year, draw_date, status, draw_logic, winning_numbers,
        total_prize_pool, jackpot_pool, tier4_pool, tier3_pool, rollover_from_previous, rollover_to_next, total_subscribers_entered, published_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDrawStmt.run(
      'draw-current-championship',
      'Official Monthly Championship Draw',
      '2026-09',
      new Date(Date.now() + 7 * 86400000).toISOString(),
      'scheduled',
      'algorithmic',
      JSON.stringify([]),
      50000,
      40700,
      16975,
      12125,
      21300,
      0,
      2380,
      null,
      now
    );

    insertDrawStmt.run(
      'draw-prev-championship',
      'August Championship Draw',
      '2026-08',
      new Date(Date.now() - 25 * 86400000).toISOString(),
      'published',
      'algorithmic',
      JSON.stringify([7, 14, 21, 35, 42]),
      50000,
      40700,
      16975,
      12125,
      19400,
      40700,
      2310,
      new Date(Date.now() - 25 * 86400000).toISOString(),
      now
    );
  }
}

// ----------------- USER OPERATIONS -----------------

function mapUserRow(row: any): User & { password_hash: string } {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password_hash: row.password_hash,
    role: row.role as any,
    subscriptionStatus: row.subscription_status as any,
    billingCycle: row.billing_cycle as any,
    subscriptionStartDate: row.subscription_start_date,
    subscriptionRenewalDate: row.subscription_renewal_date,
    charityId: row.charity_id,
    charityContributionPct: row.charity_contribution_pct,
    handicap: row.handicap,
    homeClub: row.home_club,
    createdAt: row.created_at,
  };
}

export function dbGetUserByEmail(email: string): (User & { password_hash: string }) | null {
  const db = getDb();
  const cleanEmail = email.trim().toLowerCase();
  const strippedEmail = cleanEmail.replace(/\s+/g, '');

  const row = db.prepare(`
    SELECT * FROM users 
    WHERE LOWER(email) = ? OR LOWER(REPLACE(email, ' ', '')) = ? OR LOWER(name) = ?
  `).get(cleanEmail, strippedEmail, cleanEmail) as any;

  if (!row) return null;
  return mapUserRow(row);
}

export function dbGetUserById(id: string): User | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!row) return null;
  const { password_hash, ...user } = mapUserRow(row);
  return user;
}

export function dbEnsureUserExists(user: Partial<User> & { id: string; email: string; name?: string }): User {
  const existing = dbGetUserById(user.id) || dbGetUserByEmail(user.email);
  if (existing) return existing;

  const db = getDb();
  const now = new Date().toISOString();
  const renewalDate = new Date(Date.now() + 30 * 86400000).toISOString();
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('defaultPass123', salt);

  const cleanEmail = user.email.trim().toLowerCase();
  const cleanName = (user.name || user.email.split('@')[0]).trim();

  db.prepare(`
    INSERT INTO users (
      id, name, email, password_hash, role, subscription_status, billing_cycle,
      subscription_start_date, subscription_renewal_date, charity_id, charity_contribution_pct, handicap, home_club, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    user.id,
    cleanName,
    cleanEmail,
    hash,
    user.role || 'subscriber',
    user.subscriptionStatus || 'active',
    user.billingCycle || 'monthly',
    now,
    renewalDate,
    user.charityId || 'charity-1',
    user.charityContributionPct || 15,
    user.handicap || 15.0,
    user.homeClub || 'City Links Club',
    now
  );

  return dbGetUserById(user.id)!;
}

export function dbCreateUser(
  name: string,
  email: string,
  passwordHash: string,
  billingCycle: 'monthly' | 'yearly' = 'monthly',
  charityId: string = 'charity-1',
  charityContributionPct: number = 15
): User {
  const db = getDb();
  const cleanEmail = email.trim().toLowerCase();
  const id = `user-${Date.now()}`;
  const now = new Date().toISOString();
  const renewalDate = new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 86400000).toISOString();

  db.prepare(`
    INSERT INTO users (
      id, name, email, password_hash, role, subscription_status, billing_cycle,
      subscription_start_date, subscription_renewal_date, charity_id, charity_contribution_pct, handicap, home_club, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    name.trim(),
    cleanEmail,
    passwordHash,
    'subscriber',
    'active',
    billingCycle,
    now,
    renewalDate,
    charityId,
    Math.max(10, charityContributionPct),
    15.0,
    'City Links Club',
    now
  );

  dbRecordActivity(id, name.trim(), cleanEmail, 'SIGNUP', `Registered with ${billingCycle} plan`);
  return dbGetUserById(id)!;
}

export function dbUpdateUser(user: Partial<User> & { id?: string; email?: string }): User | null {
  const existing = (user.id ? dbGetUserById(user.id) : null) || (user.email ? dbGetUserByEmail(user.email) : null);
  if (!existing) return null;

  const db = getDb();
  const targetId = existing.id;

  const updatedName = user.name !== undefined ? user.name : existing.name;
  const updatedEmail = user.email !== undefined ? user.email.trim().toLowerCase() : existing.email;
  const updatedStatus = user.subscriptionStatus !== undefined ? user.subscriptionStatus : existing.subscriptionStatus;
  const updatedCycle = user.billingCycle !== undefined ? user.billingCycle : existing.billingCycle;
  const updatedRenewal = user.subscriptionRenewalDate !== undefined ? user.subscriptionRenewalDate : existing.subscriptionRenewalDate;
  const updatedCharity = user.charityId !== undefined ? user.charityId : existing.charityId;
  const updatedPct = user.charityContributionPct !== undefined ? user.charityContributionPct : existing.charityContributionPct;
  const updatedHandicap = user.handicap !== undefined ? user.handicap : existing.handicap;
  const updatedClub = user.homeClub !== undefined ? user.homeClub : existing.homeClub;

  db.prepare(`
    UPDATE users SET
      name = ?, email = ?, subscription_status = ?, billing_cycle = ?, subscription_renewal_date = ?,
      charity_id = ?, charity_contribution_pct = ?, handicap = ?, home_club = ?
    WHERE id = ?
  `).run(
    updatedName,
    updatedEmail,
    updatedStatus,
    updatedCycle,
    updatedRenewal,
    updatedCharity,
    updatedPct,
    updatedHandicap,
    updatedClub,
    targetId
  );

  if (user.subscriptionStatus) {
    dbRecordActivity(targetId, updatedName, updatedEmail, 'SUBSCRIBE', `Updated status to ${user.subscriptionStatus}`);
  }

  return dbGetUserById(targetId);
}

export function dbGetAllUsers(): User[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as any[];
  return rows.map((r) => {
    const { password_hash, ...u } = mapUserRow(r);
    return u;
  });
}

// ----------------- LIVE ACTIVITY & AUDIT LOGS -----------------

export function dbRecordActivity(
  userId: string,
  userName: string,
  email: string,
  action: string,
  details?: string,
  ipAddress?: string
) {
  try {
    const db = getDb();
    const id = `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO activities (id, user_id, user_name, email, action, details, ip_address, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, userName, email, action, details || '', ipAddress || '127.0.0.1', now);
  } catch (err) {
    console.error('[SQLite Activity Log Error]:', err);
  }
}

export function dbGetActivities(limit = 20): any[] {
  const db = getDb();
  return db.prepare('SELECT * FROM activities ORDER BY timestamp DESC LIMIT ?').all(limit);
}

export function dbRecordAuditLog(
  adminName: string,
  action: string,
  entity: string,
  entityId: string,
  oldValue?: string,
  newValue?: string,
  ipAddress?: string
) {
  try {
    const db = getDb();
    const id = `audit-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO audit_logs (id, admin_name, action, entity, entity_id, old_value, new_value, ip_address, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, adminName, action, entity, entityId, oldValue || null, newValue || null, ipAddress || '127.0.0.1', now);
  } catch (err) {
    console.error('[SQLite Audit Log Error]:', err);
  }
}

export function dbGetAuditLogs(limit = 50): any[] {
  const db = getDb();
  return db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?').all(limit);
}

// ----------------- DRAWS & WINNERS -----------------

export function dbGetAllDraws(): Draw[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM draws ORDER BY draw_date DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    monthYear: r.month_year,
    drawDate: r.draw_date,
    status: r.status as any,
    drawLogic: r.draw_logic as any,
    winningNumbers: JSON.parse(r.winning_numbers || '[]'),
    totalPrizePool: r.total_prize_pool,
    jackpotPool: r.jackpot_pool,
    tier4Pool: r.tier4_pool,
    tier3Pool: r.tier3_pool,
    rolloverFromPrevious: r.rollover_from_previous,
    rolloverToNext: r.rollover_to_next,
    totalSubscribersEntered: r.total_subscribers_entered,
    publishedAt: r.published_at || undefined,
  }));
}

export function dbSaveDraw(draw: Draw): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO draws (
      id, name, month_year, draw_date, status, draw_logic, winning_numbers,
      total_prize_pool, jackpot_pool, tier4_pool, tier3_pool, rollover_from_previous, rollover_to_next, total_subscribers_entered, published_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      month_year = excluded.month_year,
      draw_date = excluded.draw_date,
      status = excluded.status,
      draw_logic = excluded.draw_logic,
      winning_numbers = excluded.winning_numbers,
      total_prize_pool = excluded.total_prize_pool,
      jackpot_pool = excluded.jackpot_pool,
      tier4_pool = excluded.tier4_pool,
      tier3_pool = excluded.tier3_pool,
      rollover_from_previous = excluded.rollover_from_previous,
      rollover_to_next = excluded.rollover_to_next,
      total_subscribers_entered = excluded.total_subscribers_entered,
      published_at = excluded.published_at
  `).run(
    draw.id,
    draw.name,
    draw.monthYear,
    draw.drawDate,
    draw.status,
    draw.drawLogic,
    JSON.stringify(draw.winningNumbers || []),
    draw.totalPrizePool,
    draw.jackpotPool,
    draw.tier4Pool,
    draw.tier3Pool,
    draw.rolloverFromPrevious,
    draw.rolloverToNext,
    draw.totalSubscribersEntered,
    draw.publishedAt || null,
    now
  );
}

export function dbGetAllWinners(): Winner[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM winners ORDER BY created_at DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    drawId: r.draw_id,
    userId: r.user_id,
    matchType: r.match_type as any,
    matchedNumbers: JSON.parse(r.matched_numbers || '[]'),
    userScoresAtDraw: JSON.parse(r.user_scores_at_draw || '[]'),
    prizeAmount: r.prize_amount,
    verificationStatus: r.verification_status as any,
    proofImageUrl: r.proof_image_url || undefined,
    proofUploadedAt: r.proof_uploaded_at || undefined,
    paymentStatus: r.payment_status as any,
    paidAt: r.paid_at || undefined,
    adminNotes: r.admin_notes || undefined,
    createdAt: r.created_at,
  }));
}

export function dbSaveWinners(winners: Winner[]): void {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO winners (
      id, draw_id, user_id, match_type, matched_numbers, user_scores_at_draw, prize_amount,
      verification_status, proof_image_url, proof_uploaded_at, payment_status, paid_at, admin_notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      verification_status = excluded.verification_status,
      proof_image_url = excluded.proof_image_url,
      proof_uploaded_at = excluded.proof_uploaded_at,
      payment_status = excluded.payment_status,
      paid_at = excluded.paid_at,
      admin_notes = excluded.admin_notes
  `);

  for (const w of winners) {
    stmt.run(
      w.id,
      w.drawId,
      w.userId,
      w.matchType,
      JSON.stringify(w.matchedNumbers || []),
      JSON.stringify(w.userScoresAtDraw || []),
      w.prizeAmount,
      w.verificationStatus || 'pending',
      w.proofImageUrl || null,
      w.proofUploadedAt || null,
      w.paymentStatus || 'pending',
      w.paidAt || null,
      w.adminNotes || null,
      w.createdAt || now
    );
  }
}

// ----------------- METRICS & ANALYTICS -----------------

export function dbGetLiveMetrics() {
  const db = getDb();

  const subscribersCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'subscriber'").get() as any).c;
  const activeSubscribersCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'subscriber' AND subscription_status = 'active'").get() as any).c;

  const currentDrawRow = db.prepare("SELECT * FROM draws WHERE status = 'scheduled' ORDER BY draw_date ASC LIMIT 1").get() as any;
  const jackpot = currentDrawRow ? currentDrawRow.jackpot_pool : 40700;

  const charitySumRow = db.prepare("SELECT SUM(total_raised) as sum FROM charities").get() as any;
  const totalCharityContributions = charitySumRow?.sum || 50000;

  const pendingWinners = (db.prepare("SELECT COUNT(*) as c FROM winners WHERE verification_status = 'pending'").get() as any).c;
  const approvedUnpaid = (db.prepare("SELECT COUNT(*) as c FROM winners WHERE verification_status = 'approved' AND payment_status != 'paid'").get() as any).c;

  return {
    totalUsers: subscribersCount,
    activeSubscribers: activeSubscribersCount,
    jackpotPool: jackpot,
    totalCharityContributions,
    pendingWinnersCount: pendingWinners,
    approvedUnpaidCount: approvedUnpaid,
    mrr: activeSubscribersCount * 19,
    arr: activeSubscribersCount * 19 * 12,
  };
}

// ----------------- GOLF SCORES OPERATIONS -----------------

export function dbGetUserScores(userId: string): GolfScore[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM golf_scores 
    WHERE user_id = ? 
    ORDER BY date DESC, created_at DESC 
    LIMIT 5
  `).all(userId) as any[];

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    score: r.score,
    date: r.date,
    courseName: r.course_name,
    notes: r.notes,
    createdAt: r.created_at,
  }));
}

export function dbAddGolfScore(
  userId: string,
  score: number,
  date: string,
  courseName?: string,
  notes?: string
): { success: boolean; message?: string; score?: GolfScore } {
  const db = getDb();
  const cleanDate = date.includes('T') ? date.split('T')[0] : date;
  const now = new Date().toISOString();

  // Enforce duplicate date prevention
  const existingOnDate = db.prepare('SELECT id FROM golf_scores WHERE user_id = ? AND date = ?').get(userId, cleanDate);
  if (existingOnDate) {
    return { success: false, message: `A score entry already exists for date ${cleanDate}. Only 1 score per date is permitted.` };
  }

  const id = `sc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const finalScore: GolfScore = {
    id,
    userId,
    score,
    date: cleanDate,
    courseName: courseName || 'Local Course',
    notes: notes || '',
    createdAt: now,
  };

  db.prepare(`
    INSERT INTO golf_scores (id, user_id, score, date, course_name, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, score, cleanDate, courseName || 'Local Course', notes || '', now);

  // Enforce Rolling 5 rule (§ 05): keep latest 5 recorded scores for user
  const allScores = db.prepare('SELECT id FROM golf_scores WHERE user_id = ? ORDER BY date DESC, created_at DESC').all(userId) as any[];
  if (allScores.length > 5) {
    const keepIds = allScores.slice(0, 5).map((s) => s.id);
    const placeholders = keepIds.map(() => '?').join(',');
    db.prepare(`DELETE FROM golf_scores WHERE user_id = ? AND id NOT IN (${placeholders})`).run(userId, ...keepIds);
  }

  return { success: true, score: finalScore };
}

export function dbUpdateGolfScore(
  scoreId: string,
  userId: string,
  score: number,
  date: string,
  courseName?: string,
  notes?: string
): { success: boolean; message?: string } {
  const db = getDb();
  const cleanDate = date.includes('T') ? date.split('T')[0] : date;

  const target = db.prepare('SELECT id FROM golf_scores WHERE id = ? AND user_id = ?').get(scoreId, userId);
  if (!target) {
    return { success: false, message: 'Score record not found or access denied.' };
  }

  db.prepare(`
    UPDATE golf_scores 
    SET score = ?, date = ?, course_name = ?, notes = ?
    WHERE id = ? AND user_id = ?
  `).run(score, cleanDate, courseName || 'Local Course', notes || '', scoreId, userId);

  return { success: true };
}

export function dbDeleteGolfScore(scoreId: string, userId: string): { success: boolean; message?: string } {
  const db = getDb();
  const res = db.prepare('DELETE FROM golf_scores WHERE id = ? AND user_id = ?').run(scoreId, userId);

  if (res.changes === 0) {
    return { success: false, message: 'Score not found or unauthorized.' };
  }

  return { success: true };
}
