import { createClient } from '@/utils/supabase/server';
import type { CommunityMember, CommunityMemberWithUser } from '@/types';

export const CommunityMemberRepository = {
    async createJoinRequest(communityId: number, userId: number): Promise<CommunityMember> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('community_members')
            .insert({
                community_id: communityId,
                user_id: userId,
                status: 'pending',
            })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as CommunityMember;
    },

    async findExisting(communityId: number, userId: number): Promise<CommunityMember | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('community_members')
            .select('*')
            .eq('community_id', communityId)
            .eq('user_id', userId)
            .single();
        if (error) return null;
        return data as CommunityMember;
    },

    async approve(id: number, approvedBy: number): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('community_members')
            .update({ status: 'approved', approved_by: approvedBy })
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    async reject(id: number): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('community_members')
            .update({ status: 'rejected' })
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    async listPending(communityId: number): Promise<CommunityMemberWithUser[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('community_members')
            .select('*, kyoty_users(*)')
            .eq('community_id', communityId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return (data || []) as CommunityMemberWithUser[];
    },

    async listAllPending(): Promise<CommunityMemberWithUser[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('community_members')
            .select('*, kyoty_users(*)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return (data || []) as CommunityMemberWithUser[];
    },

    async listApproved(communityId: number): Promise<CommunityMemberWithUser[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('community_members')
            .select('*, kyoty_users(*)')
            .eq('community_id', communityId)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return (data || []) as CommunityMemberWithUser[];
    },

    async isMember(communityId: number, userId: number): Promise<boolean> {
        const supabase = await createClient();
        const { data } = await supabase
            .from('community_members')
            .select('id')
            .eq('community_id', communityId)
            .eq('user_id', userId)
            .eq('status', 'approved')
            .single();
        return !!data;
    },

    async listByUser(userId: number): Promise<any[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('community_members')
            .select('*, communities(id, name, slug, cover_image_url, category, member_count, status)')
            .eq('user_id', userId)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        if (error) return [];
        return (data || []) as any[];
    },
};
