'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { EventCommentsRepository, type EventComment } from '@/lib/repositories/event-comments-repo';
import { EventRepository } from '@/lib/repositories/event-repo';
import { NotificationService } from '@/lib/services/notification-service';
import type { ActionResponse } from '@/types';

export async function addCommentAction(
    eventId: number,
    content: string
): Promise<ActionResponse<EventComment>> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const trimmed = content.trim();
        if (!trimmed) return { success: false, error: 'Comment cannot be empty' };
        if (trimmed.length > 1000) return { success: false, error: 'Comment too long (max 1000 characters)' };

        const comment = await EventCommentsRepository.create(eventId, user.id, trimmed);

        // Notify event organizer of new comment (not self-comment)
        const event = await EventRepository.findById(eventId);
        if (event && event.created_by !== user.id) {
            NotificationService.eventComment(event.created_by, user.name, event.title, eventId);
        }

        return { success: true, data: comment };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to add comment' };
    }
}

export async function deleteCommentAction(
    commentId: number
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        await EventCommentsRepository.softDelete(commentId, user.id);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to delete comment' };
    }
}
