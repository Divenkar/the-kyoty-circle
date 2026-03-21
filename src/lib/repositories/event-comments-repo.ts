import { createClient } from '@/utils/supabase/server';

export interface EventComment {
    id: number;
    event_id: number;
    user_id: number;
    content: string;
    is_deleted: boolean;
    created_at: string;
    kyoty_users?: {
        id: number;
        name: string;
        avatar_url?: string;
    };
}

export const EventCommentsRepository = {
    async list(eventId: number): Promise<EventComment[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('event_comments')
            .select('*, kyoty_users!user_id(id, name, avatar_url)')
            .eq('event_id', eventId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true })
            .limit(100);
        if (error) return [];
        return (data || []) as EventComment[];
    },

    async create(eventId: number, userId: number, content: string): Promise<EventComment> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('event_comments')
            .insert({ event_id: eventId, user_id: userId, content })
            .select('*, kyoty_users!user_id(id, name, avatar_url)')
            .single();
        if (error) throw new Error(error.message);
        return data as EventComment;
    },

    async softDelete(commentId: number, userId: number): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('event_comments')
            .update({ is_deleted: true })
            .eq('id', commentId)
            .eq('user_id', userId);
        if (error) throw new Error(error.message);
    },
};
