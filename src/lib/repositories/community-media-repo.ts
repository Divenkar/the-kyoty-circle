import { createClient } from '@/utils/supabase/server';
import type { CommunityMedia } from '@/types';

export const CommunityMediaRepository = {
    /** Upload a new media entry */
    async create(data: {
        community_id: number;
        uploaded_by: number;
        url: string;
        caption?: string;
    }): Promise<CommunityMedia> {
        const supabase = await createClient();
        const { data: row, error } = await supabase
            .from('community_media')
            .insert(data)
            .select('*, kyoty_users(id, name)')
            .single();
        if (error) throw new Error(error.message);
        return row as CommunityMedia;
    },

    /** Fetch all media for a community (newest first) */
    async findByCommunity(communityId: number, limit = 100): Promise<CommunityMedia[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('community_media')
            .select('*, kyoty_users(id, name)')
            .eq('community_id', communityId)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) return [];
        return (data || []) as CommunityMedia[];
    },

    /** Find a single media item by id */
    async findById(id: number): Promise<CommunityMedia | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('community_media')
            .select('*, kyoty_users(id, name)')
            .eq('id', id)
            .single();
        if (error || !data) return null;
        return data as CommunityMedia;
    },

    /** Delete a media record (storage file must be deleted separately) */
    async delete(id: number): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('community_media')
            .delete()
            .eq('id', id);
        if (error) throw new Error(error.message);
    },
};
