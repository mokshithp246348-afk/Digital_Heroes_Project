import { NextResponse } from 'next/server';
import { getSessionUser, setSessionCookie, signSessionToken } from '@/lib/auth';
import { dbUpdateUser, dbGetUserById, dbGetUserByEmail, dbEnsureUserExists } from '@/lib/db';

export const dynamic = 'force-dynamic';

const AVAILABLE_PLANS = [
  {
    id: 'plan-monthly',
    name: '1 Month Plan (Monthly)',
    billingCycle: 'monthly',
    price: 19,
    formattedPrice: '$19 / month',
    description: 'Flexible 1-month membership billing.',
  },
  {
    id: 'plan-yearly',
    name: '1 Year Plan (Annual)',
    billingCycle: 'yearly',
    price: 190,
    formattedPrice: '$190 / year',
    description: 'Equivalent to $15.83/mo (2 months free).',
    badge: 'Save 17%',
  },
];

// GET /api/user/subscription - Returns user membership & server-filtered eligible purchase plans
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryEmail = searchParams.get('email');
    const queryUserId = searchParams.get('userId');

    const session = await getSessionUser();

    let user = session?.id ? dbGetUserById(session.id) : null;
    if (!user && session?.email) {
      user = dbGetUserByEmail(session.email);
    }
    if (!user && queryUserId) {
      user = dbGetUserById(queryUserId);
    }
    if (!user && queryEmail) {
      user = dbGetUserByEmail(queryEmail);
    }

    if (!user) {
      return NextResponse.json({
        success: true,
        currentPlan: null,
        eligiblePlans: AVAILABLE_PLANS,
      });
    }

    // SERVER-SIDE ELIGIBILITY ENFORCEMENT:
    // User already holds activeCycle (e.g. 'monthly' or 'yearly').
    // Only show the OPPOSITE available plan tier switch!
    const activeCycle = user.billingCycle || 'monthly';
    const eligiblePlans = AVAILABLE_PLANS.filter((p) => p.billingCycle !== activeCycle);

    const activePlanObj = AVAILABLE_PLANS.find((p) => p.billingCycle === activeCycle) || {
      id: `plan-${activeCycle}`,
      name: activeCycle === 'yearly' ? '1 Year Plan (Annual)' : '1 Month Plan (Monthly)',
      billingCycle: activeCycle,
      price: activeCycle === 'yearly' ? 190 : 19,
      formattedPrice: activeCycle === 'yearly' ? '$190 / year' : '$19 / month',
      description: 'Active subscription tier',
    };

    return NextResponse.json({
      success: true,
      currentPlan: {
        ...activePlanObj,
        status: user.subscriptionStatus,
        renewalDate: user.subscriptionRenewalDate,
        charityId: user.charityId,
        charityContributionPct: user.charityContributionPct,
      },
      eligiblePlans,
    });
  } catch (err: any) {
    console.error('[GET /api/user/subscription Error]:', err);
    return NextResponse.json({ success: false, message: 'Server error loading subscription plans' }, { status: 500 });
  }
}

// POST /api/user/subscription - Handles plan tier updates & profile settings seamlessly
export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    const {
      userId,
      email,
      billingCycle,
      charityId,
      charityContributionPct,
      subscriptionStatus,
      name,
      handicap,
      homeClub,
    } = body || {};

    let existingUser = session?.id ? dbGetUserById(session.id) : null;
    if (!existingUser && (userId || session?.id)) {
      existingUser = dbGetUserById(userId || session?.id);
    }
    if (!existingUser && (email || session?.email)) {
      existingUser = dbGetUserByEmail(email || session?.email);
    }

    if (!existingUser) {
      const targetEmail = (email || session?.email || 'mokshithp1234@gmail.com').trim().toLowerCase();
      const targetName = (name || targetEmail.split('@')[0] || 'Mokshithp1234').trim();
      existingUser = dbEnsureUserExists({
        id: userId || `user-${Date.now()}`,
        email: targetEmail,
        name: targetName,
        role: 'subscriber',
        subscriptionStatus: subscriptionStatus || 'active',
        billingCycle: billingCycle || 'monthly',
        charityId: charityId || 'charity-1',
        charityContributionPct: charityContributionPct || 15,
      });
    }

    const activeUser = existingUser;
    const newCycle = billingCycle || activeUser.billingCycle || 'monthly';
    const renewalDate = new Date();
    if (newCycle === 'yearly') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    const updated = dbUpdateUser({
      id: activeUser.id,
      email: activeUser.email,
      name: name !== undefined ? name : activeUser.name,
      handicap: handicap !== undefined ? handicap : activeUser.handicap,
      homeClub: homeClub !== undefined ? homeClub : activeUser.homeClub,
      billingCycle: newCycle,
      subscriptionStatus: subscriptionStatus || 'active',
      subscriptionRenewalDate: renewalDate.toISOString(),
      charityId: charityId || activeUser.charityId || 'charity-1',
      charityContributionPct: charityContributionPct ? Math.max(10, Number(charityContributionPct)) : activeUser.charityContributionPct || 15,
    });

    const responseUser = updated || activeUser;

    const response = NextResponse.json({
      success: true,
      message: 'Subscription updated successfully.',
      user: responseUser,
    });

    // Re-issue fresh session cookie so session never expires
    try {
      const token = await signSessionToken({
        id: responseUser.id,
        name: responseUser.name,
        email: responseUser.email,
        role: responseUser.role,
      });
      setSessionCookie(response, token);
    } catch {}

    return response;
  } catch (err: any) {
    console.error('[POST /api/user/subscription Error]:', err);
    return NextResponse.json({ success: false, message: 'Server error updating subscription' }, { status: 500 });
  }
}

