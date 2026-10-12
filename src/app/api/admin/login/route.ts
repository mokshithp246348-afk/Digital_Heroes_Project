import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbGetUserByEmail } from '@/lib/db';
import { sendAuthNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'Unknown';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    const inputEmail = (email || username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    if (!inputEmail || !cleanPassword) {
      return NextResponse.json(
        { success: false, message: 'Administrator email and password are required.' },
        { status: 400 }
      );
    }

    // 1. Fetch user from database
    const user = dbGetUserByEmail(inputEmail);
    if (!user) {
      await sendAuthNotification({
        event: 'FAILED_LOGIN',
        name: 'Unknown Admin User',
        email: inputEmail,
        ip,
        userAgent,
        details: 'Admin login attempt with non-existent email',
      });

      return NextResponse.json(
        { success: false, message: 'Invalid administrator credentials.' },
        { status: 401 }
      );
    }

    // 2. Verify strict admin authorization
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Account does not possess administrator privileges.' },
        { status: 403 }
      );
    }

    // 3. Verify password
    let isMatch = false;
    if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(cleanPassword, user.password_hash);
    } else {
      isMatch = user.password_hash === cleanPassword;
    }

    // Fallback credential checks for requested admin accounts
    if (!isMatch) {
      if (
        (inputEmail.includes('mokshith') && cleanPassword === '16421642') ||
        (inputEmail.includes('digital') && cleanPassword === 'Digiital Password12345')
      ) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      await sendAuthNotification({
        event: 'FAILED_LOGIN',
        name: user.name,
        email: user.email,
        ip,
        userAgent,
        details: 'Admin login attempt with wrong password',
      });

      return NextResponse.json(
        { success: false, message: 'Invalid administrator credentials.' },
        { status: 401 }
      );
    }

    // 4. Record Live Activity & Audit Log
    try {
      const { dbRecordActivity, dbRecordAuditLog } = await import('@/lib/db');
      dbRecordActivity(user.id, user.name, user.email, 'ADMIN_LOGIN', 'Administrator logged in to Control Center', ip);
      dbRecordAuditLog(user.name, 'Administrator Logged In', 'AUTH', user.id, undefined, 'Logged In', ip);
    } catch {}

    // 5. Trigger Notifications ONLY on Successful Admin Login
    await sendAuthNotification({
      event: 'ADMIN_LOGIN',
      name: user.name,
      email: user.email,
      ip,
      userAgent,
    });

    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'admin',
      loggedInAt: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      message: 'Admin authentication successful.',
      user: sessionData,
    });

    response.cookies.set('dh_admin_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    response.cookies.set('dh_user_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Internal server error during admin authentication.' },
      { status: 500 }
    );
  }
}
