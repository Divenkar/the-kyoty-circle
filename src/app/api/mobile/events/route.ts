import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { apiOk, apiError } from '@/lib/api-response';

export async function GET(_req: NextRequest) {
    const supabase = await createClient();
    const { data: events, error } = await supabase
        .from('events')
        .select('id,title,location_text,date,start_time,price_per_person,communities(name)')
        .eq('status', 'approved')
        .order('date', { ascending: true })
        .limit(10);

    if (error) return apiError(error.message, 500);

    return apiOk(events ?? []);
}
