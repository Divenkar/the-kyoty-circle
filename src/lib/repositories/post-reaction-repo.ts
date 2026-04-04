import { createClient } from '@/utils/supabase/server';

export type ReactionType = 'like' | 'fire' | 'heart' | 'clap';

export const PostReactionRepository = {
    /** Toggle a reaction — if same type exists remove it, otherwise upsert */
    async toggle(postId: number, userId: number, type: ReactionType): Promise<'added' | 'removed'> {
        const supabase = await createClient();

        // Check existing
        const { data: existing } = await supabase
            .from('post_reactions')
            .select('id, type')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .single();

        if (existing) {
            if (existing.type === type) {
                // Remove if same reaction
                await supabase.from('post_reactions').delete().eq('id', existing.id);
                return 'removed';
            }
            // Update to new reaction type
            await supabase
                .from('post_reactions')
                .update({ type })
                .eq('id', existing.id);
            return 'added';
        }

        // Insert new
        await supabase.from('post_reactions').insert({ post_id: postId, user_id: userId, type });
        return 'added';
    },

    async countByPost(postId: number): Promise<number> {
        const supabase = await createClient();
        const { count } = await supabase
            .from('post_reactions')
            .select('id', { count: 'exact', head: true })
            .eq('post_id', postId);
        return count || 0;
    },
};
