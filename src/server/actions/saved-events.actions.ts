'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { SavedEventsRepository } from '@/lib/repositories/saved-events-repo';
import type { ActionResponse, EventWithCommunity } from '@/types';

export async function toggleSaveEventAction(
    eventId: number
): Promise<ActionResponse<{ saved: boolean }>> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const already = await SavedEventsRepository.isSaved(user.id, eventId);
        if (already) {
            await SavedEventsRepository.unsave(user.id, eventId);
            return { success: true, data: { saved: false } };
        } else {
            await SavedEventsRepository.save(user.id, eventId);
            return { success: true, data: { saved: true } };
        }
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to save event' };
    }
}

export async function getSavedEventsAction(): Promise<ActionResponse<EventWithCommunity[]>> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };
        const events = await SavedEventsRepository.listByUser(user.id);
        return { success: true, data: events };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch saved events' };
    }
}

export async function checkIsSavedAction(
    eventId: number
): Promise<ActionResponse<{ saved: boolean }>> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: true, data: { saved: false } };
        const saved = await SavedEventsRepository.isSaved(user.id, eventId);
        return { success: true, data: { saved } };
    } catch {
        return { success: true, data: { saved: false } };
    }
}
