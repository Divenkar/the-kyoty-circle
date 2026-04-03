import { createClient } from '@/utils/supabase/client';

type BrowserSupabaseClient = ReturnType<typeof createClient>;

let browserClient: BrowserSupabaseClient | null = null;

function getBrowserClient(): BrowserSupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('Supabase browser client can only be used in the browser.');
  }

  if (!browserClient) {
    // Anon client for public/read-only queries.
    // For write operations that require RLS, use createClient(token) directly
    // with a Clerk token from useAuth(): const { getToken } = useAuth();
    browserClient = createClient();
  }

  return browserClient;
}

export const supabase = new Proxy({} as BrowserSupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getBrowserClient(), prop, receiver);
  },
});
