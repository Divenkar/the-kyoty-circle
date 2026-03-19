'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { createClient } from '@/utils/supabase/server';
import type { ActionResponse } from '@/types';

export async function submitReviewAction(
    eventId: number,
    communityId: number,
    rating: number,
    comment: string
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        if (rating < 1 || rating > 5) return { success: false, error: 'Rating must be 1-5' };

        const supabase = await createClient();

        // Check if already reviewed
        const { data: existing } = await supabase
            .from('reviews')
            .select('id')
            .eq('event_id', eventId)
            .eq('user_id', user.id)
            .single();
        if (existing) return { success: false, error: 'You have already reviewed this event' };

        // Insert review
        const { error } = await supabase
            .from('reviews')
            .insert({
                event_id: eventId,
                community_id: communityId,
                user_id: user.id,
                rating,
                comment: comment.trim() || null,
            });
        if (error) throw new Error(error.message);

        // Update community rating
        const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('community_id', communityId);

        if (reviews && reviews.length > 0) {
            const avg = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
            await supabase
                .from('communities')
                .update({ rating_avg: Math.round(avg * 10) / 10, rating_count: reviews.length })
                .eq('id', communityId);
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to submit review' };
    }
}

export async function getReviewsAction(eventId: number): Promise<ActionResponse<any[]>> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('reviews')
            .select('*, kyoty_users(name, email)')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return { success: true, data: data || [] };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to get reviews' };
    }
}

export async function submitReportAction(
    targetType: string,
    targetId: number,
    reason: string,
    description?: string
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const supabase = await createClient();
        const { error } = await supabase
            .from('reports')
            .insert({
                reporter_id: user.id,
                target_type: targetType,
                target_id: targetId,
                reason,
                description: description?.trim() || null,
            });
        if (error) throw new Error(error.message);

        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to submit report' };
    }
}
