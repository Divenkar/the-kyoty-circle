import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { EventService } from '@/lib/services/event-service';
import { apiOk, apiError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return apiError('Authentication required', 401);

    let eventId: number;
    try {
        const body = await req.json();
        eventId = Number(body.eventId);
        if (!eventId || isNaN(eventId)) {
            return apiError('Valid eventId is required', 400);
        }
    } catch {
        return apiError('Invalid request body', 400);
    }

    try {
        const result = await EventService.joinEvent(eventId, user.id);
        return apiOk(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to join event';
        return apiError(message, 400);
    }
}
