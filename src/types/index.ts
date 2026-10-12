export type UserRole = 'visitor' | 'subscriber' | 'admin';

export type SubscriptionStatus = 'active' | 'inactive' | 'lapsed';

export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  billingCycle?: BillingCycle;
  description: string;
  features: string[];
  stripePriceId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  billingCycle?: BillingCycle;
  subscriptionStartDate?: string;
  subscriptionRenewalDate?: string;
  charityId?: string;
  charityContributionPct: number; // e.g., 10 for 10%, minimum 10
  handicap?: number;
  homeClub?: string;
  createdAt: string;
}

export interface GolfScore {
  id: string;
  userId: string;
  score: number; // 1 - 45 Stableford
  date: string; // YYYY-MM-DD
  courseName?: string;
  notes?: string;
  createdAt: string;
}

export interface CharityEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  ticketPrice?: number;
  spotsLeft?: number;
}

export interface Charity {
  id: string;
  name: string;
  tagline: string;
  category: 'Health & Medical' | 'Youth & Children' | 'Veterans & Heroes' | 'Environment' | 'Community Impact';
  description: string;
  impactStory: string;
  logoUrl?: string;
  imageUrl: string;
  websiteUrl: string;
  isSpotlight: boolean;
  totalRaised: number;
  supporterCount: number;
  upcomingEvents: CharityEvent[];
  taxId?: string;
  targetGoal?: number;
}

export type DrawLogic = 'random' | 'algorithmic';
export type DrawStatus = 'scheduled' | 'simulated' | 'published';

export interface DrawSimulationTierResult {
  tier: '5_match' | '4_match' | '3_match';
  tierPercentage: number;
  tierTotalAmount: number;
  winnerCount: number;
  payoutPerWinner: number;
  winnerUserIds: string[];
}

export interface Draw {
  id: string;
  name: string; // e.g., "March 2026 Monthly Draw"
  drawDate: string;
  monthYear: string; // "2026-03"
  status: DrawStatus;
  drawLogic: DrawLogic;
  winningNumbers: number[]; // exactly 5 distinct numbers (1-45)
  totalPrizePool: number;
  jackpotPool: number; // 40% of draw pool + previous rollover
  tier4Pool: number; // 35% of draw pool
  tier3Pool: number; // 25% of draw pool
  rolloverFromPrevious: number;
  rolloverToNext: number; // if 5-match has 0 winners, rolled over
  totalSubscribersEntered: number;
  publishedAt?: string;
}

export type WinnerMatchType = '5_match' | '4_match' | '3_match';
export type WinnerVerificationStatus = 'pending' | 'approved' | 'rejected';
export type WinnerPaymentStatus = 'pending' | 'paid';

export interface Winner {
  id: string;
  drawId: string;
  drawName: string;
  drawDate: string;
  userId: string;
  userName: string;
  userEmail: string;
  matchType: WinnerMatchType;
  matchedNumbers: number[];
  userScoresAtDraw: number[];
  prizeAmount: number;
  verificationStatus: WinnerVerificationStatus;
  proofImageUrl?: string;
  proofUploadedAt?: string;
  paymentStatus: WinnerPaymentStatus;
  paidAt?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface DirectDonation {
  id: string;
  userId?: string;
  donorName: string;
  donorEmail: string;
  charityId: string;
  charityName: string;
  amount: number;
  isIndependent: boolean;
  message?: string;
  createdAt: string;
}

export interface PlatformAnalytics {
  totalUsers: number;
  activeSubscribers: number;
  totalPrizePool: number;
  activeJackpot: number;
  totalCharityContributions: number;
  totalDrawsCompleted: number;
  totalWinnersPaid: number;
}
