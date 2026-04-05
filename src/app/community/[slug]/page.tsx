import { CommunityRepository } from '@/lib/repositories/community-repo';
import { EventRepository } from '@/lib/repositories/event-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { CommunityRolesRepository } from '@/lib/repositories/community-roles-repo';
import { CommunityRatingsRepository } from '@/lib/repositories/community-ratings-repo';
import { getCurrentUser } from '@/lib/auth-server';
import { cached, CacheTags } from '@/lib/cache';
import { EventCard } from '@/components/EventCard';
import { CommunityTabNav } from '@/components/CommunityTabNav';
import { CommunityRatingForm } from '@/components/CommunityRatingForm';
import { CommunitySidebar } from '@/components/CommunitySidebar';
import { JoinCommunityButton } from './JoinCommunityButton';
import { ReportButton } from '@/components/ReportButton';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { DetailTrustSignals } from '@/components/DetailTrustSignals';
import {
    Calendar, Lock, MapPin, ArrowLeft, Star, Users, MessageCircle,
    Image as ImageIcon, ShieldCheck, UserCheck, Rss,
} from 'lucide-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface CommunityPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CommunityPageProps): Promise<Metadata> {
    const { slug } = await params;
    const community = await (isNaN(Number(slug))
        ? CommunityRepository.findBySlug(slug)
        : CommunityRepository.findById(Number(slug)));
    if (!community) return { title: 'Community Not Found' };

    return {
        title: `${community.name} | Kyoty`,
        description: community.description || `Join ${community.name} on Kyoty`,
        openGraph: {
            title: community.name,
            description: community.description || `Discover ${community.name} — a community on Kyoty`,
            images: community.cover_image_url ? [community.cover_image_url] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: community.name,
            description: community.description || `Discover ${community.name} — a community on Kyoty`,
        },
    };
}

