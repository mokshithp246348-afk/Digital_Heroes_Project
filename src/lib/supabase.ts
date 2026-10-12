import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'your-anon-key-here'
);

/**
 * Public Supabase client for client-side interactions
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Server-only Supabase Admin client with Service Role privileges
 * NEVER expose this or use it on the client side!
 */
export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('Security Violation: getSupabaseAdmin() must never be called on the client!');
  }

  if (!isSupabaseConfigured || !supabaseServiceRoleKey || supabaseServiceRoleKey === 'your-service-role-key-here') {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Test Supabase PostgreSQL connection status and health
 */
export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  url: string;
  tables?: { profilesCount: number; charitiesCount: number; drawsCount: number };
  error?: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      url: supabaseUrl || 'Not configured',
      error: 'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY) are not set.',
    };
  }

  try {
    const client = getSupabaseAdmin() || supabase;
    if (!client) {
      return { connected: false, url: supabaseUrl, error: 'Client initialization failed' };
    }

    const [profilesRes, charitiesRes, drawsRes] = await Promise.all([
      client.from('profiles').select('id', { count: 'exact', head: true }),
      client.from('charities').select('id', { count: 'exact', head: true }),
      client.from('draws').select('id', { count: 'exact', head: true }),
    ]);

    if (profilesRes.error) {
      return {
        connected: false,
        url: supabaseUrl,
        error: profilesRes.error.message,
      };
    }

    return {
      connected: true,
      url: supabaseUrl,
      tables: {
        profilesCount: profilesRes.count ?? 0,
        charitiesCount: charitiesRes.count ?? 0,
        drawsCount: drawsRes.count ?? 0,
      },
    };
  } catch (err: any) {
    return {
      connected: false,
      url: supabaseUrl,
      error: err?.message || 'Unknown database connection error',
    };
  }
}

