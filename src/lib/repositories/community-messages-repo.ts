import { createClient } from '@/utils/supabase/server';
import type { CommunityMessage } from '@/types';

export const CommunityMessagesRepository = {
    /** Insert a new message */
    async create(data: {
        community_id: number;
        user_id: number;
        content: string;
        type?: string;
        reply_to_id?: number;
    }): Promise<CommunityMessage> {
        const supabase = await createClient();
        const { data: msg, error } = await supabase
            .from('community_messages')
            .insert({ ...data, type: data.type || 'text' })
            .select('*, kyoty_users(id, name, avatar_url)')
            .single();
        if (error) throw new Error(error.message);
        return msg as CommunityMessage;
    },

    /** Fetch recent messages for a community (newest 50, returned in asc order) */
    async findByCommunity(
        communityId: number,
        limit = 50,
        before?: string
    ): Promise<CommunityMessage[]> {
        const supabase = await createClient();
        let query = supabase
            .from('community_messages')
            .select('*, kyoty_users(id, name, avatar_url)')
            .eq('community_id', communityId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (before) {
            query = query.lt('created_at', before);
        }

        const { data, error } = await query;
        if (error) return [];
        // Return in ascending order for display
        return ((data || []) as CommunityMessage[]).reverse();
    },

    /** Soft-delete a message */
    async softDelete(messageId: number): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('community_messages')
            .update({ is_deleted: true, content: '[message deleted]' })
            .eq('id', messageId);
        if (error) throw new Error(error.message);
    },

    /** Edit a message's content */
    async edit(messageId: number, content: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('community_messages')
            .update({ content, edited_at: new Date().toISOString() })
            .eq('id', messageId);
        if (error) throw new Error(error.message);
    },

    /** Find a message by id (for permission checks) */
    async findById(messageId: number): Promise<CommunityMessage | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('community_messages')
            .select('*, kyoty_users(id, name, avatar_url)')
            .eq('id', messageId)
            .single();
        if (error || !data) return null;
        return data as CommunityMessage;
    },

    /** Add a reaction (upsert – ignore duplicate) */
    async addReaction(messageId: number, userId: number, emoji: string): Promise<void> {
        const supabase = await createClient();
        await supabase
            .from('community_message_reactions')
            .upsert({ message_id: messageId, user_id: userId, emoji })
            .select();
    },

    /** Remove a reaction */
    async removeReaction(messageId: number, userId: number, emoji: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('community_message_reactions')
            .delete()
            .eq('message_id', messageId)
            .eq('user_id', userId)
            .eq('emoji', emoji);
        if (error) throw new Error(error.message);
    },

    /** Fetch reactions for a set of messages */
    async getReactionsForMessages(messageIds: number[]) {
        if (!messageIds.length) return [];
        const supabase = await createClient();
        const { data } = await supabase
            .from('community_message_reactions')
            .select('*')
            .in('message_id', messageIds);
        return data || [];
    },
};
