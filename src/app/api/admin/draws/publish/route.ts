import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbGetAllUsers, getDb, dbSaveDraw, dbSaveWinners, dbRecordActivity, dbRecordAuditLog, dbGetAllDraws } from '@/lib/db';
import { Draw, Winner } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { drawId, winningNumbers, drawLogic, jackpotPool, tier4Pool, tier3Pool } = body;

    const { dbGetUserScores } = await import('@/lib/db');
    const allUsers = dbGetAllUsers().filter(u => u.role === 'subscriber' && u.subscriptionStatus === 'active');
    
    // Fetch all golf scores for active subscribers from persistent store
    const userScoresMap: Record<string, number[]> = {};
    for (const u of allUsers) {
      const userGolfScores = dbGetUserScores(u.id);
      if (userGolfScores && userGolfScores.length > 0) {
        userScoresMap[u.id] = userGolfScores.map((s) => s.score);
      }
    }

    const drawnNums: number[] = Array.isArray(winningNumbers) && winningNumbers.length === 5 
      ? winningNumbers.sort((a: number, b: number) => a - b)
      : [45, 25, 33, 14, 28];

    const winningSet = new Set(drawnNums);

    const tier5WinnersList: { user: any; matched: number[]; userScores: number[] }[] = [];
    const tier4WinnersList: { user: any; matched: number[]; userScores: number[] }[] = [];
    const tier3WinnersList: { user: any; matched: number[]; userScores: number[] }[] = [];

    // Evaluate each subscriber against winning numbers
    for (const user of allUsers) {
      const scores = userScoresMap[user.id] || [];
      if (scores.length === 0) continue;

      const uniqueScores = Array.from(new Set(scores));
      const matched = uniqueScores.filter(n => winningSet.has(n));

      if (matched.length >= 5) {
        tier5WinnersList.push({ user, matched, userScores: scores });
      } else if (matched.length === 4) {
        tier4WinnersList.push({ user, matched, userScores: scores });
      } else if (matched.length >= 3) {
        tier3WinnersList.push({ user, matched, userScores: scores });
      } else if (matched.length >= 1) {
        tier3WinnersList.push({ user, matched, userScores: scores });
      }
    }

    const totalPrize = 50000;
    const jPool = jackpotPool || 40700;
    const t4Pool = tier4Pool || 16975;
    const t3Pool = tier3Pool || 12125;

    const t5Payout = tier5WinnersList.length > 0 ? jPool / tier5WinnersList.length : 0;
    const t4Payout = tier4WinnersList.length > 0 ? t4Pool / tier4WinnersList.length : 0;
    const t3Payout = tier3WinnersList.length > 0 ? t3Pool / tier3WinnersList.length : 0;

    const targetDrawId = drawId || 'draw-current-championship';
    const now = new Date().toISOString();

    const drawObj: Draw = {
      id: targetDrawId,
      name: 'Official Monthly Championship Draw',
      drawDate: now,
      monthYear: now.substring(0, 7),
      status: 'published',
      drawLogic: drawLogic || 'algorithmic',
      winningNumbers: drawnNums,
      totalPrizePool: totalPrize,
      jackpotPool: jPool,
      tier4Pool: t4Pool,
      tier3Pool: t3Pool,
      rolloverFromPrevious: 21300,
      rolloverToNext: tier5WinnersList.length === 0 ? jPool : 0,
      totalSubscribersEntered: allUsers.length,
      publishedAt: now,
    };

    dbSaveDraw(drawObj);

    const newWinners: Winner[] = [];
    const addWinRecord = (w: { user: any; matched: number[]; userScores: number[] }, matchType: any, payout: number) => {
      newWinners.push({
        id: `win-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        drawId: targetDrawId,
        drawName: drawObj.name,
        drawDate: now.split('T')[0],
        userId: w.user.id,
        userName: w.user.name,
        userEmail: w.user.email,
        matchType,
        matchedNumbers: w.matched,
        userScoresAtDraw: w.userScores,
        prizeAmount: Math.round(payout || 1000),
        verificationStatus: 'approved',
        paymentStatus: 'pending',
        createdAt: now,
      });
    };

    tier5WinnersList.forEach(w => addWinRecord(w, '5_match', t5Payout));
    tier4WinnersList.forEach(w => addWinRecord(w, '4_match', t4Payout));
    tier3WinnersList.forEach(w => addWinRecord(w, '3_match', t3Payout));

    if (newWinners.length > 0) {
      dbSaveWinners(newWinners);
    }

    dbRecordActivity(session.id, session.name || 'Admin', session.email, 'CONDUCT_LOTTERY', `Conducted lottery! Winning numbers: [${drawnNums.join(', ')}], Winners count: ${newWinners.length}`);
    dbRecordAuditLog(session.name || 'Admin', 'Conducted Monthly Lottery Draw', 'DRAW', targetDrawId, undefined, `Published with numbers [${drawnNums.join(', ')}]`);

    return NextResponse.json({
      success: true,
      message: 'Lottery draw conducted and published successfully. Database updated live!',
      draw: drawObj,
      winningNumbers: drawnNums,
      winnersCount: newWinners.length,
      winners: newWinners,
    });
  } catch (err: any) {
    console.error('[POST /api/admin/draws/publish Error]:', err);
    return NextResponse.json({ success: false, message: 'Error publishing lottery draw' }, { status: 500 });
  }
}
