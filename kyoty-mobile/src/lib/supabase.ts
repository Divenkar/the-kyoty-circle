import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://oxomieiirwghktdxjwjf.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Create a Supabase client with a Clerk session token injected.
 * This ensures RLS policies see the authenticated user.
 *
 * For read-only public data, pass no token to get anon-key access.
 */
export function createSupabaseClient(clerkToken?: string | null) {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: clerkToken
            ? { headers: { Authorization: `Bearer ${clerkToken}` } }
            : undefined,
    });
}
