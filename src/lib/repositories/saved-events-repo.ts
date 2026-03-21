import { createClient } from '@/utils/supabase/server';
import type { EventWithCommunity } from '@/types';

export const SavedEventsRepository = {
    async save(userId: number, eventId: number): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('saved_events')
            .insert({ user_id: userId, event_id: eventId });
        // Ignore duplicate-save errors (unique constraint)
        if (error && !error.message.includes('duplicate')) throw new Error(error.message);
    },

    async unsave(userId: number, eventId: number): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('saved_events')
            .delete()
            .eq('user_id', userId)
            .eq('event_id', eventId);
        if (error) throw new Error(error.message);
    },

    async isSaved(userId: number, eventId: number): Promise<boolean> {
        const supabase = await createClient();
        const { data } = await supabase
            .from('saved_events')
            .select('id')
            .eq('user_id', userId)
            .eq('event_id', eventId)
            .single();
        return !!data;
    },

    async listByUser(userId: number): Promise<EventWithCommunity[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('saved_events')
            .select('event_id, events(*, communities(*, cities!inner(name)))')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) return [];
        return (data || []).map((row: any) => {
            const event = row.events as any;
            if (event?.communities) {
                event.communities.city_name = event.communities.cities?.name;
                delete event.communities.cities;
            }
            return event;
        }).filter(Boolean) as EventWithCommunity[];
    },

    async getSavedEventIds(userId: number): Promise<number[]> {
        const supabase = await createClient();
        const { data } = await supabase
            .from('saved_events')
            .select('event_id')
            .eq('user_id', userId);
        return (data || []).map((r: any) => r.event_id as number);
    },
};
