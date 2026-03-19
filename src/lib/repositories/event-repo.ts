import { createClient } from '@/utils/supabase/server';
import type { KyotyEvent, EventWithCommunity } from '@/types';

export const EventRepository = {
    async create(data: {
        title: string;
        description?: string;
        community_id: number;
        city_id: number;
        location_text?: string;
        date: string;
        start_time?: string;
        end_time?: string;
        max_participants: number;
        pricing_model?: string;
        price_per_person?: number;
        created_by: number;
    }): Promise<KyotyEvent> {
        const supabase = await createClient();
        const { data: event, error } = await supabase
            .from('events')
            .insert({ ...data, status: 'pending' })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return event as KyotyEvent;
    },

    async findById(id: number): Promise<EventWithCommunity | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('events')
            .select('*, communities(*, cities!inner(name))')
            .eq('id', id)
            .single();
        if (error) return null;
        const event = data as any;
        if (event.communities) {
            event.communities.city_name = event.communities.cities?.name;
            delete event.communities.cities;
        }
        return event as EventWithCommunity;
    },

    async findByCity(city: string, category?: string): Promise<EventWithCommunity[]> {
        const supabase = await createClient();
        // First, find the city id from the cities table
        const { data: cityData } = await supabase
            .from('cities')
            .select('id')
            .ilike('name', city)
            .single();

        if (!cityData) return [];

        let query = supabase
            .from('events')
            .select('*, communities!inner(*, cities!inner(name))')
            .eq('city_id', cityData.id)
            .in('status', ['approved', 'open'])
            .order('date', { ascending: true });

        if (category && category !== 'All') {
            query = query.eq('communities.category', category);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return (data || []).map((e: any) => {
            if (e.communities) {
                e.communities.city_name = e.communities.cities?.name;
                delete e.communities.cities;
            }
            return e;
        }) as EventWithCommunity[];
    },

    async findAll(category?: string): Promise<EventWithCommunity[]> {
        const supabase = await createClient();
        let query = supabase
            .from('events')
            .select('*, communities(*, cities!inner(name))')
            .in('status', ['approved', 'open'])
            .order('date', { ascending: true });

        if (category && category !== 'All') {
            query = query.eq('communities.category', category);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return (data || []).map((e: any) => {
            if (e.communities) {
                e.communities.city_name = e.communities.cities?.name;
                delete e.communities.cities;
            }
            return e;
        }) as EventWithCommunity[];
    },

    async findByCommunity(communityId: number): Promise<KyotyEvent[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('community_id', communityId)
            .order('date', { ascending: true });
        if (error) throw new Error(error.message);
        return (data || []) as KyotyEvent[];
    },

    async findPending(): Promise<EventWithCommunity[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('events')
            .select('*, communities(*, cities!inner(name))')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return (data || []).map((e: any) => {
            if (e.communities) {
                e.communities.city_name = e.communities.cities?.name;
                delete e.communities.cities;
            }
            return e;
        }) as EventWithCommunity[];
    },

    async findByCreator(userId: number): Promise<EventWithCommunity[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('events')
            .select('*, communities(*, cities!inner(name))')
            .eq('created_by', userId)
            .order('date', { ascending: true });
        if (error) throw new Error(error.message);
        return (data || []).map((e: any) => {
            if (e.communities) {
                e.communities.city_name = e.communities.cities?.name;
                delete e.communities.cities;
            }
            return e;
        }) as EventWithCommunity[];
    },

    async updateStatus(id: number, status: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('events')
            .update({ status })
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    async search(params: {
        query?: string;
        dateFrom?: string;
        dateTo?: string;
        isPaid?: boolean;
        city?: string;
        category?: string;
    }): Promise<EventWithCommunity[]> {
        const supabase = await createClient();
        let query = supabase
            .from('events')
            .select('*, communities!inner(*, cities!inner(name))')
            .in('status', ['approved', 'open'])
            .order('date', { ascending: true });

        // City filter
        if (params.city && params.city !== 'all') {
            const { data: cityData } = await supabase
                .from('cities')
                .select('id')
                .ilike('name', params.city)
                .single();
            if (!cityData) return [];
            query = query.eq('city_id', cityData.id);
        }

        // Category filter
        if (params.category && params.category !== 'All') {
            query = query.eq('communities.category', params.category);
        }

        // Keyword search
        if (params.query) {
            query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%`);
        }

        // Date range
        if (params.dateFrom) {
            query = query.gte('date', params.dateFrom);
        }
        if (params.dateTo) {
            query = query.lte('date', params.dateTo);
        }

        // Free / Paid filter
        if (params.isPaid !== undefined) {
            query = query.eq('is_paid', params.isPaid);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return (data || []).map((e: any) => {
            if (e.communities) {
                e.communities.city_name = e.communities.cities?.name;
                delete e.communities.cities;
            }
            return e;
        }) as EventWithCommunity[];
    },

    async getParticipantCount(eventId: number): Promise<number> {
        const supabase = await createClient();
        const { count, error } = await supabase
            .from('event_participants')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .eq('status', 'registered');
        if (error) return 0;
        return count || 0;
    },
};
