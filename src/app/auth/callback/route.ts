import { createClient } from '@/utils/supabase/server';
import { ensureUser } from '@/lib/auth-server';
import { NextResponse } from 'next/dist/server/web/spec-extension/response';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/onboarding';

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.user) {
            // Ensure a kyoty_users profile row exists for this auth user
            try {
                await ensureUser({
                    authId: data.user.id,
                    email: data.user.email ?? '',
                    name: data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'User',
                    avatarUrl: data.user.user_metadata?.avatar_url,
                });
            } catch {
                // Non-fatal — profile creation will be retried on next page load
            }
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
