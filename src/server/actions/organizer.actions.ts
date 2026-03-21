'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { EventRepository } from '@/lib/repositories/event-repo';
import { EventParticipantRepository } from '@/lib/repositories/event-participant-repo';
import { UserRepository } from '@/lib/repositories/user-repo';
import { sendEmail, organizerMessageEmail } from '@/lib/email';
import type { ActionResponse } from '@/types';

export async function getAttendeesAction(eventId: number): Promise<ActionResponse<any[]>> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        // Verify organizer
        const event = await EventRepository.findById(eventId);
        if (!event) return { success: false, error: 'Event not found' };
        if (event.created_by !== user.id && user.role !== 'admin' && user.role !== 'kyoty_admin') {
            return { success: false, error: 'Not authorized' };
        }

        const attendees = await EventParticipantRepository.listByEvent(eventId);
        return { success: true, data: attendees };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to get attendees' };
    }
}

export async function removeAttendeeAction(participantId: number, eventId: number): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const event = await EventRepository.findById(eventId);
        if (!event) return { success: false, error: 'Event not found' };
        if (event.created_by !== user.id && user.role !== 'admin' && user.role !== 'kyoty_admin') {
            return { success: false, error: 'Not authorized' };
        }

        await EventParticipantRepository.remove(participantId);
        // Auto-promote from waitlist after removal
        await EventParticipantRepository.promoteFromWaitlist(eventId);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to remove attendee' };
    }
}

export async function sendMessageAction(
    eventId: number,
    subject: string,
    body: string
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const event = await EventRepository.findById(eventId);
        if (!event) return { success: false, error: 'Event not found' };
        if (event.created_by !== user.id && user.role !== 'admin' && user.role !== 'kyoty_admin') {
            return { success: false, error: 'Not authorized' };
        }

        // Send email to every registered attendee
        const attendees = await EventParticipantRepository.listByEvent(eventId);
        await Promise.all(
            attendees.map(async (a: any) => {
                const attendeeUser = a.kyoty_users
                    ? a.kyoty_users
                    : await UserRepository.findById(a.user_id);
                if (attendeeUser?.email) {
                    await sendEmail({
                        to: attendeeUser.email,
                        subject: `[${event.title}] ${subject}`,
                        html: organizerMessageEmail(event.title, subject, body, eventId),
                    });
                }
            })
        );

        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to send message' };
    }
}

export async function checkInAction(eventId: number, userId: number): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const event = await EventRepository.findById(eventId);
        if (!event) return { success: false, error: 'Event not found' };
        if (event.created_by !== user.id && user.role !== 'admin' && user.role !== 'kyoty_admin') {
            return { success: false, error: 'Not authorized' };
        }

        await EventParticipantRepository.checkIn(eventId, userId);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to check in' };
    }
}
