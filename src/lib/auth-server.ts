import { auth, currentUser } from '@clerk/nextjs/server';
import { createServiceClient } from '@/utils/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { User, UserRole } from '@/types';

export async function getCurrentUserId(): Promise<string | null> {
    try {
        const { userId } = await auth();
        return userId;
    } catch {
        return null;
    }
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        const { userId } = await auth();
        if (!userId) {
            console.warn('[auth] getCurrentUser: Clerk auth() returned no userId');
            return null;
        }

        // Use service client for user lookup to avoid RLS/JWT issues.
        // The kyoty_users table has a public SELECT policy, but the service
        // client guarantees we always get results regardless of JWT state.
        const serviceClient = createServiceClient();
        const { data, error: selectError } = await serviceClient
            .from('kyoty_users')
            .select('*')
            .eq('auth_id', userId)
            .single();

        if (selectError) {
            console.warn('[auth] getCurrentUser: DB lookup failed for', userId, selectError.message);
        }

        if (data) return data as User;

        // Fallback: create row if the Clerk webhook hasn't fired yet (race condition safety net)
        console.log('[auth] getCurrentUser: No DB row for', userId, '— creating via ensureUser');
        const clerkUser = await currentUser();
        return await ensureUser({
            authId: userId,
            email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
            name: clerkUser?.fullName ?? clerkUser?.firstName ?? clerkUser?.emailAddresses[0]?.emailAddress?.split('@')[0] ?? 'User',
            avatarUrl: clerkUser?.imageUrl,
        }, serviceClient);
    } catch (err) {
        console.error('[auth] getCurrentUser failed:', err instanceof Error ? err.message : err);
        return null;
    }
}

/**
 * Idempotent user creation. When called from a webhook (no user session),
 * pass an explicit service client via the `client` parameter.
 * Always uses the service client to bypass RLS — user rows are created
 * before the JWT is available in the Supabase context.
 */
export async function ensureUser(
    profile: {
        authId: string;
        email: string;
        name: string;
        avatarUrl?: string | null;
    },
    client?: SupabaseClient,
): Promise<User> {
    const supabase = client ?? createServiceClient();
    const { data: existing } = await supabase
        .from('kyoty_users')
        .select('*')
        .eq('auth_id', profile.authId)
        .single();

    if (existing) return existing as User;

    const { data: newUser, error } = await supabase
        .from('kyoty_users')
        .insert({
            name: profile.name,
            email: profile.email,
            auth_id: profile.authId,
            role: 'participant',
            default_city_id: 1,
            interest_tags: [],
            onboarding_completed: false,
            avatar_url: profile.avatarUrl,
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return newUser as User;
}

export async function requireRole(requiredRole: UserRole): Promise<User> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Authentication required');

    const roleHierarchy: Record<string, number> = {
        participant: 0,
        community_admin: 1,
        admin: 2,
        kyoty_admin: 2,
    };

    if ((roleHierarchy[user.role] || 0) < (roleHierarchy[requiredRole] || 0)) {
        throw new Error(`Insufficient permissions. Required: ${requiredRole}`);
    }

    return user;
}
