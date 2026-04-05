import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { EventRepository } from '@/lib/repositories/event-repo';
import { EventParticipantRepository } from '@/lib/repositories/event-participant-repo';
import Link from 'next/link';
import {
    Calendar, Plus, Users, Clock, MapPin,
    ChevronRight, ExternalLink, Settings,
} from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
    draft: 'bg-neutral-100 text-neutral-500',
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    open: 'bg-blue-100 text-blue-700',
    full: 'bg-violet-100 text-violet-700',
    completed: 'bg-neutral-100 text-neutral-600',
    cancelled: 'bg-red-100 text-red-600',
    rejected: 'bg-red-100 text-red-600',
};

export default async function DashboardEventsPage() {
    const user = await getCurrentUser();
    if (!user) redirect('/login');
    if (!user.onboarding_completed) redirect('/onboarding');

    const isAdmin = user.role === 'kyoty_admin' || user.role === 'admin';
    const canCreateEvents = user.role === 'community_admin' || isAdmin;

    const [myEvents, pastRsvps, upcomingRsvps] = await Promise.all([
        EventRepository.findByCreator(user.id).catch(() => []),
        EventParticipantRepository.listPastByUser(user.id).catch(() => []),
        EventParticipantRepository.listUpcomingByUser(user.id).catch(() => []),
    ]);

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-10">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
                                Dashboard
                            </Link>
                            <ChevronRight size={13} className="text-neutral-300" />
                            <span className="text-sm font-medium text-neutral-900">My Events</span>
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900">My Events</h1>
                    </div>
                    {canCreateEvents && (
                        <Link
                            href="/create-event"
                            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                        >
                            <Plus size={15} />
                            New event
                        </Link>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                        <p className="text-2xl font-bold text-neutral-900">{myEvents.length}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">Events Created</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                        <p className="text-2xl font-bold text-neutral-900">{upcomingRsvps.length}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">Upcoming RSVPs</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                        <p className="text-2xl font-bold text-neutral-900">{pastRsvps.length}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">Past Events</p>
                    </div>
                </div>

                {/* Events I Created */}
                {canCreateEvents && (
                    <section>
                        <h2 className="text-base font-bold text-neutral-900 mb-4 flex items-center gap-2">
                            <Settings size={16} className="text-neutral-500" />
                            Events I Created
                        </h2>
                        {myEvents.length > 0 ? (
                            <div className="space-y-3">
                                {myEvents.map(event => {
                                    const dateStr = new Date(event.date).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                    });
                                    return (
                                        <div key={event.id} className="bg-white border border-neutral-200 rounded-2xl p-4 hover:border-primary-200 hover:shadow-sm transition-all">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <h3 className="text-sm font-semibold text-neutral-900 truncate">{event.title}</h3>
                                                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_COLOR[event.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                                                            {event.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                                                        <span className="flex items-center gap-1"><Calendar size={11} /> {dateStr}</span>
                                                        {event.start_time && <span className="flex items-center gap-1"><Clock size={11} /> {event.start_time}</span>}
                                                        {event.location_text && <span className="flex items-center gap-1"><MapPin size={11} /> {event.location_text}</span>}
                                                        <span className="flex items-center gap-1"><Users size={11} /> {event.registered_count}/{event.max_participants}</span>
                                                    </div>
                                                    {event.communities && (
                                                        <p className="text-xs text-neutral-400 mt-1">{event.communities.name}</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-1.5 shrink-0">
                                                    <Link
                                                        href={`/event/${event.id}/manage`}
                                                        className="p-2 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
                                                        title="Manage"
                                                    >
                                                        <Settings size={14} />
                                                    </Link>
                                                    <Link
                                                        href={`/event/${event.id}`}
                                                        className="p-2 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                                        title="View"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white border border-dashed border-neutral-300 rounded-2xl py-10 text-center">
                                <p className="text-sm text-neutral-600 font-medium">You haven&apos;t created any events yet</p>
                                <Link
                                    href="/create-event"
                                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                                >
                                    <Plus size={14} /> Create an event
                                </Link>
                            </div>
                        )}
                    </section>
                )}

                {/* Upcoming RSVPs */}
                <section>
                    <h2 className="text-base font-bold text-neutral-900 mb-4 flex items-center gap-2">
                        <Calendar size={16} className="text-primary-600" />
                        Upcoming RSVPs
                    </h2>
                    {upcomingRsvps.length > 0 ? (
                        <div className="space-y-2">
                            {upcomingRsvps.map((r: any) => {
                                const event = r.events;
                                if (!event) return null;
                                return (
                                    <Link
                                        key={r.id}
                                        href={`/event/${event.id || r.event_id}`}
                                        className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white px-4 py-3.5 transition-all hover:border-primary-200 hover:shadow-sm"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-50 text-center">
                                            <span className="text-[11px] font-semibold uppercase leading-none text-primary-500">
                                                {new Date(event.date).toLocaleDateString('en-IN', { month: 'short' })}
                                            </span>
                                            <span className="mt-0.5 text-lg font-extrabold leading-none text-primary-700">
                                                {new Date(event.date).getDate()}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold text-neutral-900">{event.title}</span>
                                            <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                                                <Clock size={11} />
                                                {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                {event.start_time && ` · ${event.start_time}`}
                                            </span>
                                        </div>
                                        <ChevronRight size={14} className="shrink-0 text-neutral-300" />
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white border border-dashed border-neutral-300 rounded-2xl py-10 text-center">
                            <p className="text-sm text-neutral-600 font-medium">No upcoming events</p>
                            <Link
                                href="/explore"
                                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-primary-300"
                            >
                                Explore events
                            </Link>
                        </div>
                    )}
                </section>

                {/* Past Events */}
                <section>
                    <h2 className="text-base font-bold text-neutral-900 mb-4 flex items-center gap-2">
                        <Clock size={16} className="text-neutral-500" />
                        Past Events
                    </h2>
                    {pastRsvps.length > 0 ? (
                        <div className="space-y-2">
                            {pastRsvps.map((r: any) => {
                                const event = r.events;
                                if (!event) return null;
                                return (
                                    <Link
                                        key={r.id}
                                        href={`/event/${event.id || r.event_id}`}
                                        className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white px-4 py-3.5 transition-all hover:border-neutral-200 opacity-80"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-neutral-100 text-center">
                                            <span className="text-[11px] font-semibold uppercase leading-none text-neutral-500">
                                                {new Date(event.date).toLocaleDateString('en-IN', { month: 'short' })}
                                            </span>
                                            <span className="mt-0.5 text-lg font-extrabold leading-none text-neutral-600">
                                                {new Date(event.date).getDate()}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold text-neutral-700">{event.title}</span>
                                            <span className="text-xs text-neutral-400">
                                                {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <ChevronRight size={14} className="shrink-0 text-neutral-300" />
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white border border-dashed border-neutral-300 rounded-2xl py-10 text-center">
                            <p className="text-sm text-neutral-400">No past events yet.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
