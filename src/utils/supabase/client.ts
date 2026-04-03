import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Browser client. For write operations that must respect RLS, pass the Clerk
// access token from the useAuth() hook: const { getToken } = useAuth();
// const token = await getToken({ template: 'supabase' });
// const supabase = createClient(token ?? undefined);
export function createClient(accessToken?: string) {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: accessToken
                    ? { Authorization: `Bearer ${accessToken}` }
                    : {},
            },
        }
    );
}
