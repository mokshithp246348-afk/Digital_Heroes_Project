import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbGetAllDraws, dbGetAllWinners } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    const draws = dbGetAllDraws();
    const allWinners = dbGetAllWinners();

    const userWinners = session?.id 
      ? allWinners.filter(w => w.userId === session.id)
      : [];

    return NextResponse.json({
      success: true,
      draws,
      allWinners,
      userWinners,
    });
  } catch (err: any) {
    console.error('[GET /api/draws Error]:', err);
    return NextResponse.json({ success: false, message: 'Error loading draws' }, { status: 500 });
  }
}
