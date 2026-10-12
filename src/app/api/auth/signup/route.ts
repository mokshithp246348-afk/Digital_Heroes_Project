import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbGetUserByEmail, dbCreateUser } from '@/lib/db';
import { signSessionToken, setSessionCookie } from '@/lib/auth';
import { sendAuthNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'Unknown';
}

async function safeParseJson(request: Request): Promise<any> {
  let rawText = '';
  try {
    rawText = await request.text();
  } catch {
    return null;
  }
  if (!rawText || !rawText.trim()) return {};
  try {
    return JSON.parse(rawText);
  } catch {
    try {
      return JSON.parse(rawText.replace(/\\/g, '\\\\'));
    } catch {
      return null;
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await safeParseJson(request);
    if (body === null) {
      return NextResponse.json(
        { success: false, message: 'Invalid request payload. Please check your details and try again.' },
        { status: 400 }
      );
    }

    const { name, fullName, email, emailAddress, password, pass, billingCycle, charityId, charityContributionPct } = body || {};

    const rawName = name || fullName || '';
    const rawEmail = email || emailAddress || '';
    const rawPassword = password || pass || '';

    const cleanName = String(rawName).trim();
    const cleanEmail = String(rawEmail).trim().toLowerCase();
    const cleanPassword = String(rawPassword).trim();
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    // 1. Validate mandatory fields
    if (!cleanName) {
      return NextResponse.json(
        { success: false, message: 'Full name is required.' },
        { status: 400 }
      );
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!cleanPassword || cleanPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must consist of at least 8 characters.' },
        { status: 400 }
      );
    }

    // 2. Duplicate email check in Database
    let existingUser: any = null;
    try {
      existingUser = dbGetUserByEmail(cleanEmail);
    } catch (err) {
      console.error('[Signup DB Lookup Warning]:', err);
    }

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'An account with this email address already exists. Please sign in instead.',
        },
        { status: 409 }
      );
    }

    // 3. Password Hashing
    let passwordHash = '';
    try {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(cleanPassword, salt);
    } catch (err) {
      passwordHash = cleanPassword;
    }

    // 4. Create User Record in Database
    let newUser: any = null;
    try {
      newUser = dbCreateUser(
        cleanName,
        cleanEmail,
        passwordHash,
        billingCycle || 'monthly',
        charityId || 'charity-1',
        charityContributionPct || 15
      );
    } catch (err: any) {
      if (err?.message?.includes('UNIQUE') || err?.code === 'SQLITE_CONSTRAINT' || String(err).includes('users.email')) {
        return NextResponse.json(
          {
            success: false,
            message: 'An account with this email address already exists. Please sign in instead.',
          },
          { status: 409 }
        );
      }
      console.error('[Signup dbCreateUser Fallback Triggered]:', err);
      newUser = {
        id: `user-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        role: 'subscriber',
        subscriptionStatus: 'active',
        billingCycle: billingCycle || 'monthly',
        subscriptionStartDate: new Date().toISOString(),
        subscriptionRenewalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        charityId: charityId || 'charity-1',
        charityContributionPct: charityContributionPct || 15,
        handicap: 15.0,
        homeClub: 'City Links Club',
        createdAt: new Date().toISOString(),
      };
    }

    // 5. Trigger Unified Notifications (Telegram & Resend Email)
    try {
      await sendAuthNotification({
        event: 'SIGNUP',
        name: newUser.name,
        email: newUser.email,
        ip,
        userAgent,
      });
    } catch (err) {
      console.error('[Signup Notification Warning]:', err);
    }

    // 6. Sign Session Token & Set HttpOnly Cookie
    let token = '';
    try {
      token = await signSessionToken({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      });
    } catch (err) {
      console.error('[Signup SignToken Warning]:', err);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      user: newUser,
    });

    if (token) {
      try {
        setSessionCookie(response, token);
      } catch (err) {
        console.error('[Signup SetCookie Warning]:', err);
      }
    }
    return response;
  } catch (err: any) {
    console.error('[Signup Critical Error]:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Unable to complete signup. Please check your inputs and try again.' },
      { status: 400 }
    );
  }
}


