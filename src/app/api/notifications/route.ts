import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { createClient } from '@/utils/supabase/server';
import { apiOk, apiError } from '@/lib/api-response';
import { createRateLimiter } from '@/lib/rate-limit';

const limiter = createRateLimiter({ windowMs: 60_000, max: 60 });

function getIp(req: NextRequest): string {
    return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

export async function GET(req: NextRequest) {
    if (!limiter.check(getIp(req))) return apiError('Too many requests', 429);

    const user = await getCurrentUser();
    if (!user) return apiError('Unauthorized', 401);

    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 50);
    const before = url.searchParams.get('before'); // cursor: ISO date string

    const supabase = await createClient();
    let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (before) {
        query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) return apiError('Failed to fetch notifications', 500);

    const items = data ?? [];
    return apiOk({
        items,
        nextCursor: items.length === limit ? items[items.length - 1]?.created_at : null,
    });
}

export async function PUT(req: NextRequest) {
    if (!limiter.check(getIp(req))) return apiError('Too many requests', 429);

    const user = await getCurrentUser();
    if (!user) return apiError('Unauthorized', 401);

    const supabase = await createClient();
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

    if (error) return apiError('Failed to update notifications', 500);

    return apiOk({ updated: true });
}
