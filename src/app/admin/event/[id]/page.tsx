import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { EventRepository } from '@/lib/repositories/event-repo';
import { EventParticipantRepository } from '@/lib/repositories/event-participant-repo';
import { createClient } from '@/utils/supabase/server';
import { EventAdminClient } from './EventAdminClient';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdminEventDetailPage({ params }: Props) {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'kyoty_admin' && user.role !== 'admin')) redirect('/dashboard');

    const { id } = await params;
    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) notFound();

    const event = await EventRepository.findById(eventId);
    if (!event) notFound();

    const [participants, waitlisted, checkInStats] = await Promise.all([
        EventParticipantRepository.listByEvent(eventId),
        EventParticipantRepository.listWaitlistedByEvent(eventId),
        EventParticipantRepository.getCheckInStats(eventId),
    ]);

    // Fetch payments for this event
    const supabase = await createClient();
    const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

    return (
        <EventAdminClient
            event={event}
            participants={participants}
            waitlisted={waitlisted}
            checkInStats={checkInStats}
            payments={payments ?? []}
        />
    );
}
