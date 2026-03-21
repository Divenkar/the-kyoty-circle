import { EventRepository } from '@/lib/repositories/event-repo';
import { EventParticipantRepository } from '@/lib/repositories/event-participant-repo';
import { getCurrentUser } from '@/lib/auth-server';
import { QRTicket } from './QRTicket';
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle2, Clock3 } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function TicketPage({ params }: Props) {
    const { id } = await params;

    const [event, currentUser] = await Promise.all([
        EventRepository.findById(Number(id)),
        getCurrentUser(),
    ]);

    if (!event) notFound();
    if (!currentUser) redirect(`/login?next=/event/${id}/ticket`);

    // Check if the user is registered
    const participant = await EventParticipantRepository.findExisting(event.id, currentUser.id);

    if (!participant) {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4">
                <div className="max-w-sm w-full bg-white rounded-2xl border border-neutral-200 p-8 text-center shadow-sm">
                    <Users size={36} className="text-neutral-300 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-neutral-900">No ticket found</h2>
                    <p className="mt-2 text-sm text-neutral-500">
                        You are not registered for this event.
                    </p>
                    <Link
                        href={`/event/${id}`}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
                    >
                        View Event
                    </Link>
                </div>
            </div>
        );
    }

    const isWaitlisted = participant.status === 'waitlisted';
    const isCheckedIn = !!participant.checked_in_at;

    const eventDate = new Date(event.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    // QR data encodes participant verification info
    const qrData = `KYOTY:event=${event.id}&user=${currentUser.id}&participant=${participant.id}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm">
                {/* Back */}
                <Link
                    href={`/event/${id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-800 transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Back to event
                </Link>

                {/* Ticket card */}
                <div className="bg-white rounded-3xl border border-neutral-200 shadow-lg overflow-hidden">
                    {/* Top strip */}
                    <div className="bg-gradient-to-r from-primary-600 to-indigo-600 px-6 py-5 text-white">
                        <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
                            {isWaitlisted ? 'Waitlisted' : 'Event Ticket'}
                        </p>
                        <h1 className="text-xl font-bold leading-tight">{event.title}</h1>
                        {event.communities?.name && (
                            <p className="mt-1 text-sm opacity-80">{event.communities.name}</p>
                        )}
                    </div>

                    {/* Dashed divider */}
                    <div className="relative border-t border-dashed border-neutral-200 mx-6">
                        <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-primary-50 via-white to-indigo-50" />
                        <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-primary-50 via-white to-indigo-50" />
                    </div>

                    {/* Details */}
                    <div className="px-6 pt-5 pb-4 space-y-3 text-sm text-neutral-600">
                        <div className="flex items-center gap-2.5">
                            <Calendar size={15} className="text-primary-500 shrink-0" />
                            <span>{eventDate}</span>
                        </div>
                        {event.start_time && (
                            <div className="flex items-center gap-2.5">
                                <Clock size={15} className="text-primary-500 shrink-0" />
                                <span>{event.start_time}{event.end_time ? ` – ${event.end_time}` : ''}</span>
                            </div>
                        )}
                        {event.location_text && (
                            <div className="flex items-center gap-2.5">
                                <MapPin size={15} className="text-primary-500 shrink-0" />
                                <span className="line-clamp-2">{event.location_text}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2.5">
                            <Users size={15} className="text-primary-500 shrink-0" />
                            <span className="font-semibold text-neutral-800">{currentUser.name}</span>
                        </div>
                    </div>

                    {/* Status banner */}
                    {isWaitlisted ? (
                        <div className="mx-6 mb-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5">
                            <Clock3 size={15} className="text-amber-600 shrink-0" />
                            <span className="text-sm font-medium text-amber-700">
                                You&apos;re on the waitlist
                                {participant.waitlist_position ? ` · Position #${participant.waitlist_position}` : ''}
                            </span>
                        </div>
                    ) : isCheckedIn ? (
                        <div className="mx-6 mb-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5">
                            <CheckCircle2 size={15} className="text-green-600 shrink-0" />
                            <span className="text-sm font-medium text-green-700">Checked in</span>
                        </div>
                    ) : null}

                    {/* QR Code — only for registered participants */}
                    {!isWaitlisted && (
                        <div className="border-t border-dashed border-neutral-200 mx-6 pb-6 pt-5 flex flex-col items-center">
                            <QRTicket
                                qrData={qrData}
                                eventTitle={event.title}
                                userName={currentUser.name}
                                eventDate={eventDate}
                                eventTime={event.start_time}
                                location={event.location_text}
                            />
                        </div>
                    )}
                </div>

                <p className="mt-5 text-center text-xs text-neutral-400">
                    Ticket ID: {participant.id} · {event.is_paid ? `₹${event.price_per_person}` : 'Free Event'}
                </p>
            </div>
        </div>
    );
}
