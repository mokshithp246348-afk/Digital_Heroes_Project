import { NextResponse } from 'next/server';
import { getSessionUser, setSessionCookie, signSessionToken } from '@/lib/auth';
import { dbGetUserById, dbGetUserByEmail, dbEnsureUserExists } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || (!session.id && !session.email)) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    let user = session.id ? dbGetUserById(session.id) : null;
    if (!user && session.email) {
      user = dbGetUserByEmail(session.email);
    }

    if (!user && session.email) {
      user = dbEnsureUserExists({
        id: session.id || `user-${Date.now()}`,
        email: session.email,
        name: session.name || session.email.split('@')[0],
        role: session.role || 'subscriber',
      });
    }

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    const response = NextResponse.json({
      success: true,
      user,
    });

    try {
      const token = await signSessionToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
      setSessionCookie(response, token);
    } catch {
      // ignore
    }

    return response;
  } catch (err: any) {
    console.error('[Session API Error]:', err);
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}

