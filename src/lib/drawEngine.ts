import { Draw, DrawLogic, GolfScore, User, Winner, WinnerMatchType } from '@/types';
import {
  getUsers,
  getAllGolfScores,
  getDraws,
  saveDraws,
  getWinners,
  saveWinners,
  getAnalytics,
} from './storage';

export interface DrawSimulationResult {
  winningNumbers: number[];
  drawLogic: DrawLogic;
  totalSubscribersEntered: number;
  totalPrizePool: number;
  rolloverFromPrevious: number;
  jackpotTotalPool: number; // 40% of draw pool + previous rollover
  tier4TotalPool: number; // 35%
  tier3TotalPool: number; // 25%
  rolloverToNext: number; // carried forward if 0 5-match winners
  tier5Winners: {
    user: User;
    matchedNumbers: number[];
    userScores: number[];
    payout: number;
  }[];
  tier4Winners: {
    user: User;
    matchedNumbers: number[];
    userScores: number[];
    payout: number;
  }[];
  tier3Winners: {
    user: User;
    matchedNumbers: number[];
    userScores: number[];
    payout: number;
  }[];
}

/**
 * Generate 5 distinct winning numbers between 1 and 45.
 * Either purely random (lottery) or algorithmic (weighted by score frequency across all users).
 */
export function generateWinningNumbers(logic: DrawLogic, scores: GolfScore[]): number[] {
  if (logic === 'random') {
    const numbers = new Set<number>();
    while (numbers.size < 5) {
      const num = Math.floor(Math.random() * 45) + 1;
      numbers.add(num);
    }
    return Array.from(numbers).sort((a, b) => a - b);
  }

  // Algorithmic mode: Calculate frequency distribution of scores across all users
  const frequencyMap: Record<number, number> = {};
  for (let i = 1; i <= 45; i++) {
    frequencyMap[i] = 1; // base Laplace smoothing weight
  }

  scores.forEach((s) => {
    if (s.score >= 1 && s.score <= 45) {
      frequencyMap[s.score] = (frequencyMap[s.score] || 1) + 3; // weight actual scores higher
    }
  });

  const selected = new Set<number>();
  while (selected.size < 5) {
    const availableNumbers = Object.keys(frequencyMap)
      .map(Number)
      .filter((n) => !selected.has(n));

    const totalWeight = availableNumbers.reduce((sum, n) => sum + frequencyMap[n], 0);
    let randomThreshold = Math.random() * totalWeight;

    for (const num of availableNumbers) {
      randomThreshold -= frequencyMap[num];
      if (randomThreshold <= 0) {
        selected.add(num);
        break;
      }
    }
  }

  return Array.from(selected).sort((a, b) => a - b);
}

/**
 * Run a full draw simulation for an upcoming or scheduled draw.
 * Calculates prize allocations and matches against all active subscribers' current 5 scores.
 */
