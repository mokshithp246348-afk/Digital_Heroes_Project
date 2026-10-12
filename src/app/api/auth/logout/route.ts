import { NextResponse } from 'next/server';
import { clearSessionCookie, getSessionUser } from '@/lib/auth';
import { sendAuthNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    const userAgent = request.headers.get('user-agent') || undefined;

    if (sessionUser && sessionUser.email) {
      try {
        const { dbRecordActivity } = await import('@/lib/db');
        dbRecordActivity(sessionUser.id, sessionUser.name, sessionUser.email, 'LOGOUT', 'User logged out');
      } catch {}

      await sendAuthNotification({
        event: 'LOGOUT',
        name: sessionUser.name || 'User',
        email: sessionUser.email,
        userAgent,
      });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });
    clearSessionCookie(response);
    return response;
  } catch (err: any) {
    console.error('[Logout API Error]:', err);
    return NextResponse.json({ success: false, message: 'Error logging out' }, { status: 500 });
  }
}
