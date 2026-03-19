import { createClient } from '@/utils/supabase/server';
import type { User, UserRole } from '@/types';

export async function getCurrentUserId(): Promise<string | null> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id || null;
    } catch {
        return null;
    }
}

export async function getCurrentUser(): Promise<User | null> {
    const authId = await getCurrentUserId();
    if (!authId) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('kyoty_users')
        .select('*')
        .eq('auth_id', authId)
        .single();

    if (error || !data) return null;
    return data as User;
}

export async function ensureUser(profile: {
    authId: string;
    email: string;
    name: string;
    avatarUrl?: string;
}): Promise<User> {
    const supabase = await createClient();
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
            default_city_id: 1, // Default city ID for Noida in Supabase (from schema)
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
