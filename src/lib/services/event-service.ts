import { EventRepository } from '@/lib/repositories/event-repo';
import { EventParticipantRepository } from '@/lib/repositories/event-participant-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { AdminLogRepository } from '@/lib/repositories/admin-log-repo';
import { UserRepository } from '@/lib/repositories/user-repo';
import { sendEmail, eventRegistrationEmail, waitlistJoinedEmail, waitlistPromotedEmail } from '@/lib/email';
import type { KyotyEvent } from '@/types';

export const EventService = {
    async createEvent(data: {
        title: string;
        description?: string;
        community_id: number;
        city_id: number;
        location_text?: string;
        date: string;
        start_time?: string;
        end_time?: string;
        max_participants: number;
        pricing_model?: string;
        price_per_person?: number;
        cover_image_url?: string;
        visibility?: string;
        created_by: number;
        initialStatus?: string;
    }): Promise<KyotyEvent> {
        return EventRepository.create(data);
    },

    async approveEvent(eventId: number, adminId: number): Promise<void> {
        await EventRepository.updateStatus(eventId, 'approved');
        await AdminLogRepository.create({
            admin_id: adminId,
            action: 'approve_event',
            target_type: 'event',
            target_id: eventId,
        });
    },

    async rejectEvent(eventId: number, adminId: number): Promise<void> {
        await EventRepository.updateStatus(eventId, 'rejected');
        await AdminLogRepository.create({
            admin_id: adminId,
            action: 'reject_event',
            target_type: 'event',
            target_id: eventId,
        });
    },

    async joinEvent(eventId: number, userId: number): Promise<{ status: 'registered' | 'waitlisted'; position?: number }> {
        const event = await EventRepository.findById(eventId);
        if (!event) throw new Error('Event not found');

        if (!['approved', 'open'].includes(event.status)) {
            throw new Error('This event is not open for registration');
        }

        if (new Date(event.date) < new Date(new Date().toISOString().split('T')[0])) {
            throw new Error('This event has already taken place');
        }

        // Check if user is community member (members_only events enforce this)
        if (event.visibility === 'members_only') {
            const isMember = await CommunityMemberRepository.isMember(event.community_id, userId);
            if (!isMember) {
                throw new Error('You must be a community member to join this event');
            }
        }

        // Check if already registered or waitlisted
        const existing = await EventParticipantRepository.findExisting(eventId, userId);
        if (existing) {
            throw new Error('You are already registered for this event');
        }

        // Check capacity
        const currentCount = await EventParticipantRepository.countByEvent(eventId);
        if (currentCount >= event.max_participants) {
            await EventParticipantRepository.joinWaitlist(eventId, userId);
            const position = await EventParticipantRepository.getWaitlistPosition(eventId, userId);
            // Send waitlist confirmation email (non-blocking)
            const user = await UserRepository.findById(userId);
            if (user) {
                const dateStr = new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                sendEmail({
                    to: user.email,
                    subject: `You're on the waitlist for ${event.title}`,
                    html: waitlistJoinedEmail(user.name, event.title, dateStr, position, eventId),
                });
            }
            return { status: 'waitlisted', position };
        }

        await EventParticipantRepository.join(eventId, userId);
        // Send registration confirmation email (non-blocking)
        const user = await UserRepository.findById(userId);
        if (user) {
            const dateStr = new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
            sendEmail({
                to: user.email,
                subject: `You're registered for ${event.title}`,
                html: eventRegistrationEmail(user.name, event.title, dateStr, eventId),
            });
        }
        return { status: 'registered' };
    },

    async cancelRegistration(eventId: number, userId: number): Promise<void> {
        await EventParticipantRepository.cancel(eventId, userId);
        // Auto-promote from waitlist and notify
        const promoted = await EventParticipantRepository.promoteFromWaitlist(eventId);
        if (promoted) {
            const [promotedUser, event] = await Promise.all([
                UserRepository.findById(promoted.user_id),
                EventRepository.findById(eventId),
            ]);
            if (promotedUser && event) {
                const dateStr = new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                sendEmail({
                    to: promotedUser.email,
                    subject: `You're off the waitlist for ${event.title}!`,
                    html: waitlistPromotedEmail(promotedUser.name, event.title, dateStr, eventId),
                });
            }
        }
    },
};
