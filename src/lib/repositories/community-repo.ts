import { createClient } from '@/utils/supabase/server';
import type { Community } from '@/types';
import { getCurrentUserInterestTags } from '@/lib/interest-tags';

export const CommunityRepository = {
    async create(data: {
        name: string;
        slug: string;
        description?: string;
        category: string;
        city_id: number;
        organizer_id: number;
        cover_image_url?: string;
        visibility?: string;
    }): Promise<Community> {
        const supabase = await createClient();
        const { data: community, error } = await supabase
            .from('communities')
            .insert({ ...data, status: 'active', visibility: data.visibility ?? 'public' })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return community as Community;
    },

    async findById(id: number): Promise<Community | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('communities')
            .select('*, cities(name)')
            .eq('id', id)
            .single();
        if (error) return null;
        const community = data as any;
        return {
            ...community,
            city_name: community.cities?.name,
            cities: undefined,
        } as Community;
    },

    async findBySlug(slug: string): Promise<Community | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('communities')
            .select('*, cities(name), kyoty_users!communities_organizer_id_fkey(id, name, email, social_proof_type, avatar_url)')
            .eq('slug', slug)
            .single();
        if (error) return null;
        const community = data as any;
        return {
            ...community,
            city_name: community.cities?.name,
            organizer: community.kyoty_users || null,
            cities: undefined,
            kyoty_users: undefined,
        } as Community;
    },

    async findByCity(city: string): Promise<Community[]> {
        const supabase = await createClient();
        // First, find the city id
        const { data: cityData } = await supabase
            .from('cities')
            .select('id')
            .ilike('name', city)
            .single();

        if (!cityData) return [];

        const { data, error } = await supabase
            .from('communities')
            .select('*, cities(name)')
            .eq('city_id', cityData.id)
            .in('status', ['active', 'approved'])
            .order('created_at', { ascending: false });
        if (error) return [];
        return (data || []).map((c: any) => ({
            ...c,
            city_name: c.cities?.name,
            cities: undefined,
        })) as Community[];
    },

    async findAll(): Promise<Community[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('communities')
            .select('*, cities(name)')
            .in('status', ['active', 'approved'])
            .order('created_at', { ascending: false });
        if (error) return [];
        return (data || []).map((c: any) => ({
            ...c,
            city_name: c.cities?.name,
            cities: undefined,
        })) as Community[];
    },

    /** Search communities by query, city, category */
    async search(params: {
        query?: string;
        city?: string;
        category?: string;
    }): Promise<Community[]> {
        const supabase = await createClient();
        let q = supabase
            .from('communities')
            .select('*, cities(name)')
            .in('status', ['active', 'approved'])
            .order('member_count', { ascending: false });

        if (params.query?.trim()) {
            // Use Postgres full-text search (tsvector) for ranked results.
            // Falls back to ilike for single-character queries where tsquery would fail.
            const trimmed = params.query.trim();
            if (trimmed.length >= 2) {
                q = q.textSearch('search_vector', trimmed, { type: 'websearch' });
            } else {
                q = q.or(`name.ilike.%${trimmed}%,description.ilike.%${trimmed}%`);
            }
        }
        if (params.category && params.category !== 'all') {
            q = q.ilike('category', params.category);
        } else {
            const interestTags = await getCurrentUserInterestTags();
            if (interestTags.length > 0) {
                q = q.in('category', interestTags);
            }
        }
        if (params.city && params.city !== 'all') {
            const { data: cityData } = await supabase
                .from('cities')
                .select('id')
                .ilike('name', params.city)
                .single();
            if (cityData) q = q.eq('city_id', cityData.id);
            else return [];
        }

        const { data, error } = await q;
        if (error) return [];
        return (data || []).map((c: any) => ({
            ...c,
            city_name: c.cities?.name,
            cities: undefined,
        })) as Community[];
    },

    /** Admin-only: fetch ALL communities regardless of status */
    async findAllForAdmin(): Promise<Community[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('communities')
            .select('*, cities(name)')
            .order('created_at', { ascending: false });
        if (error) return [];
        return (data || []).map((c: any) => ({
            ...c,
            city_name: c.cities?.name,
            cities: undefined,
        })) as Community[];
    },

    async findPending(): Promise<Community[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('communities')
            .select('*, cities(name)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        if (error) return [];
        return (data || []).map((c: any) => ({
            ...c,
            city_name: c.cities?.name,
            cities: undefined,
        })) as Community[];
    },

    async findByCreator(userId: number): Promise<Community[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('communities')
            .select('*, cities(name)')
            .eq('organizer_id', userId)
            .order('created_at', { ascending: false });
        if (error) return [];
        return (data || []).map((c: any) => ({
            ...c,
            city_name: c.cities?.name,
            cities: undefined,
        })) as Community[];
    },

    async updateStatus(id: number, status: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('communities')
            .update({ status })
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    async update(id: number, data: Partial<Pick<Community, 'name' | 'description' | 'cover_image_url' | 'category'>>): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from('communities')
            .update(data)
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    async getMemberCount(communityId: number): Promise<number> {
        const supabase = await createClient();
        const { count, error } = await supabase
            .from('community_members')
            .select('*', { count: 'exact', head: true })
            .eq('community_id', communityId)
            .eq('status', 'approved');
        if (error) return 0;
        return count || 0;
    },
};
