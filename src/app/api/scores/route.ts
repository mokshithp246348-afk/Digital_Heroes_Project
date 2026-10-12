import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import {
  dbGetUserScores,
  dbAddGolfScore,
  dbUpdateGolfScore,
  dbDeleteGolfScore,
  dbEnsureUserExists,
  dbRecordActivity,
} from '@/lib/db';
import { GolfScore } from '@/types';

export const dynamic = 'force-dynamic';

// GET /api/scores - Retrieve latest 5 rolling golf scores for the authenticated user
export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    const { searchParams } = new URL(request.url);
    const targetUserId = session?.id || searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const scores = dbGetUserScores(targetUserId);
    return NextResponse.json({ success: true, scores });
  } catch (err: any) {
    console.error('[GET /api/scores Error]:', err);
    return NextResponse.json({ success: false, message: 'Server error loading scores' }, { status: 500 });
  }
}

// Helper to normalize dates to YYYY-MM-DD format
function normalizeDate(rawDate: string): string {
  if (!rawDate) return new Date().toISOString().split('T')[0];
  const str = rawDate.trim();
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      } else if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
    }
  }
  return str.split('T')[0];
}

// POST /api/scores - Add new golf score for user
export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    const body = await request.json();
    const { score, date, courseName, notes, userId } = body;
    const targetUserId = session?.id || userId;

    if (!targetUserId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const scoreNum = parseInt(score, 10);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      return NextResponse.json(
        { success: false, message: 'Stableford score must be an integer between 1 and 45.' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { success: false, message: 'A valid round date is required.' },
        { status: 400 }
      );
    }

    const cleanDate = normalizeDate(date);

    if (session?.id) {
      dbEnsureUserExists({
        id: session.id,
        email: session.email,
        name: session.name,
      });
    }

    const res = dbAddGolfScore(targetUserId, scoreNum, cleanDate, courseName, notes);

    if (!res.success) {
      return NextResponse.json({ success: false, message: res.message || 'Error saving score' }, { status: 400 });
    }

    try {
      dbRecordActivity(
        targetUserId,
        session?.name || 'User',
        session?.email || '',
        'SUBMIT_SCORE',
        `Logged Stableford score ${scoreNum} for ${cleanDate}`
      );
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Score saved successfully.',
      score: res.score,
    });
  } catch (err: any) {
    console.error('[POST /api/scores Error]:', err);
    return NextResponse.json({ success: false, message: err?.message || 'Server error saving score' }, { status: 500 });
  }
}

// PUT /api/scores - Update score for user
export async function PUT(request: Request) {
  try {
    const session = await getSessionUser();
    const body = await request.json();
    const { scoreId, score, date, courseName, notes, userId } = body;
    const targetUserId = session?.id || userId;

    if (!targetUserId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const scoreNum = parseInt(score, 10);
    if (!scoreId) {
      return NextResponse.json({ success: false, message: 'Score ID is required.' }, { status: 400 });
    }

    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      return NextResponse.json(
        { success: false, message: 'Stableford score must be an integer between 1 and 45.' },
        { status: 400 }
      );
    }

    const cleanDate = normalizeDate(date);
    const res = dbUpdateGolfScore(scoreId, targetUserId, scoreNum, cleanDate, courseName, notes);

    if (!res.success) {
      return NextResponse.json({ success: false, message: res.message || 'Update failed.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Score updated successfully.' });
  } catch (err: any) {
    console.error('[PUT /api/scores Error]:', err);
    return NextResponse.json({ success: false, message: 'Server error updating score' }, { status: 500 });
  }
}

// DELETE /api/scores - Delete score for user
export async function DELETE(request: Request) {
  try {
    const session = await getSessionUser();
    const { searchParams } = new URL(request.url);
    const scoreId = searchParams.get('id');
    const targetUserId = session?.id || searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!scoreId) {
      return NextResponse.json({ success: false, message: 'Score ID is required.' }, { status: 400 });
    }

    const res = dbDeleteGolfScore(scoreId, targetUserId);

    if (!res.success) {
      return NextResponse.json({ success: false, message: res.message || 'Score not found or unauthorized.' }, { status: 403 });
    }

    return NextResponse.json({ success: true, message: 'Score deleted successfully.' });
  } catch (err: any) {
    console.error('[DELETE /api/scores Error]:', err);
    return NextResponse.json({ success: false, message: 'Server error deleting score' }, { status: 500 });
  }
}

