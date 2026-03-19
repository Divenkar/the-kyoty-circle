import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json([], { status: 401 });

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        return NextResponse.json(data || []);
    } catch {
        return NextResponse.json([]);
    }
}

export async function PUT() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
