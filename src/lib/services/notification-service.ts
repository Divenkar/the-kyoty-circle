'use server';

import { createServiceClient } from '@/utils/supabase/server';

// ─── Notification Types ──────────────────────────────────────────────────────

export type NotificationType =
    | 'event_approved'
    | 'event_rejected'
    | 'event_registration'
    | 'event_cancelled'
    | 'event_updated'
    | 'waitlist_promoted'
    | 'community_approved'
    | 'community_rejected'
    | 'member_approved'
    | 'member_rejected'
    | 'join_request'
    | 'post_reaction'
    | 'post_comment'
    | 'event_comment'
    | 'general';

interface CreateNotificationParams {
    userId: number;
    type: NotificationType;
    title: string;
    body?: string;
    link?: string;
}

// ─── Core Service ────────────────────────────────────────────────────────────

/**
 * NotificationService creates in-app notification records.
 *
 * Uses the service-role client to bypass RLS — notifications are created
 * on behalf of the system, not the current user.
 *
 * All methods are non-blocking (fire-and-forget). Failures are logged
 * but never thrown to avoid breaking the parent action.
 */
export const NotificationService = {
    /** Create a single notification */
    async create(params: CreateNotificationParams): Promise<void> {
        try {
            const supabase = createServiceClient();
            await supabase.from('notifications').insert({
                user_id: params.userId,
                type: params.type,
                title: params.title,
                body: params.body ?? null,
                link: params.link ?? null,
            });
        } catch (err) {
            console.error('[NotificationService] Failed to create notification:', err);
        }
    },

    /** Create notifications for multiple users */
    async createBulk(
        userIds: number[],
        type: NotificationType,
        title: string,
        body?: string,
        link?: string,
    ): Promise<void> {
        if (userIds.length === 0) return;
        try {
            const supabase = createServiceClient();
            const rows = userIds.map((userId) => ({
                user_id: userId,
                type,
                title,
                body: body ?? null,
                link: link ?? null,
            }));
            await supabase.from('notifications').insert(rows);
        } catch (err) {
            console.error('[NotificationService] Failed to create bulk notifications:', err);
        }
    },

    // ─── Convenience methods ─────────────────────────────────────────────────

    /** Notify event creator when their event is approved */
    async eventApproved(userId: number, eventTitle: string, eventId: number): Promise<void> {
        await this.create({
            userId,
            type: 'event_approved',
            title: `Your event "${eventTitle}" has been approved`,
            body: 'Your event is now live and accepting registrations.',
            link: `/event/${eventId}`,
        });
    },

    /** Notify event creator when their event is rejected */
    async eventRejected(userId: number, eventTitle: string, eventId: number): Promise<void> {
        await this.create({
            userId,
            type: 'event_rejected',
            title: `Your event "${eventTitle}" was not approved`,
            body: 'Please review the guidelines and try again.',
            link: `/event/${eventId}`,
        });
    },

    /** Notify event organizer of a new registration */
    async eventRegistration(organizerId: number, userName: string, eventTitle: string, eventId: number): Promise<void> {
        await this.create({
            userId: organizerId,
            type: 'event_registration',
            title: `${userName} registered for "${eventTitle}"`,
            link: `/event/${eventId}/attendees`,
        });
    },

    /** Notify user they've been promoted from waitlist */
    async waitlistPromoted(userId: number, eventTitle: string, eventId: number): Promise<void> {
        await this.create({
            userId,
            type: 'waitlist_promoted',
            title: `You're off the waitlist for "${eventTitle}"!`,
            body: 'A spot opened up and you\'ve been automatically registered.',
            link: `/event/${eventId}/ticket`,
        });
    },

    /** Notify community organizer when their community is approved */
    async communityApproved(userId: number, communityName: string, communitySlug: string): Promise<void> {
        await this.create({
            userId,
            type: 'community_approved',
            title: `"${communityName}" has been approved`,
            body: 'Your community is now live on Kyoty.',
            link: `/community/${communitySlug}`,
        });
    },

    /** Notify community organizer when their community is rejected */
    async communityRejected(userId: number, communityName: string): Promise<void> {
        await this.create({
            userId,
            type: 'community_rejected',
            title: `"${communityName}" was not approved`,
            body: 'Please review the guidelines and try again.',
        });
    },

    /** Notify user when their community join request is approved */
    async memberApproved(userId: number, communityName: string, communitySlug: string): Promise<void> {
        await this.create({
            userId,
            type: 'member_approved',
            title: `You've been accepted to ${communityName}`,
            body: 'Welcome! You now have full access.',
            link: `/community/${communitySlug}`,
        });
    },

    /** Notify user when their community join request is rejected */
    async memberRejected(userId: number, communityName: string): Promise<void> {
        await this.create({
            userId,
            type: 'member_rejected',
            title: `Your request to join ${communityName} was not approved`,
            body: 'Explore other communities on Kyoty.',
            link: '/communities',
        });
    },

    /** Notify community organizer of a new join request */
    async joinRequest(organizerId: number, userName: string, communityName: string, communitySlug: string): Promise<void> {
        await this.create({
            userId: organizerId,
            type: 'join_request',
            title: `${userName} wants to join ${communityName}`,
            body: 'Review their application in the management panel.',
            link: `/community/${communitySlug}/manage`,
        });
    },

    /** Notify post author when someone reacts */
    async postReaction(postAuthorId: number, reactorName: string, communitySlug: string): Promise<void> {
        await this.create({
            userId: postAuthorId,
            type: 'post_reaction',
            title: `${reactorName} reacted to your post`,
            link: `/community/${communitySlug}/feed`,
        });
    },

    /** Notify post author when someone comments */
    async postComment(postAuthorId: number, commenterName: string, communitySlug: string): Promise<void> {
        await this.create({
            userId: postAuthorId,
            type: 'post_comment',
            title: `${commenterName} commented on your post`,
            link: `/community/${communitySlug}/feed`,
        });
    },

    /** Notify event organizer when someone comments on their event */
    async eventComment(organizerId: number, commenterName: string, eventTitle: string, eventId: number): Promise<void> {
        await this.create({
            userId: organizerId,
            type: 'event_comment',
            title: `${commenterName} commented on "${eventTitle}"`,
            link: `/event/${eventId}`,
        });
    },
};
