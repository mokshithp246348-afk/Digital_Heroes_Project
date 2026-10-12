import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbGetLiveMetrics, dbGetActivities, dbGetAuditLogs, dbGetAllUsers, dbGetAllDraws, dbGetAllWinners } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const metrics = dbGetLiveMetrics();
    const activities = dbGetActivities(20);
    const auditLogs = dbGetAuditLogs(30);
    const users = dbGetAllUsers();
    const draws = dbGetAllDraws();
    const winners = dbGetAllWinners();

    return NextResponse.json({
      success: true,
      metrics,
      activities,
      auditLogs,
      users,
      draws,
      winners,
    });
  } catch (err: any) {
    console.error('[GET /api/admin/metrics Error]:', err);
    return NextResponse.json({ success: false, message: 'Error loading admin metrics' }, { status: 500 });
  }
}
