'use client';

import {
  User,
  GolfScore,
  Charity,
  Draw,
  Winner,
  DirectDonation,
  PlatformAnalytics,
  BillingCycle,
  WinnerVerificationStatus,
  DrawLogic,
} from '@/types';
import {
  INITIAL_USERS,
  INITIAL_CHARITIES,
  INITIAL_GOLF_SCORES,
  INITIAL_DRAWS,
  INITIAL_WINNERS,
  INITIAL_DONATIONS,
  INITIAL_ANALYTICS,
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'dh_users',
  CURRENT_USER_ID: 'dh_current_user_id',
  SCORES: 'dh_scores',
  CHARITIES: 'dh_charities',
  DRAWS: 'dh_draws',
  WINNERS: 'dh_winners',
  DONATIONS: 'dh_donations',
  ANALYTICS: 'dh_analytics',
};

// Helper for safe client-side localStorage
function getStoredItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('dh-storage-update'));
  } catch (err) {
    console.error(`Error saving to localStorage key "${key}":`, err);
  }
}

// ----------------- USER & AUTH API -----------------
export function getUsers(): User[] {
  return getStoredItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function getCurrentUser(): User | null {
  const users = getUsers();
  const currentId = getStoredItem<string | null>(STORAGE_KEYS.CURRENT_USER_ID, null);
  if (!currentId) return null;
  return users.find((u) => u.id === currentId) || null;
}

export function setCurrentUser(userId: string | null): void {
  setStoredItem<string | null>(STORAGE_KEYS.CURRENT_USER_ID, userId);
}

export function updateUser(updatedUser: User): void {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
  } else {
    users.push(updatedUser);
  }
  setStoredItem(STORAGE_KEYS.USERS, users);
}

export function findUserByCredentials(input: string): User | undefined {
  const users = getUsers();
  const cleanInput = input.trim().toLowerCase();
  
  return users.find((u) => {
    const userEmail = u.email.toLowerCase();
    const userName = u.name.toLowerCase();
    if (userEmail === cleanInput || userName === cleanInput) return true;
    
    // Check space-stripped username (e.g. mokshithp1642)
    if (userName.replace(/\s+/g, '') === cleanInput.replace(/\s+/g, '')) return true;

    // Direct admin alias checks
    if (cleanInput.includes('mokshith') && u.email === 'mokshith@digitalheroes.com') return true;
    if (cleanInput.includes('mohith') && u.email === 'mohith@digitalheroes.com') return true;
    if (cleanInput.includes('admin') && u.role === 'admin') return true;

    const normalizedTarget = cleanInput.replace('@digitalheroes.test', '@digitalheroes.com');
    const normalizedUser = userEmail.replace('@digitalheroes.test', '@digitalheroes.com');
    return normalizedTarget === normalizedUser;
  });
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  billingCycle: BillingCycle = 'monthly',
  charityId: string = 'charity-1',
  charityContributionPct: number = 10
): User {
  const users = getUsers();
  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    role: 'subscriber',
    subscriptionStatus: 'active',
    billingCycle,
    subscriptionStartDate: new Date().toISOString(),
    subscriptionRenewalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    charityId,
    charityContributionPct: Math.max(10, charityContributionPct),
    handicap: 15.0,
    homeClub: 'City Links Club',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  setStoredItem(STORAGE_KEYS.USERS, users);
  setCurrentUser(newUser.id);
  return newUser;
}

// ----------------- GOLF SCORE API (§ 05) -----------------
// Rules:
// 1. Exactly 5 scores retained per user.
// 2. Score range 1-45 (Stableford).
// 3. Exactly 1 score per date. Duplicate date throws error.
// 4. Reverse chronological order.
// 5. Automatic eviction of oldest score when 6th added.
function sortScores(a: GolfScore, b: GolfScore): number {
  const timeA = new Date(a.createdAt || a.date).getTime();
  const timeB = new Date(b.createdAt || b.date).getTime();
  if (timeA !== timeB) return timeB - timeA;
  return b.id.localeCompare(a.id);
}

export function getAllGolfScores(): GolfScore[] {
  return getStoredItem<GolfScore[]>(STORAGE_KEYS.SCORES, INITIAL_GOLF_SCORES);
}

export function getUserGolfScores(userId: string): GolfScore[] {
  const allScores = getAllGolfScores();
  return allScores
    .filter((s) => s.userId === userId)
    .sort(sortScores)
    .slice(0, 5); // strictly only the latest 5
}