export default async function CommunityPage({ params }: CommunityPageProps) {
    const { slug } = await params;

    const community = await cached(
        () => isNaN(Number(slug))
            ? CommunityRepository.findBySlug(slug)
            : CommunityRepository.findById(Number(slug)),
        ['community-detail', slug],
        [CacheTags.communityDetail(slug), CacheTags.COMMUNITIES],
        60,
    );

    if (!community) notFound();

    const [events, currentUser] = await Promise.all([
        cached(
            () => EventRepository.findByCommunity(community.id),
            ['community-events', String(community.id)],
            [CacheTags.communityDetail(slug), CacheTags.EXPLORE_EVENTS],
            30,
        ),
        getCurrentUser(),
    ]);

    const approvedEvents = events.filter(e => ['approved', 'open'].includes(e.status));
    const memberCount = community.member_count || await CommunityRepository.getMemberCount(community.id);

    let isMember = false;
    let hasPendingRequest = false;
    let isOrganizer = false;
    let canManage = false;

    if (currentUser) {
        const isPlatformAdmin = currentUser.role === 'admin' || currentUser.role === 'kyoty_admin';
        isOrganizer = community.organizer_id === currentUser.id
            || (community.organizer?.email === currentUser.email)
            || isPlatformAdmin;

        isMember = await CommunityMemberRepository.isMember(community.id, currentUser.id);
        if (!isMember) {
            const existing = await CommunityMemberRepository.findExisting(community.id, currentUser.id);
            hasPendingRequest = existing?.status === 'pending';
        }

        const communityRole = await CommunityRolesRepository.getUserRole(community.id, currentUser.id);
        canManage = isOrganizer || communityRole === 'owner' || communityRole === 'admin';
    }

    const showMemberFeatures = isMember || isOrganizer;

    const [existingRating, moderators] = await Promise.all([
        currentUser && isMember
            ? CommunityRatingsRepository.findByUser(community.id, currentUser.id)
            : Promise.resolve(null),
        cached(
            () => CommunityRolesRepository.listByCommunity(community.id),
            ['community-moderators', String(community.id)],
            [CacheTags.communityDetail(slug)],
            60,
        ),
    ]);

    const organizerName = community.organizer?.name || 'Community host';
    const communityStatusLabel = community.status === 'approved'
        ? 'Approved community'
        : community.status.charAt(0).toUpperCase() + community.status.slice(1);
    const accessStatusLabel = !currentUser
        ? 'Sign in to apply'
        : isOrganizer
            ? 'Organizer access'
            : isMember
                ? 'Member access'
                : hasPendingRequest
                    ? 'Application pending'
                    : 'Apply to join';
    const ratingLabel = community.rating_count > 0 && community.rating_avg != null
        ? `${Number(community.rating_avg).toFixed(1)}/5`
        : 'No ratings yet';
    const ratingHint = community.rating_count > 0
        ? `${community.rating_count} review${community.rating_count !== 1 ? 's' : ''}`
        : 'Be the first to leave feedback';

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Cover */}
            <div className="relative h-48 sm:h-64 bg-gradient-to-br from-primary-500 to-primary-700">
                {community.cover_image_url ? (
                    <NextImage src={community.cover_image_url} alt={community.name} fill className="object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Users size={48} className="text-primary-300" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <Link
                    href="/communities"
                    className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/30 sm:left-6 sm:top-6"
                >
                    <ArrowLeft size={15} />
                    Back
                </Link>

                {/* Community name on cover */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 sm:px-8">
                    <h1 className="font-display text-xl text-white sm:text-2xl drop-shadow-sm">{community.name}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/80">
                        <span className="flex items-center gap-1.5">
                            <MapPin size={13} />
                            {community.city_name || 'Noida'}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Users size={13} />
                            {memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </span>
                        {community.category && (
                            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm">
                                {community.category}
                            </span>
                        )}
                        {community.rating_count > 0 && community.rating_avg != null && (
                            <span className="flex items-center gap-1">
                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                <span className="font-medium">{Number(community.rating_avg).toFixed(1)}</span>
                                <span className="text-white/60">({community.rating_count})</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Trust signals strip */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 -mt-4 relative z-10">
                <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <DetailTrustSignals
                        items={[
                            {
                                label: 'Host',
                                icon: <ShieldCheck size={16} />,
                                value: (
                                    <>
                                        <span className="truncate">{organizerName}</span>
                                        {community.organizer?.social_proof_type && (
                                            <VerifiedBadge type={community.organizer.social_proof_type} size="sm" />
                                        )}
                                    </>
                                ),
                                hint: 'Verified organizer',
                            },
                            {
                                label: 'Members',
                                icon: <Users size={16} />,
                                value: `${memberCount}`,
                                hint: memberCount > 0 ? 'Active' : 'Growing',
                            },
                            {
                                label: 'Rating',
                                icon: <Star size={16} />,
                                value: ratingLabel,
                                hint: ratingHint,
                            },
                            {
                                label: 'Status',
                                icon: <UserCheck size={16} />,
                                value: communityStatusLabel,
                                hint: accessStatusLabel,
                            },
                        ]}
                    />
                </div>
            </div>

            {/* Tab nav */}
            <CommunityTabNav slug={slug} isMember={showMemberFeatures} canManage={canManage} />

            {/* 2-column layout */}
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                <div className="grid gap-6 lg:grid-cols-[240px_1fr]">

                    {/* LEFT SIDEBAR */}
                    <div className="hidden lg:block">
                        <CommunitySidebar
                            community={community}
                            memberCount={memberCount}
                            moderators={moderators}
                            isMember={showMemberFeatures}
                            canManage={canManage}
                            communitySlug={slug}
                        />
                    </div>

                    {/* MAIN CONTENT */}
                    <main className="min-w-0 space-y-5">
                        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                            <div className="p-5 sm:p-6">
                                {/* Description + report */}
                                <div className="mb-5 flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        {community.description && (
                                            <p className="text-sm leading-relaxed text-neutral-600">{community.description}</p>
                                        )}
                                        {community.organizer && (
                                            <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
                                                <span>Organised by</span>
                                                <span className="font-medium text-neutral-700">{community.organizer.name}</span>
                                                <VerifiedBadge type={(community.organizer as any).social_proof_type} size="sm" />
                                            </div>
                                        )}
                                    </div>
                                    {currentUser && (
                                        <ReportButton targetType="community" targetId={community.id} />
                                    )}
                                </div>

                                {/* Join / auth gate */}
                                {!currentUser ? (
                                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                                                <Lock size={18} className="text-primary-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-neutral-900">Sign in to join</p>
                                                <p className="mt-1 text-xs leading-5 text-neutral-500">
                                                    Create a free account to apply for membership, RSVP to events, and connect with members.
                                                </p>
                                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                                    <Link
                                                        href="/login"
                                                        className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                                                    >
                                                        Sign in
                                                    </Link>
                                                    <Link
                                                        href="/login"
                                                        className="inline-flex items-center justify-center rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                                                    >
                                                        Create account
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <JoinCommunityButton
                                        communityId={community.id}
                                        communitySlug={slug}
                                        isLoggedIn={true}
                                        isMember={isMember}
                                        hasPendingRequest={hasPendingRequest}
                                    />
                                )}

                                {/* Member quick-links (mobile only) */}
                                {showMemberFeatures && (
                                    <div className="mt-5 grid grid-cols-3 gap-2 lg:hidden">
                                        <Link
                                            href={`/community/${slug}/feed`}
                                            className="flex flex-col items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs font-medium text-neutral-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                                        >
                                            <Rss size={18} className="text-primary-500" />
                                            Feed
                                        </Link>
                                        <Link
                                            href={`/community/${slug}/chat`}
                                            className="flex flex-col items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs font-medium text-neutral-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                                        >
                                            <MessageCircle size={18} className="text-primary-500" />
                                            Chat
                                        </Link>
                                        <Link
                                            href={`/community/${slug}/media`}
                                            className="flex flex-col items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs font-medium text-neutral-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                                        >
                                            <ImageIcon size={18} className="text-primary-500" />
                                            Gallery
                                        </Link>
                                    </div>
                                )}

                                {/* Member feed prompt (desktop) */}
                                {showMemberFeatures && (
                                    <div className="mt-5 hidden lg:flex items-center gap-3 rounded-xl bg-primary-50 px-4 py-3">
                                        <Rss size={16} className="text-primary-600 shrink-0" />
                                        <p className="text-sm text-neutral-700">
                                            You&apos;re a member.{' '}
                                            <Link href={`/community/${slug}/feed`} className="font-semibold text-primary-700 hover:underline">
                                                Go to the feed →
                                            </Link>
                                        </p>
                                    </div>
                                )}

                                {/* Rating form */}
                                {isMember && (
                                    <div className="mt-5">
                                        <CommunityRatingForm
                                            communityId={community.id}
                                            existingRating={existingRating?.rating ?? null}
                                            existingReview={existingRating?.review ?? null}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Events section */}
                            <div className="border-t border-neutral-200 bg-neutral-50/50 p-5 sm:p-6">
                                <h2 className="mb-4 flex items-center gap-2 font-display text-base text-neutral-900">
                                    <Calendar size={16} className="text-primary-600" />
                                    Events
                                    {approvedEvents.length > 0 && (
                                        <span className="ml-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
                                            {approvedEvents.length}
                                        </span>
                                    )}
                                </h2>

                                {approvedEvents.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {approvedEvents.map((event) => (
                                            <EventCard
                                                key={event.id}
                                                event={{ ...event, communities: community } as any}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-neutral-200 bg-white px-6 py-8 text-center">
                                        <Calendar size={24} className="mx-auto mb-2 text-neutral-300" />
                                        <p className="text-sm text-neutral-500">No events yet</p>
                                        <p className="mt-1 text-xs text-neutral-400">Join to get notified when events are posted.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <div className="h-12" />
        </div>
    );
}
