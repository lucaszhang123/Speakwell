import {SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL} from './supabase-config.js';

export async function getAuthClient() {
  let config = {url: SUPABASE_URL, publishableKey: SUPABASE_PUBLISHABLE_KEY};
  if (!config.url || !config.publishableKey) {
    const response = await fetch('/api/auth-config');
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) config = await response.json();
  }
  if (!config.url || !config.publishableKey) {
    throw new Error('Accounts are not available yet. Please try again later. You can still practice in the studio without an account.');
  }
  const {createClient} = await import('https://esm.sh/@supabase/supabase-js@2');
  return createClient(config.url, config.publishableKey);
}
