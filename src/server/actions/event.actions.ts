'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { EventService } from '@/lib/services/event-service';
import { EventRepository } from '@/lib/repositories/event-repo';
import type { ActionResponse, KyotyEvent } from '@/types';

export async function cloneEventAction(eventId: number): Promise<ActionResponse<KyotyEvent>> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const event = await EventRepository.findById(eventId);
        if (!event) return { success: false, error: 'Event not found' };

        const isOrganizer = event.created_by === user.id;
        const isPlatformAdmin = user.role === 'admin' || user.role === 'kyoty_admin';
        if (!isOrganizer && !isPlatformAdmin) {
            return { success: false, error: 'Only the event organiser can duplicate this event' };
        }

        const cloned = await EventRepository.clone(eventId, user.id);
        return { success: true, data: cloned };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to duplicate event' };
    }
}

export async function createEventAction(
    formData: FormData
): Promise<ActionResponse<KyotyEvent>> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        if (user.role !== 'community_admin' && user.role !== 'kyoty_admin' && user.role !== 'admin') {
            return { success: false, error: 'Only community admins can create events' };
        }

        const data = {
            title: formData.get('title') as string,
            description: (formData.get('description') as string) || undefined,
            community_id: Number(formData.get('community_id')),
            city_id: Number(formData.get('city_id')) || 6,
            location_text: ((formData.get('location_text') || formData.get('location')) as string) || undefined,
            date: ((formData.get('date') || formData.get('event_date')) as string) || '',
            start_time: ((formData.get('start_time') || formData.get('event_time')) as string) || undefined,
            end_time: (formData.get('end_time') as string) || ((formData.get('start_time') || formData.get('event_time')) as string) || undefined,
            max_participants: Number(formData.get('capacity')) || Number(formData.get('max_participants')) || 50,
            pricing_model: (formData.get('pricing_model') as string) || 'free',
            price_per_person: Number(formData.get('cost') || formData.get('price_per_person')) || 0,
            cover_image_url: (formData.get('cover_image_url') as string) || undefined,
            visibility: (formData.get('visibility') as string) || 'public',
            created_by: user.id,
        };

        const ticketTiersStr = formData.get('ticket_tiers') as string;
        let ticketTiers = [];
        if (ticketTiersStr) {
            try {
                ticketTiers = JSON.parse(ticketTiersStr);
                // Note: If tiered, we should calculate max_participants from sum of tier capacities
                if (data.pricing_model === 'tiered') {
                    data.max_participants = ticketTiers.reduce((sum: number, tier: any) => sum + Number(tier.capacity), 0);
                    // Base cost could be minimum tier price
                    data.price_per_person = Math.min(...ticketTiers.map((t: any) => Number(t.price)));
                }
            } catch (e) {
                console.error("Failed to parse ticket tiers", e);
            }
        }

        if (!data.title || !data.date || !data.community_id) {
            return { success: false, error: 'Title, date, and community are required' };
        }

        if (!data.start_time || !data.end_time) {
            return { success: false, error: 'Start and end times are required' };
        }

        if (data.max_participants < 1) {
            return { success: false, error: 'Capacity must be at least 1' };
        }

        const event = await EventService.createEvent(data);

        // Insert ticket tiers if any
        if (data.pricing_model === 'tiered' && ticketTiers.length > 0) {
            const tiersToInsert = ticketTiers.map((t: any) => ({
                event_id: event.id,
                name: String(t.name),
                capacity: Number(t.capacity),
                price: Number(t.price),
            }));
            const { TicketTierRepository } = await import('@/lib/repositories/ticket-tier-repo');
            await TicketTierRepository.insertTiers(tiersToInsert);
        }

        return { success: true, data: event };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to create event' };
    }
}

export async function joinEventAction(
    eventId: number
): Promise<ActionResponse<{ status: string; position?: number }>> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const result = await EventService.joinEvent(eventId, user.id);
        return { success: true, data: result };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to join event' };
    }
}

export async function cancelEventRegistrationAction(
    eventId: number
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        await EventService.cancelRegistration(eventId, user.id);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to cancel registration' };
    }
}
