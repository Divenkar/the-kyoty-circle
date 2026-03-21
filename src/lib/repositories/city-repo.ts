import { createClient } from '@/utils/supabase/server';
import type { City } from '@/types';

export const CityRepository = {
    async getAll(): Promise<City[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('cities')
            .select('*')
            .order('name');
        if (error) throw new Error(error.message);
        return (data || []) as City[];
    },

    async getActive(): Promise<City[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('cities')
            .select('*')
            .eq('is_active', true)
            .order('name');
        if (error) throw new Error(error.message);
        return (data || []) as City[];
    },

    async getByName(name: string): Promise<City | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('cities')
            .select('*')
            .ilike('name', name)
            .single();
        if (error) return null;
        return data as City;
    },
};
