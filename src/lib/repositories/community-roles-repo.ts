import { createClient } from '@/utils/supabase/server';
import type { CommunityRole, CommunityRoleLevel } from '@/types';

export const CommunityRolesRepository = {
    /** Upsert a role row (used for owner assignment + promotions) */
    async upsert(data: {
        community_id: number;
        user_id: number;
        role: CommunityRoleLevel;
        assigned_by?: number;
    }): Promise<CommunityRole> {
        const supabase = await createClient();
        const { data: row, error } = await supabase
            .from('community_roles')
            .upsert(
                { ...data },
                { onConflict: 'community_id,user_id' }
            )
            .select()
            .single();
        if (error) throw new Error(error.message);
        return row as CommunityRole;
    },

    /** Get a single user's role in a community (null = no role) */
    async getUserRole(
        communityId: number,
        userId: number
    ): Promise<CommunityRoleLevel | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('community_roles')
            .select('role')
            .eq('community_id', communityId)
            .eq('user_id', userId)
            .single();
        if (error || !data) return null;
        return data.role as CommunityRoleLevel;
    },

    /** List all role holders for a community (with user details) */
    async listByCommunity(communityId: number): Promise<CommunityRole[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('community_roles')
            .select('*, kyoty_users(id, name, email, avatar_url)')
            .eq('community_id', communityId)
            .order('created_at', { ascending: true });
        if (error) return [];
        return (data || []) as CommunityRole[];
    },

    /** Remove a user's community role */
    async remove(communityId: number, userId: number): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('community_roles')
            .delete()
            .eq('community_id', communityId)
            .eq('user_id', userId);
        if (error) throw new Error(error.message);
    },
};
