import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET_KEY = process.env.JWT_SECRET || 'digital-heroes-super-secret-jwt-key-2026';
const key = new TextEncoder().encode(JWT_SECRET_KEY);

export const SESSION_COOKIE_NAME = 'dh_user_session';
export const ADMIN_COOKIE_NAME = 'dh_admin_session';

export interface JWTPayload {
  id: string;
  name: string;
  email: string;
  role: 'visitor' | 'subscriber' | 'admin';
  iat?: number;
  exp?: number;
}

/**
 * Sign JWT session token (valid for 30 days)
 */
export async function signSessionToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key);
}

/**
 * Verify and decode JWT session token
 */
export async function verifySessionToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as JWTPayload;
  } catch (err: any) {
    console.error('[Auth Error] JWT verification failed:', err?.message || err);
    return null;
  }
}

/**
 * Get current session user from request cookies (Server Components & API Routes)
 */
export async function getSessionUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value || cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!sessionCookie) {
      console.log('[Auth] No session cookie found in request headers/cookies.');
      return null;
    }

    // First try verifying as JWT token
    const verified = await verifySessionToken(sessionCookie);
    if (verified) {
      return verified;
    }

    // Fallback parsing if JSON string cookie (for backwards compatibility)
    try {
      const parsed = JSON.parse(sessionCookie);
      if (parsed && parsed.id && parsed.email) {
        return {
          id: parsed.id,
          name: parsed.name || 'User',
          email: parsed.email,
          role: parsed.role || 'subscriber',
        };
      }
    } catch {
      // not JSON
    }

    console.warn('[Auth Error] Session cookie present but failed verification or token expired.');
    return null;
  } catch (err: any) {
    console.error('[Auth Error] Error retrieving session user:', err?.message || err);
    return null;
  }
}

/**
 * Attach session cookie to NextResponse
 */
export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

/**
 * Clear session cookie on NextResponse
 */
export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
