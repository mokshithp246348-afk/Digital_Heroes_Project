import { NextResponse } from 'next/server';
import { isSupabaseConfigured, checkSupabaseHealth } from '@/lib/supabase';
import { dbGetLiveMetrics } from '@/lib/db';

export async function GET() {
  try {
    const supabaseHealth = await checkSupabaseHealth();
    const metrics = dbGetLiveMetrics();

    return NextResponse.json({
      success: true,
      mode: isSupabaseConfigured ? 'supabase_postgresql' : 'file_store_fallback',
      supabase: {
        isConfigured: isSupabaseConfigured,
        ...supabaseHealth,
      },
      metrics,
      schemaInfo: {
        schemaPath: 'supabase/schema.sql',
        tablesSupported: [
          'public.profiles',
          'public.charities',
          'public.charity_events',
          'public.golf_scores',
          'public.draws',
          'public.winners',
          'public.donations',
        ],
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Database status check failed' },
      { status: 500 }
    );
  }
}
