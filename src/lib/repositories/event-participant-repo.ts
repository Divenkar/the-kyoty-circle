import { createClient } from '@/utils/supabase/server';
import type { EventParticipant, EventParticipantWithUser } from '@/types';

export const EventParticipantRepository = {
    async join(eventId: number, userId: number): Promise<EventParticipant> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('event_participants')
            .insert({
                event_id: eventId,
                user_id: userId,
                status: 'registered',
            })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as EventParticipant;
    },

    async joinWaitlist(eventId: number, userId: number): Promise<EventParticipant> {
        const supabase = await createClient();
        // Calculate waitlist position
        const { count } = await supabase
            .from('event_participants')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .eq('status', 'waitlisted');
        const position = (count || 0) + 1;

        const { data, error } = await supabase
            .from('event_participants')
            .insert({
                event_id: eventId,
                user_id: userId,
                status: 'waitlisted',
                waitlist_position: position,
            })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as EventParticipant;
    },

    async promoteFromWaitlist(eventId: number): Promise<EventParticipant | null> {
        const supabase = await createClient();
        // Find the next person on the waitlist
        const { data } = await supabase
            .from('event_participants')
            .select('*')
            .eq('event_id', eventId)
            .eq('status', 'waitlisted')
            .order('waitlist_position', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (!data) return null;

        await supabase
            .from('event_participants')
            .update({ status: 'registered', waitlist_position: null })
            .eq('id', data.id);

        return data as EventParticipant;
    },

    async getWaitlistPosition(eventId: number, userId: number): Promise<number> {
        const supabase = await createClient();
        const { data } = await supabase
            .from('event_participants')
            .select('waitlist_position')
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .eq('status', 'waitlisted')
            .single();
        return data?.waitlist_position || 0;
    },

    async cancel(eventId: number, userId: number): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('event_participants')
            .update({ status: 'cancelled' })
            .eq('event_id', eventId)
            .eq('user_id', userId);
        if (error) throw new Error(error.message);
    },

    async remove(id: number): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('event_participants')
            .update({ status: 'removed' })
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    async findExisting(eventId: number, userId: number): Promise<EventParticipant | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('event_participants')
            .select('*')
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .in('status', ['registered', 'waitlisted'])
            .single();
        if (error) return null;
        return data as EventParticipant;
    },

    async listByEvent(eventId: number): Promise<EventParticipantWithUser[]> {
        const supabase = await createClient();
        // Try with user join first, fall back to plain select if FK is missing
        const { data, error } = await supabase
            .from('event_participants')
            .select('*, kyoty_users(id, name, email)')
            .eq('event_id', eventId)
            .eq('status', 'registered')
            .order('joined_at', { ascending: true });

        if (error) {
            // FK relationship may not exist — fall back to plain select
            const { data: plain, error: plainErr } = await supabase
                .from('event_participants')
                .select('*')
                .eq('event_id', eventId)
                .eq('status', 'registered')
                .order('joined_at', { ascending: true });
            if (plainErr) return [];
            return (plain || []) as EventParticipantWithUser[];
        }
        return (data || []) as EventParticipantWithUser[];
    },

    async listWaitlistedByEvent(eventId: number): Promise<EventParticipantWithUser[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('event_participants')
            .select('*, kyoty_users(id, name, email)')
            .eq('event_id', eventId)
            .eq('status', 'waitlisted')
            .order('waitlist_position', { ascending: true });
        if (error) {
            const { data: plain } = await supabase
                .from('event_participants')
                .select('*')
                .eq('event_id', eventId)
                .eq('status', 'waitlisted')
                .order('waitlist_position', { ascending: true });
            return (plain || []) as EventParticipantWithUser[];
        }
        return (data || []) as EventParticipantWithUser[];
    },

    async countByEvent(eventId: number): Promise<number> {
        const supabase = await createClient();
        const { count, error } = await supabase
            .from('event_participants')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .eq('status', 'registered');
        if (error) return 0;
        return count || 0;
    },

    async listByUser(userId: number): Promise<EventParticipantWithUser[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('event_participants')
            .select('*, events(*, communities(name, slug, cover_image_url, category))')
            .eq('user_id', userId)
            .in('status', ['registered', 'waitlisted'])
            .order('joined_at', { ascending: false });
        if (error) throw new Error(error.message);
        return (data || []) as any[];
    },

    async listUpcomingByUser(userId: number, limit = 20): Promise<any[]> {
        const supabase = await createClient();
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('event_participants')
            .select('*, events!inner(*, communities(name, slug, cover_image_url, category))')
            .eq('user_id', userId)
            .in('status', ['registered', 'waitlisted'])
            .gte('events.date', today)
            .order('joined_at', { ascending: false })
            .limit(limit);
        if (error) return [];
        return (data || []) as any[];
    },

    async listPastByUser(userId: number): Promise<any[]> {
        const supabase = await createClient();
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('event_participants')
            .select('*, events!inner(*, communities(name, slug, cover_image_url, category))')
            .eq('user_id', userId)
            .eq('status', 'registered')
            .lt('events.date', today)
            .order('joined_at', { ascending: false });
        if (error) return [];
        return (data || []) as any[];
    },

    async checkIn(eventId: number, userId: number): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('event_participants')
            .update({ checked_in_at: new Date().toISOString() })
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .eq('status', 'registered');
        if (error) throw new Error(error.message);
    },

    async getCheckInStats(eventId: number): Promise<{ total: number; checkedIn: number }> {
        const supabase = await createClient();
        const { count: total } = await supabase
            .from('event_participants')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .eq('status', 'registered');

        const { count: checkedIn } = await supabase
            .from('event_participants')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .eq('status', 'registered')
            .not('checked_in_at', 'is', null);

        return { total: total || 0, checkedIn: checkedIn || 0 };
    },
};
