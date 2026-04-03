import { getCurrentUser, getCurrentUserId } from '@/lib/auth-server';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { EventRepository } from '@/lib/repositories/event-repo';
import { EventParticipantRepository } from '@/lib/repositories/event-participant-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { SavedEventsRepository } from '@/lib/repositories/saved-events-repo';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
    ArrowRight, Calendar, Clock, Compass, MessageSquare,
    Plus, Settings, Users, Ticket, ChevronRight, Globe, Bookmark, MapPin
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
}

const GRADIENT_PAIRS = [
    'from-violet-500 to-indigo-600',
    'from-indigo-500 to-blue-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
];

function gradientFor(str: string) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
    return GRADIENT_PAIRS[h % GRADIENT_PAIRS.length];
}

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
    disabled: 'bg-neutral-100 text-neutral-500',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ManagedCommunityCard({ community }: { community: any }) {
    const slug = community.slug || community.id;
    const grad = gradientFor(community.name);
    const isLive = community.status === 'active' || community.status === 'approved';

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-primary-200">
            {/* Cover strip */}
            <div className={`h-2 w-full bg-gradient-to-r ${grad}`} />

            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-sm font-bold text-white shadow-sm`}>
                        {initials(community.name)}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="truncate text-sm font-semibold text-neutral-900">{community.name}</h3>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[community.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                                {community.status}
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-neutral-500">
                            {community.city_name || community.category || 'Community'}
                            {community.member_count != null && ` · ${community.member_count} members`}
                        </p>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {isLive && (
                        <Link
                            href={`/community/${slug}/chat`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition hover:bg-primary-100"
                        >
                            <MessageSquare size={13} />
                            Chat
                        </Link>
                    )}
                    <Link
                        href={`/community/${slug}/manage`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-200"
                    >
                        <Settings size={13} />
                        Manage
                    </Link>
                    {isLive && (
                        <Link
                            href={`/community/${slug}/members`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-200"
                        >
                            <Users size={13} />
                            Members
                        </Link>
                    )}
                    <Link
                        href={`/community/${slug}`}
                        className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-neutral-400 transition hover:text-neutral-700"
                    >
                        View <ChevronRight size={13} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function MemberCommunityCard({ membership }: { membership: any }) {
    const community = membership.communities;
    if (!community) return null;
    const slug = community.slug || membership.community_id;
    const grad = gradientFor(community.name ?? '');

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-primary-200">
            <div className={`h-2 w-full bg-gradient-to-r ${grad}`} />

            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-sm font-bold text-white shadow-sm`}>
                        {initials(community.name ?? '?')}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-neutral-900">{community.name}</h3>
                        <p className="mt-0.5 text-xs text-neutral-500">
                            {community.category}
                            {community.member_count != null && ` · ${community.member_count} members`}
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                        href={`/community/${slug}/chat`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition hover:bg-primary-100"
                    >
                        <MessageSquare size={13} />
                        Chat
                    </Link>
                    <Link
                        href={`/community/${slug}`}
                        className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-neutral-400 transition hover:text-neutral-700"
                    >
                        View <ChevronRight size={13} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function UpcomingEventRow({ rsvp }: { rsvp: any }) {
    const event = rsvp.events;
    if (!event) return null;
    const dateStr = new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <Link
            href={`/event/${event.id || rsvp.event_id}`}
            className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white px-4 py-3.5 transition-all hover:border-primary-200 hover:shadow-sm"
        >
            {/* Date block */}
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
                    {dateStr}
                    {event.start_time && ` · ${event.start_time}`}
                    {event.communities?.name && ` · ${event.communities.name}`}
                </span>
            </div>

            <ArrowRight size={15} className="shrink-0 text-neutral-300" />
        </Link>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
    const user = await getCurrentUser();
    if (!user) {
        // If they have an auth session but no profile row, send to onboarding
        const authId = await getCurrentUserId();
        redirect(authId ? '/onboarding' : '/login');
    }
    if (!user.onboarding_completed) {
        redirect('/onboarding');
    }

    const [myCommunities, myEvents, upcomingRSVPs, myMemberships, savedEvents] = await Promise.all([
        CommunityRepository.findByCreator(user.id),
        EventRepository.findByCreator(user.id),
        EventParticipantRepository.listUpcomingByUser(user.id),
        CommunityMemberRepository.listByUser(user.id),
        SavedEventsRepository.listByUser(user.id),
    ]);

    const isAdmin = user.role === 'kyoty_admin' || user.role === 'admin';
    const canCreateEvents = user.role === 'community_admin' || isAdmin;

    // De-duplicate: don't show managed communities again in memberships section
    const managedIds = new Set(myCommunities.map((c) => c.id));
    const joinedMemberships = myMemberships.filter(
        (m: any) => !managedIds.has(m.community_id) && !managedIds.has(m.communities?.id)
    );

    const displayName = user.name || user.email?.split('@')[0] || 'there';
    const avatarInitials = initials(displayName);

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="border-b border-neutral-200 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.12),_transparent_50%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        {/* Avatar + name */}
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-base font-bold text-white shadow-md">
                                {avatarInitials}
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Dashboard</p>
                                <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">
                                    Hey, {displayName.split(' ')[0]}
                                </h1>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/create-community"
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                            >
                                <Plus size={15} />
                                New community
                            </Link>
                            {canCreateEvents && (
                                <Link
                                    href="/create-event"
                                    className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-primary-300"
                                >
                                    <Calendar size={15} />
                                    New event
                                </Link>
                            )}
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                                >
                                    Admin panel
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Stats strip */}
                    <div className="mt-6 flex flex-wrap gap-4 text-sm">
                        {[
                            { icon: Ticket, label: 'upcoming events', value: upcomingRSVPs.length, color: 'text-primary-600' },
                            { icon: Users, label: 'communities joined', value: joinedMemberships.length, color: 'text-violet-600' },
                            { icon: Settings, label: 'communities managed', value: myCommunities.length, color: 'text-green-600' },
                            { icon: Calendar, label: 'events hosted', value: myEvents.length, color: 'text-amber-600' },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-white px-4 py-2.5 shadow-sm">
                                <s.icon size={14} className={s.color} />
                                <span className="font-bold text-neutral-900">{s.value}</span>
                                <span className="text-neutral-500">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Body ─────────────────────────────────────────────────── */}
            <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6">

                {/* ── Communities I Manage ───────────────────────────── */}
                <section>
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-neutral-900">Communities I Manage</h2>
                            <p className="mt-0.5 text-xs text-neutral-500">Communities you created — chat, manage members, and track events.</p>
                        </div>
                        <Link href="/create-community" className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 transition hover:border-primary-300 hover:text-primary-700">
                            <Plus size={12} />
                            Create
                        </Link>
                    </div>

                    {myCommunities.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {myCommunities.map((c) => (
                                <ManagedCommunityCard key={c.id} community={c} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100">
                                <Settings size={22} className="text-neutral-400" />
                            </div>
                            <p className="text-sm font-medium text-neutral-600">You haven&apos;t created any communities yet</p>
                            <p className="mt-1 text-xs text-neutral-400">Start your own community and invite people around you.</p>
                            <Link
                                href="/create-community"
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                            >
                                <Plus size={14} />
                                Create a community
                            </Link>
                        </div>
                    )}
                </section>

                {/* ── Communities I've Joined ───────────────────────── */}
                <section>
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-neutral-900">Communities I&apos;ve Joined</h2>
                            <p className="mt-0.5 text-xs text-neutral-500">Jump straight into chat or browse events.</p>
                        </div>
                        <Link href="/communities" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                            Explore all →
                        </Link>
                    </div>

                    {joinedMemberships.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {joinedMemberships.map((m: any) => (
                                <MemberCommunityCard key={m.id} membership={m} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100">
                                <Users size={22} className="text-neutral-400" />
                            </div>
                            <p className="text-sm font-medium text-neutral-600">You haven&apos;t joined any communities yet</p>
                            <p className="mt-1 text-xs text-neutral-400">Discover communities in your city and start connecting.</p>
                            <Link
                                href="/communities"
                                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-primary-300"
                            >
                                <Compass size={14} />
                                Browse communities
                            </Link>
                        </div>
                    )}
                </section>

                {/* ── Upcoming Events ───────────────────────────────── */}
                <section>
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-neutral-900">Upcoming Events</h2>
                            <p className="mt-0.5 text-xs text-neutral-500">Events you&apos;ve RSVP&apos;d to.</p>
                        </div>
                        <Link href="/explore" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                            Find more →
                        </Link>
                    </div>

                    {upcomingRSVPs.length > 0 ? (
                        <div className="space-y-2">
                            {upcomingRSVPs.map((r: any) => (
                                <UpcomingEventRow key={r.id} rsvp={r} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100">
                                <Ticket size={22} className="text-neutral-400" />
                            </div>
                            <p className="text-sm font-medium text-neutral-600">No upcoming RSVPs</p>
                            <Link
                                href="/explore"
                                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-primary-300"
                            >
                                <Compass size={14} />
                                Explore events
                            </Link>
                        </div>
                    )}
                </section>

                {/* ── Saved Events ─────────────────────────────────── */}
                <section>
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-neutral-900">Saved Events</h2>
                            <p className="mt-0.5 text-xs text-neutral-500">Events you bookmarked for later.</p>
                        </div>
                        <Link href="/explore" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                            Find more →
                        </Link>
                    </div>

                    {savedEvents.length > 0 ? (
                        <div className="space-y-2">
                            {savedEvents.map((e: any) => {
                                const dateStr = new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                                return (
                                    <Link
                                        key={e.id}
                                        href={`/event/${e.id}`}
                                        className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white px-4 py-3.5 transition-all hover:border-primary-200 hover:shadow-sm"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-amber-50 text-center">
                                            <span className="text-[11px] font-semibold uppercase leading-none text-amber-500">
                                                {new Date(e.date).toLocaleDateString('en-IN', { month: 'short' })}
                                            </span>
                                            <span className="mt-0.5 text-lg font-extrabold leading-none text-amber-700">
                                                {new Date(e.date).getDate()}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold text-neutral-900">{e.title}</span>
                                            <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                                                <Clock size={11} />
                                                {dateStr}
                                                {e.start_time && ` · ${e.start_time}`}
                                                {e.communities?.name && ` · ${e.communities.name}`}
                                            </span>
                                        </div>
                                        <Bookmark size={14} className="shrink-0 fill-amber-400 text-amber-400" />
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100">
                                <Bookmark size={22} className="text-neutral-400" />
                            </div>
                            <p className="text-sm font-medium text-neutral-600">No saved events yet</p>
                            <p className="mt-1 text-xs text-neutral-400">
                                Tap the bookmark icon on any event to save it here.
                            </p>
                            <Link
                                href="/explore"
                                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-primary-300"
                            >
                                <Compass size={14} />
                                Explore events
                            </Link>
                        </div>
                    )}
                </section>

                {/* ── Explore CTA ───────────────────────────────────── */}
                <section>
                    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 px-6 py-8 text-white sm:px-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="mb-1 flex items-center gap-2">
                                    <Globe size={18} className="opacity-80" />
                                    <span className="text-xs font-semibold uppercase tracking-widest opacity-70">Discover</span>
                                </div>
                                <h3 className="text-xl font-extrabold">Find your next community</h3>
                                <p className="mt-1 text-sm text-primary-100/80 max-w-sm">
                                    Explore verified communities and curated events happening in your city.
                                </p>
                            </div>
                            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                                <Link
                                    href="/communities"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
                                >
                                    <Users size={15} />
                                    Browse communities
                                </Link>
                                <Link
                                    href="/explore"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                                >
                                    <Calendar size={15} />
                                    Explore events
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
