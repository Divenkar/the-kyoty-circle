import { getCurrentUser } from '@/lib/auth-server';
import { createClient } from '@/utils/supabase/server';
import { apiOk, apiError } from '@/lib/api-response';

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return apiError('Unauthorized', 401);

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) return apiError('Failed to fetch notifications', 500);

    return apiOk(data ?? []);
}

export async function PUT() {
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
