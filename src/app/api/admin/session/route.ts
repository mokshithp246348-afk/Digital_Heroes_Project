import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dbGetUserById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('dh_admin_session')?.value || cookieStore.get('dh_user_session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    let userId = '';
    let parsed: any = null;
    try {
      parsed = JSON.parse(sessionCookie);
      userId = parsed.id;
    } catch {
      // ignore
    }

    if (!userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify user role directly against database
    const dbUser = dbGetUserById(userId);
    if (!dbUser || dbUser.role !== 'admin') {
      return NextResponse.json({ authenticated: false, message: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ authenticated: true, user: dbUser });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
