import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Authenticated client — injects Clerk JWT so Supabase RLS can identify the user.
// Uses the 'supabase' JWT template from Clerk (must be configured in Clerk dashboard).
export async function createClient() {
    const { getToken } = await auth();
    const clerkToken = await getToken({ template: 'supabase' });

    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: clerkToken
                    ? { Authorization: `Bearer ${clerkToken}` }
                    : {},
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
