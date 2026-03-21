import { CommunityRepository } from '@/lib/repositories/community-repo';
import { EventRepository } from '@/lib/repositories/event-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { CommunityRolesRepository } from '@/lib/repositories/community-roles-repo';
import { CommunityRatingsRepository } from '@/lib/repositories/community-ratings-repo';
import { getCurrentUser } from '@/lib/auth-server';
import { EventCard } from '@/components/EventCard';
import { CommunityTabNav } from '@/components/CommunityTabNav';
import { CommunityRatingForm } from '@/components/CommunityRatingForm';
import { JoinCommunityButton } from './JoinCommunityButton';
import { ReportButton } from '@/components/ReportButton';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { Calendar, Lock, MapPin, ArrowLeft, Star, Users, MessageCircle, Image } from 'lucide-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CommunityPageProps {
    params: Promise<{ slug: string }>;
}

export default async function CommunityPage({ params }: CommunityPageProps) {
    const { slug } = await params;

    const community = isNaN(Number(slug))
        ? await CommunityRepository.findBySlug(slug)
        : await CommunityRepository.findById(Number(slug));

    if (!community) notFound();

    const [events, currentUser] = await Promise.all([
        EventRepository.findByCommunity(community.id),
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

    let existingRating: { rating: number; review: string | null } | null = null;
    if (currentUser && isMember) {
        existingRating = await CommunityRatingsRepository.findByUser(community.id, currentUser.id);
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Cover */}
            <div className="relative h-56 sm:h-72 bg-gradient-to-br from-primary-400 to-primary-600">
                {community.cover_image_url ? (
                    <NextImage src={community.cover_image_url} alt={community.name} fill className="object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Users size={52} className="text-primary-300" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <Link
                    href="/communities"
                    className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/30 sm:left-6 sm:top-6"
                >
                    <ArrowLeft size={16} />
                    Communities
                </Link>

                {/* Community name on cover */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 sm:px-8">
                    <h1 className="text-2xl font-bold text-white sm:text-3xl drop-shadow-sm">{community.name}</h1>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/80">
                        <span className="flex items-center gap-1.5">
                            <MapPin size={13} />
                            {community.city_name || 'Noida'}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Users size={13} />
                            {memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </span>
                        {community.category && (
                            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
                                {community.category}
                            </span>
                        )}
                        {community.rating_count > 0 && (
                            <span className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star
                                        key={s}
                                        size={12}
                                        className={s <= Math.round(community.rating_avg)
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'fill-white/30 text-white/30'
                                        }
                                    />
                                ))}
                                <span className="ml-0.5 font-medium">{community.rating_avg}</span>
                                <span className="text-white/60">· {community.rating_count} review{community.rating_count !== 1 ? 's' : ''}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab nav */}
            <CommunityTabNav slug={slug} isMember={showMemberFeatures} canManage={canManage} />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <div className="p-6 sm:p-8">
                        {/* Report + description */}
                        <div className="mb-5 flex items-start justify-between gap-3">
                            <div className="flex-1">
                                {community.description && (
                                    <p className="text-sm leading-7 text-neutral-600">{community.description}</p>
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
                            <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                                        <Lock size={18} className="text-primary-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-primary-900">Sign in to join this community</p>
                                        <p className="mt-1 text-xs leading-5 text-primary-700">
                                            Create a free Kyoty account to apply for membership, RSVP to events, and connect with community members.
                                        </p>
                                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                            <Link
                                                href="/login"
                                                className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                                            >
                                                Sign in to apply
                                            </Link>
                                            <Link
                                                href="/login"
                                                className="inline-flex items-center justify-center rounded-xl border border-primary-200 bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
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

                        {/* Member quick-links */}
                        {showMemberFeatures && (
                            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <Link
                                    href={`/community/${slug}/chat`}
                                    className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                                >
                                    <MessageCircle size={16} className="text-primary-500" />
                                    Community Chat
                                </Link>
                                <Link
                                    href={`/community/${slug}/media`}
                                    className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                                >
                                    <Image size={16} className="text-primary-500" />
                                    Photo Gallery
                                </Link>
                                <Link
                                    href={`/community/${slug}/members`}
                                    className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                                >
                                    <Users size={16} className="text-primary-500" />
                                    Members
                                </Link>
                            </div>
                        )}

                        {/* Rating form — approved members only */}
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
                    <div className="border-t border-neutral-200 bg-neutral-50 p-6 sm:p-8">
                        <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-neutral-900">
                            <Calendar size={18} className="text-primary-600" />
                            Community Events
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
                            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
                                <Calendar size={28} className="mx-auto mb-3 text-neutral-300" />
                                <p className="text-sm font-medium text-neutral-500">No events yet</p>
                                <p className="mt-1 text-xs text-neutral-400">Join to be notified when events are posted.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="h-12" />
        </div>
    );
}
