import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const { data: events, error } = await supabase
            .from('events')
            .select('id,title,location_text,date,start_time,price_per_person,communities(name)')
            .eq('status', 'approved')
            .order('date', { ascending: true })
            .limit(10);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: events });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
