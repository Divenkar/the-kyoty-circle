import { createClient } from '@/utils/supabase/server';
import type { TicketTier } from '@/types';

export class TicketTierRepository {
    static async insertTiers(tiers: Omit<TicketTier, 'id' | 'created_at'>[]): Promise<TicketTier[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('ticket_tiers')
            .insert(tiers)
            .select();

        if (error) throw new Error(`Failed to insert ticket tiers: ${error.message}`);
        return data as TicketTier[];
    }

    static async findByEvent(eventId: number): Promise<TicketTier[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('ticket_tiers')
            .select('*')
            .eq('event_id', eventId);

        if (error) throw new Error(`Failed to fetch ticket tiers: ${error.message}`);
        return data as TicketTier[];
    }
}
