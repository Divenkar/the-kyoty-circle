import { getCurrentUser } from '@/lib/auth-server';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { EventRepository } from '@/lib/repositories/event-repo';
import { EventParticipantRepository } from '@/lib/repositories/event-participant-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Calendar, Users, Plus, ArrowRight, Ticket, Clock, MapPin } from 'lucide-react';

export default async function DashboardPage() {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const myCommunities = await CommunityRepository.findByCreator(user.id);
    const myEvents = await EventRepository.findByCreator(user.id);
    const upcomingRSVPs = await EventParticipantRepository.listUpcomingByUser(user.id);
    const pastRSVPs = await EventParticipantRepository.listPastByUser(user.id);
    const myMemberships = await CommunityMemberRepository.listByUser(user.id);

    const canCreateEvents = user.role === 'community_admin' || user.role === 'kyoty_admin' || user.role === 'admin';

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                        Welcome back, {user.name || 'there'}
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Manage your communities, events, and RSVPs
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    <Link
                        href="/create-community"
                        className="flex items-center gap-4 p-5 bg-white border border-neutral-200 rounded-2xl hover:border-primary-300 hover:shadow-md transition-all duration-200 group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                            <Plus size={20} className="text-primary-600" />
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-neutral-900 block">Create Community</span>
                            <span className="text-xs text-neutral-500">Start hosting events</span>
                        </div>
                    </Link>

                    {canCreateEvents && (
                        <Link
                            href="/create-event"
                            className="flex items-center gap-4 p-5 bg-white border border-neutral-200 rounded-2xl hover:border-primary-300 hover:shadow-md transition-all duration-200 group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                <Calendar size={20} className="text-primary-600" />
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-neutral-900 block">Create Event</span>
                                <span className="text-xs text-neutral-500">Host a new event for your community</span>
                            </div>
                        </Link>
                    )}
                </div>

                {/* Upcoming RSVPs */}
                <section className="mb-10">
                    <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 mb-4">
                        <Ticket size={18} className="text-primary-600" />
                        Upcoming RSVPs ({upcomingRSVPs.length})
                    </h2>
                    {upcomingRSVPs.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingRSVPs.map((r: any) => (
                                <Link
                                    key={r.id}
                                    href={`/event/${r.events?.id || r.event_id}`}
                                    className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                            <Calendar size={16} className="text-green-600" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-semibold text-neutral-900 block">
                                                {r.events?.title || 'Event'}
                                            </span>
                                            <span className="text-xs text-neutral-500 flex items-center gap-2">
                                                <Clock size={10} />
                                                {new Date(r.events?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                {r.events?.start_time && ` · ${r.events.start_time}`}
                                                {r.events?.communities?.name && ` · ${r.events.communities.name}`}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight size={14} className="text-neutral-400" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white border border-neutral-200 rounded-2xl">
                            <Ticket size={28} className="text-neutral-300 mx-auto mb-3" />
                            <p className="text-neutral-500 text-sm">No upcoming RSVPs.</p>
                            <Link href="/explore" className="text-primary-600 text-sm font-medium hover:underline mt-1 inline-block">
                                Explore events →
                            </Link>
                        </div>
                    )}
                </section>

                {/* My Memberships */}
                <section className="mb-10">
                    <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 mb-4">
                        <Users size={18} className="text-primary-600" />
                        My Memberships ({myMemberships.length})
                    </h2>
                    {myMemberships.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {myMemberships.map((m: any) => (
                                <Link
                                    key={m.id}
                                    href={`/community/${m.communities?.slug || m.community_id}`}
                                    className="flex items-center gap-3 p-4 bg-white border border-neutral-200 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm">
                                        {(m.communities?.name || 'C')[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-semibold text-neutral-900 block truncate">{m.communities?.name}</span>
                                        <span className="text-xs text-neutral-500">{m.communities?.category} · {m.communities?.member_count || 0} members</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white border border-neutral-200 rounded-2xl">
                            <Users size={28} className="text-neutral-300 mx-auto mb-3" />
                            <p className="text-neutral-500 text-sm">You haven&apos;t joined any communities yet.</p>
                        </div>
                    )}
                </section>

                {/* My Communities (as organizer) */}
                <section className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                            <Users size={18} className="text-primary-600" />
                            My Communities
                        </h2>
                    </div>

                    {myCommunities.length > 0 ? (
                        <div className="space-y-3">
                            {myCommunities.map((c) => (
                                <Link
                                    key={c.id}
                                    href={`/community/${c.slug || c.id}`}
                                    className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm">
                                            {c.name[0]}
                                        </div>
                                        <div>
                                            <span className="text-sm font-semibold text-neutral-900 block">{c.name}</span>
                                            <span className="text-xs text-neutral-500">{c.city_name || c.category}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${c.status === 'approved' || c.status === 'active'
                                            ? 'bg-green-50 text-green-700'
                                            : c.status === 'pending'
                                                ? 'bg-amber-50 text-amber-700'
                                                : 'bg-red-50 text-red-700'
                                            }`}>
                                            {c.status}
                                        </span>
                                        <ArrowRight size={14} className="text-neutral-400" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white border border-neutral-200 rounded-2xl">
                            <Users size={28} className="text-neutral-300 mx-auto mb-3" />
                            <p className="text-neutral-500 text-sm">You haven&apos;t created any communities yet.</p>
                        </div>
                    )}
                </section>

                {/* My Events (as creator) */}
                <section>
                    <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 mb-4">
                        <Calendar size={18} className="text-primary-600" />
                        My Events
                    </h2>

                    {myEvents.length > 0 ? (
                        <div className="space-y-3">
                            {myEvents.map((e) => (
                                <Link
                                    key={e.id}
                                    href={`/event/${e.id}`}
                                    className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all"
                                >
                                    <div>
                                        <span className="text-sm font-semibold text-neutral-900 block">{e.title}</span>
                                        <span className="text-xs text-neutral-500">
                                            {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            {e.communities?.name && ` · ${e.communities.name}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${e.status === 'approved' || e.status === 'open'
                                            ? 'bg-green-50 text-green-700'
                                            : e.status === 'pending'
                                                ? 'bg-amber-50 text-amber-700'
                                                : 'bg-red-50 text-red-700'
                                            }`}>
                                            {e.status}
                                        </span>
                                        <ArrowRight size={14} className="text-neutral-400" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white border border-neutral-200 rounded-2xl">
                            <Calendar size={28} className="text-neutral-300 mx-auto mb-3" />
                            <p className="text-neutral-500 text-sm">No events created yet.</p>
                        </div>
                    )}
                </section>

                {/* Past Events */}
                {pastRSVPs.length > 0 && (
                    <section className="mt-10">
                        <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 mb-4">
                            <Clock size={18} className="text-neutral-400" />
                            Past Events ({pastRSVPs.length})
                        </h2>
                        <div className="space-y-3">
                            {pastRSVPs.slice(0, 5).map((r: any) => (
                                <Link
                                    key={r.id}
                                    href={`/event/${r.events?.id || r.event_id}`}
                                    className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 transition-all opacity-75"
                                >
                                    <div>
                                        <span className="text-sm font-medium text-neutral-700 block">{r.events?.title || 'Event'}</span>
                                        <span className="text-xs text-neutral-400">
                                            {new Date(r.events?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {r.events?.communities?.name && ` · ${r.events.communities.name}`}
                                        </span>
                                    </div>
                                    <ArrowRight size={14} className="text-neutral-300" />
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
