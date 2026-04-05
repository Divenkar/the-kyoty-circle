import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, CheckCircle, Compass, MapPin, Shield, Sparkles, Users, Rss, Bell, LayoutDashboard, Search, Star, Zap, Heart, TrendingUp, Pencil, ShieldCheck, Linkedin, Instagram, Camera } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth-server';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { EventParticipantRepository } from '@/lib/repositories/event-participant-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { CityRepository } from '@/lib/repositories/city-repo';
import type { City } from '@/types';

// Fallback if DB fetch fails
const FALLBACK_CITIES = [
  { name: 'Noida', is_active: true },
  { name: 'Delhi', is_active: false },
  { name: 'Gurgaon', is_active: false },
  { name: 'Bangalore', is_active: false },
];

const VALUE_PROPS = [
  {
    icon: Shield,
    title: 'Verified social proof',
    desc: 'Every organizer links their LinkedIn or Instagram, so you know exactly who is hosting before you show up.',
    gradient: 'from-primary-500 to-primary-700',
  },
  {
    icon: Users,
    title: 'Community-led experiences',
    desc: 'Events come from real communities with recurring members — not one-off listings from strangers.',
    gradient: 'from-violet-500 to-primary-600',
  },
  {
    icon: Calendar,
    title: 'Curated event discovery',
    desc: 'Filter by interest, price, and date to find events that match your schedule and energy — no noise.',
    gradient: 'from-amber-400 to-orange-500',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Browse communities',
    desc: 'Explore verified communities across categories like fitness, tech, arts, and more — all in your city.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Apply to join',
    desc: 'Request to join communities you love. Organizers review and approve members to keep quality high.',
    icon: Users,
  },
  {
    step: '03',
    title: 'Attend real events',
    desc: 'RSVP for community-hosted events, meet like-minded people, and build your offline social life.',
    icon: Star,
  },
];

