import { getCurrentUser } from '@/lib/auth-server';
import { EventRepository } from '@/lib/repositories/event-repo';
import { EventParticipantRepository } from '@/lib/repositories/event-participant-repo';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Clock, Download, Mail } from 'lucide-react';
import { ManageActions } from './ManageActions';
import { DuplicateEventButton } from './DuplicateEventButton';

export default async function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const event = await EventRepository.findById(Number(id));
    if (!event) redirect('/explore');

    // Only organizer or admin can manage
    if (event.created_by !== user.id && user.role !== 'admin' && user.role !== 'kyoty_admin') {
        redirect(`/event/${id}`);
    }

    const attendees = await EventParticipantRepository.listByEvent(Number(id));
    const waitlisted = await EventParticipantRepository.listWaitlistedByEvent(Number(id));
    const checkInStats = await EventParticipantRepository.getCheckInStats(Number(id));

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                {/* Header */}
                <Link
                    href={`/event/${id}`}
                    className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Event
                </Link>

                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">{event.title}</h1>
                        <p className="text-neutral-500 mt-1">
                            {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            {event.start_time && ` · ${event.start_time}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <DuplicateEventButton eventId={Number(id)} />
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary-600">{checkInStats.checkedIn}/{checkInStats.total}</div>
                            <div className="text-xs text-neutral-500">Checked in</div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
                        <div className="text-2xl font-bold text-neutral-900">{attendees.length}</div>
                        <div className="text-xs text-neutral-500 mt-1">Registered</div>
                    </div>
                    <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
                        <div className="text-2xl font-bold text-amber-600">{waitlisted.length}</div>
                        <div className="text-xs text-neutral-500 mt-1">Waitlisted</div>
                    </div>
                    <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{checkInStats.checkedIn}</div>
                        <div className="text-xs text-neutral-500 mt-1">Checked In</div>
                    </div>
                </div>

                {/* Client component for interactive actions */}
                <ManageActions
                    eventId={Number(id)}
                    attendees={attendees as any[]}
                    waitlisted={waitlisted as any[]}
                />
            </div>
        </div>
    );
}
