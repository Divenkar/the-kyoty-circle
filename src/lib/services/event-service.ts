import { EventRepository } from '@/lib/repositories/event-repo';
import { EventParticipantRepository } from '@/lib/repositories/event-participant-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { AdminLogRepository } from '@/lib/repositories/admin-log-repo';
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
        created_by: number;
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

        // Check if user is community member
        const isMember = await CommunityMemberRepository.isMember(event.community_id, userId);
        if (!isMember) {
            throw new Error('You must be a community member to join this event');
        }

        // Check if already registered or waitlisted
        const existing = await EventParticipantRepository.findExisting(eventId, userId);
        if (existing) {
            throw new Error('You are already registered for this event');
        }

        // Check capacity
        const currentCount = await EventParticipantRepository.countByEvent(eventId);
        if (currentCount >= event.max_participants) {
            // Waitlist the user instead of rejecting
            await EventParticipantRepository.joinWaitlist(eventId, userId);
            const position = await EventParticipantRepository.getWaitlistPosition(eventId, userId);
            return { status: 'waitlisted', position };
        }

        await EventParticipantRepository.join(eventId, userId);
        return { status: 'registered' };
    },

    async cancelRegistration(eventId: number, userId: number): Promise<void> {
        await EventParticipantRepository.cancel(eventId, userId);
        // Auto-promote from waitlist
        await EventParticipantRepository.promoteFromWaitlist(eventId);
    },
};
