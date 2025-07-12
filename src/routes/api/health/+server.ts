import type { RequestEvent } from '@sveltejs/kit';

export async function GET() {
  try {
    // Test environment variables
    const hasSupabaseUrl = !!process.env.PUBLIC_SUPABASE_URL;
    const hasSupabaseKey = !!process.env.PUBLIC_SUPABASE_ANON_KEY;
    
    // Test Supabase connection
    let supabaseStatus = 'unknown';
    try {
      const { getSupabase } = await import('$lib/supabaseClient');
      const supabase = getSupabase();
      const { error } = await supabase.from('posts').select('count').limit(1);
      supabaseStatus = error ? `error: ${error.message}` : 'connected';
    } catch (e) {
      supabaseStatus = `exception: ${e instanceof Error ? e.message : 'unknown'}`;
    }

    return new Response(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl,
        hasSupabaseKey,
        nodeEnv: process.env.NODE_ENV
      },
      supabase: supabaseStatus
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
