import { createClient } from '@/utils/supabase/server';
import type { User } from '@/types';

export const UserRepository = {
    async findByAuthId(authId: string): Promise<User | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('kyoty_users')
            .select('*')
            .eq('auth_id', authId)
            .single();
        if (error) return null;
        return data as User;
    },

    async findById(id: number): Promise<User | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('kyoty_users')
            .select('*')
            .eq('id', id)
            .single();
        if (error) return null;
        return data as User;
    },

    async findByEmail(email: string): Promise<User | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('kyoty_users')
            .select('*')
            .eq('email', email)
            .single();
        if (error) return null;
        return data as User;
    },

    async create(userData: {
        name: string;
        email: string;
        auth_id: string;
        role?: string;
        city?: string;
        social_proof_type?: string;
        social_proof_link?: string;
    }): Promise<User> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('kyoty_users')
            .insert({
                ...userData,
                role: userData.role || 'participant',
            })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as User;
    },

    async updateRole(id: number, role: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('kyoty_users')
            .update({ role })
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    async updateProfile(id: number, updates: {
        name?: string;
        city?: string;
        social_proof_type?: string;
        social_proof_link?: string;
        avatar_url?: string;
    }): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('kyoty_users')
            .update(updates)
            .eq('id', id);
        if (error) throw new Error(error.message);
    },
};
