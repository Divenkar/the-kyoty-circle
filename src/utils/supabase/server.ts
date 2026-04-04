import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

/**
 * Server-side Supabase client that respects RLS.
 *
 * - When a Clerk session exists, the JWT is injected so RLS policies can
 *   identify the user (authenticated access).
 * - When no session exists (public pages like /explore), the anon key is
 *   used without an auth header (unauthenticated RLS — public read access).
 *
 * NEVER falls back to the service-role key. If you need to bypass RLS
 * (webhooks, cron jobs), call createServiceClient() explicitly.
 */
export async function createClient() {
    let clerkToken: string | null = null;

    try {
        const { getToken } = await auth();
        clerkToken =
            await getToken({ template: 'supabase' }).catch(() => null) ??
            await getToken().catch(() => null);
    } catch {
        // auth() failed (e.g. no request context) — proceed as unauthenticated
    }

    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        clerkToken
            ? { global: { headers: { Authorization: `Bearer ${clerkToken}` } } }
            : undefined,
    );
}

// Service client — bypasses RLS entirely, for webhooks and background jobs
// where there is no active user session. Requires SUPABASE_SERVICE_ROLE_KEY.
export function createServiceClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
}
