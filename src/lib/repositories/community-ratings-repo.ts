import { createClient } from '@/utils/supabase/server';

export interface CommunityRating {
    id: number;
    community_id: number;
    user_id: number;
    rating: number;
    review: string | null;
    created_at: string;
}

export const CommunityRatingsRepository = {
    async findByUser(communityId: number, userId: number): Promise<CommunityRating | null> {
        const supabase = await createClient();
        const { data } = await supabase
            .from('community_ratings')
            .select('*')
            .eq('community_id', communityId)
            .eq('user_id', userId)
            .single();
        return data as CommunityRating | null;
    },

    async upsert(communityId: number, userId: number, rating: number, review?: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('community_ratings')
            .upsert(
                { community_id: communityId, user_id: userId, rating, review: review || null },
                { onConflict: 'community_id,user_id' }
            );
        if (error) throw new Error(error.message);
    },
};
