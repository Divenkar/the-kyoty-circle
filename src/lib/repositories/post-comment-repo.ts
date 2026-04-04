import { createClient } from '@/utils/supabase/server';

export interface PostComment {
    id: number;
    post_id: number;
    user_id: number;
    content: string;
    is_deleted: boolean;
    created_at: string;
    // joined
    author?: {
        id: number;
        name: string;
        avatar_url: string | null;
    };
}

export const PostCommentRepository = {
    /** Fetch comments for a post ordered oldest first */
    async findByPost(postId: number): Promise<PostComment[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('post_comments')
            .select(`
                *,
                author:kyoty_users!post_comments_user_id_fkey(id, name, avatar_url)
            `)
            .eq('post_id', postId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });
        if (error) return [];
        return (data || []) as PostComment[];
    },

    async create(data: {
        post_id: number;
        user_id: number;
        content: string;
    }): Promise<PostComment> {
        const supabase = await createClient();
        const { data: comment, error } = await supabase
            .from('post_comments')
            .insert(data)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return comment as PostComment;
    },

    async softDelete(id: number): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('post_comments')
            .update({ is_deleted: true })
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    async findById(id: number): Promise<PostComment | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('post_comments')
            .select('*')
            .eq('id', id)
            .single();
        if (error) return null;
        return data as PostComment;
    },
};