export function simulateDraw(
  drawId: string,
  logic: DrawLogic,
  overrideNumbers?: number[]
): DrawSimulationResult {
  const allUsers = getUsers();
  const activeSubscribers = allUsers.filter(
    (u) => u.subscriptionStatus === 'active' && u.role === 'subscriber'
  );
  const allScores = getAllGolfScores();
  const draws = getDraws();
  const draw = draws.find((d) => d.id === drawId) || draws[draws.length - 1];

  // Auto-calculate draw pool based on active subscriber count ($20 contribution per subscriber)
  // Or use existing draw's totalPrizePool
  const subscriberCount = Math.max(activeSubscribers.length, 100);
  const totalPrizePool = draw?.totalPrizePool || subscriberCount * 20;
  const rolloverFromPrevious = draw?.rolloverFromPrevious || 0;

  // Prize distribution according to PRD § 07:
  // 5-match: 40% + rollover jackpot
  // 4-match: 35%
  // 3-match: 25%
  const currentDrawJackpotPortion = totalPrizePool * 0.4;
  const jackpotTotalPool = currentDrawJackpotPortion + rolloverFromPrevious;
  const tier4TotalPool = totalPrizePool * 0.35;
  const tier3TotalPool = totalPrizePool * 0.25;

  const winningNumbers =
    overrideNumbers && overrideNumbers.length === 5
      ? [...overrideNumbers].sort((a, b) => a - b)
      : generateWinningNumbers(logic, allScores);

  const winningSet = new Set(winningNumbers);

  const tier5WinnersList: { user: User; matchedNumbers: number[]; userScores: number[] }[] = [];
  const tier4WinnersList: { user: User; matchedNumbers: number[]; userScores: number[] }[] = [];
  const tier3WinnersList: { user: User; matchedNumbers: number[]; userScores: number[] }[] = [];

  // Evaluate each active subscriber's latest 5 scores
  activeSubscribers.forEach((user) => {
    const userScores = allScores
      .filter((s) => s.userId === user.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((s) => s.score);

    if (userScores.length === 0) return;

    // Unique match count against winning numbers
    const uniqueUserScores = Array.from(new Set(userScores));
    const matchedNumbers = uniqueUserScores.filter((num) => winningSet.has(num));
    const matchCount = matchedNumbers.length;

    if (matchCount >= 5) {
      tier5WinnersList.push({ user, matchedNumbers, userScores });
    } else if (matchCount === 4) {
      tier4WinnersList.push({ user, matchedNumbers, userScores });
    } else if (matchCount === 3) {
      tier3WinnersList.push({ user, matchedNumbers, userScores });
    }
  });

  // Calculate payouts per winner (split equally in tier)
  const tier5PayoutPerWinner =
    tier5WinnersList.length > 0 ? jackpotTotalPool / tier5WinnersList.length : 0;
  const tier4PayoutPerWinner =
    tier4WinnersList.length > 0 ? tier4TotalPool / tier4WinnersList.length : 0;
  const tier3PayoutPerWinner =
    tier3WinnersList.length > 0 ? tier3TotalPool / tier3WinnersList.length : 0;

  // Rollover logic: If 0 winners in 5-match tier, jackpot carries forward to next month!
  const rolloverToNext = tier5WinnersList.length === 0 ? jackpotTotalPool : 0;

  return {
    winningNumbers,
    drawLogic: logic,
    totalSubscribersEntered: activeSubscribers.length,
    totalPrizePool,
    rolloverFromPrevious,
    jackpotTotalPool,
    tier4TotalPool,
    tier3TotalPool,
    rolloverToNext,
    tier5Winners: tier5WinnersList.map((w) => ({ ...w, payout: tier5PayoutPerWinner })),
    tier4Winners: tier4WinnersList.map((w) => ({ ...w, payout: tier4PayoutPerWinner })),
    tier3Winners: tier3WinnersList.map((w) => ({ ...w, payout: tier3PayoutPerWinner })),
  };
}

/**
 * Publish a simulated draw officially. Creates winner records, updates next draw rollover, and locks status.
 */
export function publishDraw(drawId: string, simulation: DrawSimulationResult): boolean {
  const draws = getDraws();
  const drawIndex = draws.findIndex((d) => d.id === drawId);
  if (drawIndex === -1) return false;

  const targetDraw = draws[drawIndex];
  targetDraw.status = 'published';
  targetDraw.drawLogic = simulation.drawLogic;
  targetDraw.winningNumbers = simulation.winningNumbers;
  targetDraw.totalPrizePool = simulation.totalPrizePool;
  targetDraw.jackpotPool = simulation.jackpotTotalPool;
  targetDraw.tier4Pool = simulation.tier4TotalPool;
  targetDraw.tier3Pool = simulation.tier3TotalPool;
  targetDraw.rolloverFromPrevious = simulation.rolloverFromPrevious;
  targetDraw.rolloverToNext = simulation.rolloverToNext;
  targetDraw.totalSubscribersEntered = simulation.totalSubscribersEntered;
  targetDraw.publishedAt = new Date().toISOString();

  // Create winner records (§ 09)
  const existingWinners = getWinners();
  const newWinners: Winner[] = [];

  const addWinner = (
    w: { user: User; matchedNumbers: number[]; userScores: number[]; payout: number },
    matchType: WinnerMatchType
  ) => {
    newWinners.push({
      id: `win-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      drawId: targetDraw.id,
      drawName: targetDraw.name,
      drawDate: targetDraw.drawDate.split('T')[0],
      userId: w.user.id,
      userName: w.user.name,
      userEmail: w.user.email,
      matchType,
      matchedNumbers: w.matchedNumbers,
      userScoresAtDraw: w.userScores,
      prizeAmount: Math.round(w.payout),
      verificationStatus: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
    });
  };

  simulation.tier5Winners.forEach((w) => addWinner(w, '5_match'));
  simulation.tier4Winners.forEach((w) => addWinner(w, '4_match'));
  simulation.tier3Winners.forEach((w) => addWinner(w, '3_match'));

  saveWinners([...newWinners, ...existingWinners]);

  // Create or schedule the next upcoming monthly draw with the rolled over jackpot
  const nextMonthYear = getNextMonthString(targetDraw.monthYear);
  const nextDrawExists = draws.some((d) => d.monthYear === nextMonthYear);

  if (!nextDrawExists) {
    const nextDraw: Draw = {
      id: `draw-${nextMonthYear}`,
      name: `${getMonthName(nextMonthYear)} Monthly Championship Draw`,
      drawDate: `${nextMonthYear}-28T20:00:00Z`,
      monthYear: nextMonthYear,
      status: 'scheduled',
      drawLogic: 'algorithmic',
      winningNumbers: [],
      totalPrizePool: 50000,
      jackpotPool: 20000 + simulation.rolloverToNext,
      tier4Pool: 17500,
      tier3Pool: 12500,
      rolloverFromPrevious: simulation.rolloverToNext,
      rolloverToNext: 0,
      totalSubscribersEntered: simulation.totalSubscribersEntered,
    };
    draws.unshift(nextDraw);
  }

  saveDraws(draws);
  return true;
}

function getNextMonthString(currentMonthYear: string): string {
  const [yearStr, monthStr] = currentMonthYear.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);
  month += 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

function getMonthName(monthYear: string): string {
  const [, monthStr] = monthYear.split('-');
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const idx = parseInt(monthStr, 10) - 1;
  return months[idx] || 'Upcoming';
}
