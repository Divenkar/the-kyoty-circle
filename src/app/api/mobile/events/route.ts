import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/lib/auth-server';
import { apiOk, apiError } from '@/lib/api-response';

export async function GET(_req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return apiError('Authentication required', 401);

    const supabase = await createClient();
    const { data: events, error } = await supabase
        .from('events')
        .select('id,title,location_text,date,start_time,price_per_person,communities(name)')
        .in('status', ['approved', 'open'])
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(10);

    if (error) return apiError(error.message, 500);

    return apiOk(events ?? []);
}
