import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';
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
        if (!userId) return null;

        const supabase = await createClient();
        const { data } = await supabase
            .from('kyoty_users')
            .select('*')
            .eq('auth_id', userId)
            .single();

        if (data) return data as User;

        // Fallback: create row if the Clerk webhook hasn't fired yet (race condition safety net)
        const clerkUser = await currentUser();
        return await ensureUser({
            authId: userId,
            email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
            name: clerkUser?.fullName ?? clerkUser?.firstName ?? clerkUser?.emailAddresses[0]?.emailAddress?.split('@')[0] ?? 'User',
            avatarUrl: clerkUser?.imageUrl,
        }, supabase);
    } catch {
        return null;
    }
}

/**
 * Idempotent user creation. When called from a webhook (no user session),
 * pass an explicit service client via the `client` parameter.
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
    const supabase = client ?? await createClient();
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
