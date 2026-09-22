export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    url: context.env.SUPABASE_URL || '',
    publishableKey: context.env.SUPABASE_PUBLISHABLE_KEY || context.env.SUPABASE_ANON_KEY || '',
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