function initials(name: string) {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

// ─── Personalized Home (authenticated) ───────────────────────────────────────

async function PersonalizedHome({ user }: { user: Awaited<ReturnType<typeof getCurrentUser>> & object }) {
    const displayName = (user as any).name?.split(' ')[0] || 'there';
    const fullName = (user as any).name || 'there';
    const interestTags: string[] = (user as any).interest_tags ?? [];
    const avatarUrl: string | undefined = (user as any).avatar_url;
    const socialType: string | null = (user as any).social_proof_type ?? null;
    const socialLink: string | null = (user as any).social_proof_link ?? null;
    const isVerified = !!socialType && !!socialLink;
    const memberSince = new Date((user as any).created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    const [upcomingRSVPs, memberships] = await Promise.all([
        EventParticipantRepository.listUpcomingByUser((user as any).id),
        CommunityMemberRepository.listByUser((user as any).id),
    ]);

    const approvedMemberships = memberships.filter((m: any) => m.status === 'approved');

    // Suggested communities based on interests
    let suggestedCommunities: any[] = [];
    if (interestTags.length > 0) {
        const all = await CommunityRepository.search({ city: 'all', query: '', category: 'all' });
        const lowerTags = interestTags.map((t) => t.toLowerCase());
        const memberIds = new Set(approvedMemberships.map((m: any) => m.community_id || m.communities?.id));
        suggestedCommunities = all
            .filter((c) => !memberIds.has(c.id) && lowerTags.some((t) => c.category?.toLowerCase().includes(t)))
            .slice(0, 3);
    }

    const hasContent = approvedMemberships.length > 0 || upcomingRSVPs.length > 0 || suggestedCommunities.length > 0;

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* ── Profile Hero ─────────────────────────────────────────── */}
            <div className="relative overflow-hidden border-b border-neutral-200/60">
                {/* Background decorations */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(108,71,255,0.08),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.06),_transparent_50%)]" />
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary-200/20 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-violet-200/15 blur-3xl" />

                <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
                    {/* Mobile: stacked layout / Desktop: side by side */}
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                        {/* Left: Avatar + User info */}
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                            {/* Avatar */}
                            <div className="relative shrink-0 group">
                                <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-white bg-gradient-to-br from-primary-100 to-primary-50 shadow-lg shadow-primary-600/10 sm:h-24 sm:w-24">
                                    {avatarUrl ? (
                                        <Image
                                            src={avatarUrl}
                                            alt={fullName}
                                            width={96}
                                            height={96}
                                            className="h-full w-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary-600 sm:text-3xl">
                                            {initials(fullName)}
                                        </div>
                                    )}
                                </div>
                                {isVerified && (
                                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow-sm sm:h-7 sm:w-7">
                                        <ShieldCheck size={12} className="text-white" />
                                    </div>
                                )}
                                {/* Upload prompt when no avatar */}
                                {!avatarUrl && (
                                    <Link
                                        href="/profile/edit"
                                        className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100"
                                    >
                                        <Camera size={20} className="text-white" />
                                    </Link>
                                )}
                            </div>

                            {/* Name + meta */}
                            <div className="text-center sm:text-left">
                                <p className="text-xs font-semibold uppercase tracking-widest text-primary-500">Welcome back</p>
                                <h1 className="mt-1 font-display text-2xl text-neutral-900 sm:text-3xl lg:text-4xl">
                                    Hey, {displayName}
                                </h1>

                                {/* Member since + city */}
                                <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-neutral-400 sm:justify-start">
                                    <span>Member since {memberSince}</span>
                                    {(user as any).default_city && (
                                        <span className="flex items-center gap-1">
                                            <MapPin size={11} />
                                            {(user as any).default_city}
                                        </span>
                                    )}
                                </div>

                                {/* Verification badge */}
                                {isVerified && (
                                    <a
                                        href={socialLink!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700 transition hover:bg-green-100"
                                    >
                                        {socialType === 'linkedin' ? <Linkedin size={11} /> : <Instagram size={11} />}
                                        Verified via {socialType === 'linkedin' ? 'LinkedIn' : 'Instagram'}
                                    </a>
                                )}

                                {/* Interest tags */}
                                {interestTags.length > 0 && (
                                    <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                                        {interestTags.slice(0, 4).map((tag) => (
                                            <span key={tag} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 ring-1 ring-primary-100">
                                                {tag}
                                            </span>
                                        ))}
                                        {interestTags.length > 4 && (
                                            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
                                                +{interestTags.length - 4}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Complete profile nudge */}
                                {(!avatarUrl || !isVerified || interestTags.length === 0) && (
                                    <Link
                                        href="/profile/edit"
                                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                    >
                                        <Pencil size={11} />
                                        {!avatarUrl ? 'Add a profile photo' : !isVerified ? 'Verify your profile' : 'Add your interests'}
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Right: Quick actions */}
                        <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:border-primary-300 hover:shadow-md sm:px-5 sm:py-2.5"
                            >
                                <LayoutDashboard size={15} />
                                Dashboard
                            </Link>
                            <Link
                                href="/activity"
                                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:border-primary-300 hover:shadow-md sm:px-5 sm:py-2.5"
                            >
                                <Bell size={15} />
                                Activity
                            </Link>
                            <Link
                                href="/profile/edit"
                                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:border-primary-300 hover:shadow-md sm:px-5 sm:py-2.5"
                            >
                                <Pencil size={15} />
                                <span className="hidden sm:inline">Edit Profile</span>
                                <span className="sm:hidden">Edit</span>
                            </Link>
                        </div>
                    </div>

                    {/* Stats strip — mobile: horizontal scroll, desktop: flex */}
                    <div className="mt-6 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1 sm:flex-wrap sm:overflow-visible">
                            {[
                                { icon: Users, label: 'communities', value: approvedMemberships.length, color: 'text-primary-600' },
                                { icon: Calendar, label: 'upcoming', value: upcomingRSVPs.length, color: 'text-violet-600' },
                                { icon: Sparkles, label: 'interests', value: interestTags.length, color: 'text-amber-600' },
                            ].map((s) => (
                                <div key={s.label} className="flex shrink-0 items-center gap-2 rounded-xl border border-neutral-100 bg-white px-4 py-2.5 shadow-sm text-sm">
                                    <s.icon size={14} className={s.color} />
                                    <span className="font-bold text-neutral-900">{s.value}</span>
                                    <span className="text-neutral-500 whitespace-nowrap">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 space-y-10 sm:space-y-12">

                {/* Suggested Communities */}
                {suggestedCommunities.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-center gap-2.5 sm:mb-5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100">
                                <Sparkles size={14} className="text-primary-600" />
                            </div>
                            <h2 className="text-sm font-bold text-neutral-900 sm:text-base">Suggested for you</h2>
                            <span className="hidden rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500 sm:inline">based on interests</span>
                        </div>
                        {/* Mobile: horizontal scroll / Desktop: grid */}
                        <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
                            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0">
                                {suggestedCommunities.map((c: any) => (
                                    <Link
                                        key={c.id}
                                        href={`/community/${c.slug || c.id}`}
                                        className="group relative flex w-[260px] shrink-0 flex-col gap-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-cardHover sm:w-auto sm:p-5"
                                    >
                                        <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-bl from-primary-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 text-sm font-bold text-primary-700 ring-1 ring-primary-200/50 sm:h-11 sm:w-11">
                                                {(c.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">{c.name}</p>
                                                <p className="text-xs text-neutral-500">{c.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-neutral-500">
                                            <span className="flex items-center gap-1">
                                                <Users size={11} />
                                                {c.member_count || 0} members
                                            </span>
                                            <span className="text-primary-600 font-semibold group-hover:translate-x-0.5 transition-transform">View &rarr;</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="mt-3 text-right sm:mt-4">
                            <Link href="/communities" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                                Browse all communities &rarr;
                            </Link>
                        </div>
                    </section>
                )}

                {/* My Communities */}
                {approvedMemberships.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-center justify-between sm:mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100">
                                    <Users size={14} className="text-primary-600" />
                                </div>
                                <h2 className="text-sm font-bold text-neutral-900 sm:text-base">My Communities</h2>
                                <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-bold text-primary-600">{approvedMemberships.length}</span>
                            </div>
                            <Link href="/dashboard" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                                View all &rarr;
                            </Link>
                        </div>
                        <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                            {approvedMemberships.slice(0, 4).map((m: any) => {
                                const community = m.communities;
                                if (!community) return null;
                                const slug = community.slug || m.community_id;
                                return (
                                    <Link
                                        key={m.id}
                                        href={`/community/${slug}/feed`}
                                        className="group flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-cardHover sm:gap-3.5 sm:px-5 sm:py-4"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 text-sm font-bold text-primary-700 ring-1 ring-primary-200/50 sm:h-10 sm:w-10">
                                            {(community.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">{community.name}</p>
                                            <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                                                <Rss size={10} />
                                                Open feed
                                            </p>
                                        </div>
                                        <ArrowRight size={14} className="shrink-0 text-neutral-300 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Upcoming Events */}
                {upcomingRSVPs.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-center justify-between sm:mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100">
                                    <Calendar size={14} className="text-primary-600" />
                                </div>
                                <h2 className="text-sm font-bold text-neutral-900 sm:text-base">Upcoming Events</h2>
                                <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-bold text-primary-600">{upcomingRSVPs.length}</span>
                            </div>
                            <Link href="/explore" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                                Find more &rarr;
                            </Link>
                        </div>
                        <div className="space-y-2 sm:space-y-2.5">
                            {upcomingRSVPs.slice(0, 4).map((r: any) => {
                                const event = r.events;
                                if (!event) return null;
                                const dateStr = new Date(event.date).toLocaleDateString('en-IN', {
                                    weekday: 'short', day: 'numeric', month: 'short',
                                });
                                return (
                                    <Link
                                        key={r.id}
                                        href={`/event/${event.id}`}
                                        className="group flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-4 py-3.5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-cardHover sm:gap-4 sm:px-5 sm:py-4"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-b from-primary-50 to-primary-100/50 text-center ring-1 ring-primary-200/30 sm:h-12 sm:w-12">
                                            <span className="text-[9px] font-bold uppercase leading-none text-primary-500 sm:text-[10px]">
                                                {new Date(event.date).toLocaleDateString('en-IN', { month: 'short' })}
                                            </span>
                                            <span className="mt-0.5 text-base font-extrabold leading-none text-primary-700 sm:text-lg">
                                                {new Date(event.date).getDate()}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">{event.title}</span>
                                            <span className="text-xs text-neutral-500 mt-0.5 block">{dateStr}</span>
                                        </div>
                                        <ArrowRight size={14} className="shrink-0 text-neutral-300 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Empty state */}
                {!hasContent && (
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-lg sm:rounded-3xl">
                        {/* Gradient top bar */}
                        <div className="h-1.5 bg-gradient-to-r from-primary-500 via-violet-500 to-fuchsia-500" />

                        {/* Background blurs */}
                        <div className="absolute top-12 right-8 h-32 w-32 rounded-full bg-primary-100/40 blur-3xl" />
                        <div className="absolute bottom-8 left-8 h-28 w-28 rounded-full bg-violet-100/30 blur-3xl" />

                        <div className="relative px-5 py-10 text-center sm:px-12 sm:py-16">
                            {/* User avatar in empty state */}
                            <div className="mx-auto mb-5 h-16 w-16 overflow-hidden rounded-2xl border-2 border-primary-100 bg-gradient-to-br from-primary-100 to-violet-100 shadow-md sm:h-20 sm:w-20">
                                {avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        alt={fullName}
                                        width={80}
                                        height={80}
                                        className="h-full w-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-primary-600 sm:text-2xl">
                                        {initials(fullName)}
                                    </div>
                                )}
                            </div>

                            <h3 className="font-display text-xl text-neutral-900 sm:text-2xl lg:text-3xl">
                                Your feed is empty for now
                            </h3>
                            <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed sm:mt-3">
                                Join communities and RSVP to events to see your personalized home here. Discover what&apos;s happening around you.
                            </p>

                            {/* Profile completeness nudge */}
                            {(!avatarUrl || !isVerified) && (
                                <div className="mt-5 mx-auto max-w-xs rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:mt-6">
                                    <p className="text-xs font-semibold text-amber-800">Complete your profile to stand out</p>
                                    <div className="mt-2 flex flex-wrap justify-center gap-2">
                                        {!avatarUrl && (
                                            <Link href="/profile/edit" className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-100">
                                                <Camera size={10} /> Add photo
                                            </Link>
                                        )}
                                        {!isVerified && (
                                            <Link href="/profile/edit" className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-100">
                                                <ShieldCheck size={10} /> Verify profile
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3 sm:justify-center">
                                <Link
                                    href="/communities"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-xl"
                                >
                                    <Users size={16} />
                                    Browse communities
                                </Link>
                                <Link
                                    href="/explore"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md"
                                >
                                    <Calendar size={16} />
                                    Explore events
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="mt-10 flex items-center justify-center gap-6 border-t border-neutral-100 pt-6 sm:mt-12 sm:gap-8 sm:pt-8">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-primary-600 sm:gap-1.5">
                                        <TrendingUp size={12} />
                                        <span className="text-base font-bold sm:text-lg">50+</span>
                                    </div>
                                    <p className="mt-0.5 text-[10px] font-medium text-neutral-400 uppercase tracking-wide sm:text-[11px]">Communities</p>
                                </div>
                                <div className="h-6 w-px bg-neutral-100 sm:h-8" />
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-primary-600 sm:gap-1.5">
                                        <Calendar size={12} />
                                        <span className="text-base font-bold sm:text-lg">100+</span>
                                    </div>
                                    <p className="mt-0.5 text-[10px] font-medium text-neutral-400 uppercase tracking-wide sm:text-[11px]">Events</p>
                                </div>
                                <div className="h-6 w-px bg-neutral-100 sm:h-8" />
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-primary-600 sm:gap-1.5">
                                        <Heart size={12} />
                                        <span className="text-base font-bold sm:text-lg">4</span>
                                    </div>
                                    <p className="mt-0.5 text-[10px] font-medium text-neutral-400 uppercase tracking-wide sm:text-[11px]">Cities</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const user = await getCurrentUser();

  if (user && user.onboarding_completed) {
      return <PersonalizedHome user={user} />;
  }

  let cities: Pick<City, 'name' | 'is_active'>[];
  try {
      cities = await CityRepository.getAll();
      if (cities.length === 0) cities = FALLBACK_CITIES;
  } catch {
      cities = FALLBACK_CITIES;
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(108,71,255,0.3),_transparent_40%),linear-gradient(135deg,#0f172a_0%,#1e1b4b_52%,#4338ca_100%)] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 right-[-6rem] h-80 w-80 rounded-full bg-primary-400/20 blur-3xl" />
          <div className="absolute bottom-[-8rem] left-[-5rem] h-72 w-72 rounded-full bg-fuchsia-400/15 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:gap-12 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm sm:mb-6 sm:px-4 sm:py-2 sm:text-sm">
              <Zap size={14} className="text-amber-300 sm:h-4 sm:w-4" />
              The most trusted way to discover communities in your city
            </div>

            <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Discover real-world
              <span className="block font-display font-normal mt-1 bg-gradient-to-r from-primary-200 to-violet-200 bg-clip-text text-transparent sm:mt-2">
                communities & events.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 sm:mt-6 sm:text-lg sm:leading-8 lg:text-xl">
              Find verified communities, join curated gatherings, and build an offline social life around shared interests.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              <Link
                href="/explore?city=Noida"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-primary-700 shadow-xl shadow-primary-900/20 transition-all hover:-translate-y-0.5 hover:bg-primary-50 sm:px-7 sm:py-4 sm:text-base"
              >
                Explore live events
                <ArrowRight size={16} className="sm:h-[18px] sm:w-[18px]" />
              </Link>
              <Link
                href="/communities"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15 sm:px-7 sm:py-4 sm:text-base"
              >
                Browse communities
                <Compass size={16} className="sm:h-[18px] sm:w-[18px]" />
              </Link>
            </div>
          </div>

          {/* City cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {cities.slice(0, 4).map((city) => (
              city.is_active ? (
                <Link
                  key={city.name}
                  href={`/explore?city=${encodeURIComponent(city.name)}`}
                  className="group rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/15 sm:p-5"
                >
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white sm:mb-3 sm:h-10 sm:w-10">
                    <MapPin size={16} className="sm:h-5 sm:w-5" />
                  </div>
                  <h2 className="text-base font-semibold sm:text-lg">{city.name}</h2>
                  <p className="mt-1 text-xs text-white/70 sm:mt-1.5 sm:text-sm">Live now with curated communities.</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-400/20 px-2.5 py-0.5 text-[10px] font-semibold text-green-100 sm:mt-3 sm:gap-2 sm:px-3 sm:py-1 sm:text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                    Live now
                  </div>
                </Link>
              ) : (
                <div
                  key={city.name}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80 backdrop-blur-sm sm:p-5"
                >
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 sm:mb-3 sm:h-10 sm:w-10">
                    <MapPin size={16} className="sm:h-5 sm:w-5" />
                  </div>
                  <h2 className="text-base font-semibold text-white sm:text-lg">{city.name}</h2>
                  <p className="mt-1 text-xs text-white/60 sm:mt-1.5 sm:text-sm">Launching soon.</p>
                  <div className="mt-2 inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-white/70 sm:mt-3 sm:px-3 sm:py-1 sm:text-xs">
                    Coming soon
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Why Kyoty */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-8 max-w-2xl sm:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 sm:text-sm">Why Kyoty works</p>
          <h2 className="mt-2 font-display text-xl font-normal text-neutral-900 sm:mt-3 sm:text-2xl lg:text-3xl">
            A calmer, cleaner way to discover offline social experiences
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-500 sm:mt-4 sm:text-base sm:leading-7">
            We believe the best social experiences happen offline, in trusted spaces, with people who share your interests.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {VALUE_PROPS.map((item) => (
            <div key={item.title} className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:p-6">
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-lg sm:mb-5 sm:h-12 sm:w-12`}>
                <item.icon size={18} className="sm:h-[22px] sm:w-[22px]" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 sm:text-lg">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-500 sm:mt-2.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 sm:text-sm">Simple by design</p>
            <h2 className="mt-2 font-display text-xl font-normal text-neutral-900 sm:mt-3 sm:text-2xl lg:text-3xl">How Kyoty works</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="absolute left-[calc(50%+2rem)] top-7 hidden h-px w-[calc(100%-4rem)] bg-neutral-200 md:block" />
                )}
                <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 sm:mb-5 sm:h-14 sm:w-14">
                  <item.icon size={20} className="text-primary-600 sm:h-6 sm:w-6" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[9px] font-bold text-white sm:h-6 sm:w-6 sm:text-[10px]">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-neutral-900 sm:text-lg">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500 sm:mt-2.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 sm:text-sm">What you get</p>
            <h2 className="mt-2 font-display text-lg font-normal text-neutral-900 sm:mt-3 sm:text-xl lg:text-2xl">Everything you need to build a great social life</h2>
            <div className="mt-6 grid gap-2.5 sm:mt-8 sm:grid-cols-2 sm:gap-3">
              {[
                'Browse events by city and category',
                'Join trusted, members-only communities',
                'RSVP for curated, real-world gatherings',
                'Start your own community and host events',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 rounded-xl bg-neutral-50 p-3.5 sm:gap-3 sm:p-4">
                  <CheckCircle size={14} className="mt-0.5 shrink-0 text-primary-500 sm:h-4 sm:w-4" />
                  <span className="text-sm font-medium text-neutral-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white shadow-xl sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-100/80 sm:text-sm">Get started today</p>
            <h2 className="mt-2 font-display text-lg font-normal sm:mt-3 sm:text-xl lg:text-2xl">Join Kyoty and find your people in Noida.</h2>
            <p className="mt-3 text-sm leading-6 text-primary-100/80 sm:mt-4 sm:text-base sm:leading-7">
              Explore live communities and events, RSVP instantly, or start your own community and shape local culture.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-50 sm:px-6 sm:py-3">
                Create account
                <ArrowRight size={16} className="sm:h-[18px] sm:w-[18px]" />
              </Link>
              <Link href="/communities" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:px-6 sm:py-3">
                Browse communities
                <Users size={16} className="sm:h-[18px] sm:w-[18px]" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