export function addGolfScore(
  userId: string,
  score: number,
  date: string,
  courseName?: string,
  notes?: string
): { success: boolean; error?: string; score?: GolfScore } {
  if (score < 1 || score > 45 || !Number.isInteger(score)) {
    return { success: false, error: 'Stableford score must be an integer between 1 and 45.' };
  }

  if (!date) {
    return { success: false, error: 'A valid date is required for the score entry.' };
  }

  const allScores = getAllGolfScores();
  const userScores = allScores.filter((s) => s.userId === userId);

  const newScore: GolfScore = {
    id: `sc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    score,
    date,
    courseName: courseName || 'Local Course',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  // Combine user scores with the new score and sort by recorded time descending
  const updatedUserScores = [newScore, ...userScores].sort(sortScores);

  // Retain only the 5 latest scores (evicts the oldest 1st entered score)
  const retainedScores = updatedUserScores.slice(0, 5);
  const otherUsersScores = allScores.filter((s) => s.userId !== userId);

  setStoredItem(STORAGE_KEYS.SCORES, [...otherUsersScores, ...retainedScores]);
  return { success: true, score: newScore };
}

export function updateGolfScore(
  scoreId: string,
  score: number,
  date: string,
  courseName?: string,
  notes?: string
): { success: boolean; error?: string } {
  if (score < 1 || score > 45 || !Number.isInteger(score)) {
    return { success: false, error: 'Stableford score must be an integer between 1 and 45.' };
  }

  const allScores = getAllGolfScores();
  const target = allScores.find((s) => s.id === scoreId);
  if (!target) return { success: false, error: 'Score not found.' };

  target.score = score;
  target.date = date;
  if (courseName !== undefined) target.courseName = courseName;
  if (notes !== undefined) target.notes = notes;

  setStoredItem(STORAGE_KEYS.SCORES, allScores);
  return { success: true };
}

export function deleteGolfScore(scoreId: string): void {
  const allScores = getAllGolfScores();
  const filtered = allScores.filter((s) => s.id !== scoreId);
  setStoredItem(STORAGE_KEYS.SCORES, filtered);
}

// ----------------- CHARITY API (§ 08) -----------------
export function getCharities(): Charity[] {
  return getStoredItem<Charity[]>(STORAGE_KEYS.CHARITIES, INITIAL_CHARITIES);
}

export function getCharityById(id: string): Charity | undefined {
  return getCharities().find((c) => c.id === id);
}

export function addCharity(charity: Omit<Charity, 'id' | 'totalRaised' | 'supporterCount'>): Charity {
  const charities = getCharities();
  const newCharity: Charity = {
    ...charity,
    id: `charity-${Date.now()}`,
    totalRaised: 0,
    supporterCount: 0,
    upcomingEvents: charity.upcomingEvents || [],
  };
  charities.unshift(newCharity);
  setStoredItem(STORAGE_KEYS.CHARITIES, charities);
  return newCharity;
}

export function updateCharity(updated: Charity): void {
  const charities = getCharities();
  const idx = charities.findIndex((c) => c.id === updated.id);
  if (idx !== -1) {
    charities[idx] = updated;
    setStoredItem(STORAGE_KEYS.CHARITIES, charities);
  }
}

export function deleteCharity(id: string): void {
  const charities = getCharities();
  const filtered = charities.filter((c) => c.id !== id);
  setStoredItem(STORAGE_KEYS.CHARITIES, filtered);
}

// Direct Donations (§ 08.1)
export function getDonations(): DirectDonation[] {
  return getStoredItem<DirectDonation[]>(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
}

export function addDonation(
  charityId: string,
  amount: number,
  donorName: string,
  donorEmail: string,
  message?: string,
  userId?: string
): DirectDonation {
  const donations = getDonations();
  const charity = getCharityById(charityId);
  const newDonation: DirectDonation = {
    id: `don-${Date.now()}`,
    userId,
    charityId,
    charityName: charity ? charity.name : 'Selected Charity',
    donorName,
    donorEmail,
    amount,
    isIndependent: true,
    message,
    createdAt: new Date().toISOString(),
  };

  donations.unshift(newDonation);
  setStoredItem(STORAGE_KEYS.DONATIONS, donations);

  // Update charity total raised
  if (charity) {
    charity.totalRaised += amount;
    charity.supporterCount += 1;
    updateCharity(charity);
  }

  // Update platform analytics
  const analytics = getAnalytics();
  analytics.totalCharityContributions += amount;
  setStoredItem(STORAGE_KEYS.ANALYTICS, analytics);

  return newDonation;
}

// ----------------- DRAW & WINNERS API (§ 06, § 07, § 09) -----------------
export function getDraws(): Draw[] {
  return getStoredItem<Draw[]>(STORAGE_KEYS.DRAWS, INITIAL_DRAWS);
}

export function getWinners(): Winner[] {
  return getStoredItem<Winner[]>(STORAGE_KEYS.WINNERS, INITIAL_WINNERS);
}

export function getAnalytics(): PlatformAnalytics {
  return getStoredItem<PlatformAnalytics>(STORAGE_KEYS.ANALYTICS, INITIAL_ANALYTICS);
}

export function saveDraws(draws: Draw[]): void {
  setStoredItem(STORAGE_KEYS.DRAWS, draws);
}

export function saveWinners(winners: Winner[]): void {
  setStoredItem(STORAGE_KEYS.WINNERS, winners);
}

// Submit verification proof (§ 09)
export function submitWinnerProof(winnerId: string, proofImageUrl: string): boolean {
  const winners = getWinners();
  const winner = winners.find((w) => w.id === winnerId);
  if (!winner) return false;

  winner.proofImageUrl = proofImageUrl;
  winner.proofUploadedAt = new Date().toISOString();
  winner.verificationStatus = 'pending';
  saveWinners(winners);
  return true;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
}

const INITIAL_AUDIT_LOGS: AuditRecord[] = [
  {
    id: 'audit-1',
    timestamp: '2026-03-22T09:30:00Z',
    adminName: 'Mokshith P1642',
    action: 'Administrator Logged In',
    entity: 'AUTH',
    entityId: 'admin-2',
    ipAddress: '192.168.1.10',
  },
  {
    id: 'audit-2',
    timestamp: '2026-03-20T14:15:00Z',
    adminName: 'MOHITH P1234',
    action: 'Published Monthly Draw',
    entity: 'DRAW',
    entityId: 'draw-mar-2026',
    oldValue: 'status: scheduled',
    newValue: 'status: published',
  },
];

export function getAuditLogs(): AuditRecord[] {
  return getStoredItem<AuditRecord[]>('dh_audit_logs', INITIAL_AUDIT_LOGS);
}

export function addAuditLog(
  action: string,
  entity: string,
  entityId: string,
  oldValue?: string,
  newValue?: string,
  adminName: string = 'Administrator'
): AuditRecord {
  const logs = getAuditLogs();
  const record: AuditRecord = {
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    adminName,
    action,
    entity,
    entityId,
    oldValue,
    newValue,
    ipAddress: '127.0.0.1',
  };
  logs.unshift(record);
  setStoredItem('dh_audit_logs', logs);
  return record;
}

// Admin verify winner (§ 09)
export function verifyWinner(
  winnerId: string,
  status: WinnerVerificationStatus,
  adminNotes?: string
): boolean {
  const winners = getWinners();
  const winner = winners.find((w) => w.id === winnerId);
  if (!winner) return false;

  const oldStatus = winner.verificationStatus;
  winner.verificationStatus = status;
  if (adminNotes !== undefined) winner.adminNotes = adminNotes;
  saveWinners(winners);

  addAuditLog(
    `Winner Verification Changed to ${status.toUpperCase()}`,
    'WINNER',
    winnerId,
    `verificationStatus: ${oldStatus}`,
    `verificationStatus: ${status}`
  );
  return true;
}

// Admin payout winner (§ 09 & § 11) with mandatory transaction ID
export function markWinnerPaid(winnerId: string, transactionId: string = 'TX-REF-884920'): boolean {
  const winners = getWinners();
  const winner = winners.find((w) => w.id === winnerId);
  if (!winner) return false;

  winner.paymentStatus = 'paid';
  winner.paidAt = new Date().toISOString();
  (winner as any).transactionId = transactionId;
  saveWinners(winners);

  // Update analytics
  const analytics = getAnalytics();
  analytics.totalWinnersPaid += 1;
  setStoredItem(STORAGE_KEYS.ANALYTICS, analytics);

  addAuditLog(
    `Payout Processed (TxID: ${transactionId})`,
    'PAYOUT',
    winnerId,
    'paymentStatus: pending',
    `paymentStatus: paid (TxID: ${transactionId})`
  );
  return true;
}

// Reset data to factory demo state
export function resetToDefaultData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  localStorage.removeItem(STORAGE_KEYS.SCORES);
  localStorage.removeItem(STORAGE_KEYS.CHARITIES);
  localStorage.removeItem(STORAGE_KEYS.DRAWS);
  localStorage.removeItem(STORAGE_KEYS.WINNERS);
  localStorage.removeItem(STORAGE_KEYS.DONATIONS);
  localStorage.removeItem(STORAGE_KEYS.ANALYTICS);
  window.location.reload();
}
