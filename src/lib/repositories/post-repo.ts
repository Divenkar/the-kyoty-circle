import { createClient, createServiceClient } from '@/utils/supabase/server';

export interface CommunityPost {
    id: number;
    community_id: number;
    user_id: number;
    content: string;
    image_url: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    // joined
    author?: {
        id: number;
        name: string;
        avatar_url: string | null;
        social_proof_type: string | null;
    };
    reaction_count?: number;
    comment_count?: number;
    user_reacted?: boolean;
    user_reaction_type?: string | null;
}

export const PostRepository = {
    /** Fetch paginated posts for a community feed */
    async findByCommunity(
        communityId: number,
        limit = 20,
        before?: string,
    ): Promise<CommunityPost[]> {
        const supabase = await createClient();
        let q = supabase
            .from('community_posts')
            .select(`
                *,
                author:kyoty_users!community_posts_user_id_fkey(id, name, avatar_url, social_proof_type)
            `)
            .eq('community_id', communityId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (before) {
            q = q.lt('created_at', before);
        }

        const { data, error } = await q;
        if (error) return [];
        return (data || []) as CommunityPost[];
    },

    /** Fetch a single post by id */
    async findById(id: number): Promise<CommunityPost | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('community_posts')
            .select(`
                *,
                author:kyoty_users!community_posts_user_id_fkey(id, name, avatar_url, social_proof_type)
            `)
            .eq('id', id)
            .eq('is_deleted', false)
            .single();
        if (error) return null;
        return data as CommunityPost;
    },

    /** Create a new post */
    async create(data: {
        community_id: number;
        user_id: number;
        content: string;
        image_url?: string | null;
    }): Promise<CommunityPost> {
        const supabase = await createServiceClient();
        const { data: post, error } = await supabase
            .from('community_posts')
            .insert(data)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return post as CommunityPost;
    },

    /** Soft-delete a post */
    async softDelete(id: number): Promise<void> {
        const supabase = await createServiceClient();
        const { error } = await supabase
            .from('community_posts')
            .update({ is_deleted: true })
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    /** Get reaction counts and user's reaction for a list of post ids */
    async getReactionSummary(
        postIds: number[],
        userId?: number,
    ): Promise<Map<number, { count: number; userType: string | null }>> {
        if (postIds.length === 0) return new Map();
        const supabase = await createClient();

        const { data } = await supabase
            .from('post_reactions')
            .select('post_id, user_id, type')
            .in('post_id', postIds);

        const map = new Map<number, { count: number; userType: string | null }>();
        for (const id of postIds) {
            map.set(id, { count: 0, userType: null });
        }
        for (const row of data || []) {
            const entry = map.get(row.post_id)!;
            entry.count += 1;
            if (userId && row.user_id === userId) {
                entry.userType = row.type;
            }
        }
        return map;
    },

    /** Get comment counts for a list of post ids */
    async getCommentCounts(postIds: number[]): Promise<Map<number, number>> {
        if (postIds.length === 0) return new Map();
        const supabase = await createClient();

        const { data } = await supabase
            .from('post_comments')
            .select('post_id')
            .in('post_id', postIds)
            .eq('is_deleted', false);

        const map = new Map<number, number>();
        for (const id of postIds) map.set(id, 0);
        for (const row of data || []) {
            map.set(row.post_id, (map.get(row.post_id) || 0) + 1);
        }
        return map;
    },

    /** List posts by a user (for profile page) */
    async findByUser(userId: number, limit = 10): Promise<CommunityPost[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('community_posts')
            .select(`
                *,
                community:communities!community_posts_community_id_fkey(id, name, slug)
            `)
            .eq('user_id', userId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) return [];
        return (data || []) as CommunityPost[];
    },
};
