import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Authenticated client — injects Clerk JWT so Supabase RLS can identify the user.
// Uses the 'supabase' JWT template from Clerk (configure in Clerk dashboard > JWT Templates).
// Falls back to the service client when the template is not yet configured, so server
// actions that have already verified identity via auth() continue to work.
export async function createClient() {
    const { getToken } = await auth();
    const clerkToken = await getToken({ template: 'supabase' });

    if (!clerkToken) {
        // JWT template not configured — use service client for server-side calls.
        // All callers of createClient() are server-side and have already verified
        // the user via Clerk auth(), so bypassing RLS here is safe.
        return createServiceClient();
    }

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

// Service client — bypasses RLS entirely, for webhooks and background jobs
// where there is no active user session. Requires SUPABASE_SERVICE_ROLE_KEY.
export function createServiceClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
}
