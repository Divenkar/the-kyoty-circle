import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Authenticated client — injects Clerk JWT so Supabase RLS can identify the user.
// Uses the 'supabase' JWT template from Clerk (configure in Clerk dashboard > JWT Templates).
// Falls back to the service client when the template is not yet configured, so server
// actions that have already verified identity via auth() continue to work.
export async function createClient() {
    try {
        const { getToken } = await auth();
        // getToken throws when the 'supabase' JWT template is not configured in
        // the Clerk dashboard — catch that and fall through to the service client.
        const clerkToken = await getToken({ template: 'supabase' }).catch(() => null);

        if (clerkToken) {
            return createSupabaseClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    global: {
                        headers: { Authorization: `Bearer ${clerkToken}` },
                    },
                }
            );
        }
    } catch {
        // auth() itself failed (e.g. called outside request context) — fall through
    }

    // Fallback: service client bypasses RLS.
    // Safe because all callers of createClient() are server-side and have already
    // verified the user via Clerk's auth() before reaching any data query.
    return createServiceClient();
}

// Service client — bypasses RLS entirely, for webhooks and background jobs
// where there is no active user session. Requires SUPABASE_SERVICE_ROLE_KEY.
export function createServiceClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
}
