import { CommunityRepository } from '@/lib/repositories/community-repo';
import { EventRepository } from '@/lib/repositories/event-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { getCurrentUser } from '@/lib/auth-server';
import { EventCard } from '@/components/EventCard';
import { JoinCommunityButton } from './JoinCommunityButton';
import { AdminPanel } from './AdminPanel';
import { ReportButton } from '@/components/ReportButton';
import { Users, MapPin, ArrowLeft, Calendar, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CommunityPageProps {
    params: Promise<{ slug: string }>;
}

export default async function CommunityPage({ params }: CommunityPageProps) {
    const { slug } = await params;

    // Try slug-based lookup first, fall back to numeric id
    const community = isNaN(Number(slug))
        ? await CommunityRepository.findBySlug(slug)
        : await CommunityRepository.findById(Number(slug));

    if (!community) notFound();

    const events = await EventRepository.findByCommunity(community.id);
    const approvedEvents = events.filter(e => ['approved', 'open'].includes(e.status));
    const memberCount = community.member_count || await CommunityRepository.getMemberCount(community.id);
    const currentUser = await getCurrentUser();

    let isMember = false;
    let hasPendingRequest = false;
    let isOrganizer = false;

    if (currentUser) {
        isMember = await CommunityMemberRepository.isMember(community.id, currentUser.id);
        if (!isMember) {
            const existing = await CommunityMemberRepository.findExisting(community.id, currentUser.id);
            hasPendingRequest = existing?.status === 'pending';
        }
        // Check if this user is the organizer (by id or by email match)
        isOrganizer = community.organizer_id === currentUser.id
            || (community.organizer?.email === currentUser.email)
            || currentUser.role === 'admin'
            || currentUser.role === 'kyoty_admin';
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Cover Image */}
            <div className="relative h-52 sm:h-64 bg-gradient-to-br from-primary-400 to-primary-600">
                {community.cover_image_url ? (
                    <Image src={community.cover_image_url} alt={community.name} fill className="object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Users size={48} className="text-primary-300" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <Link
                    href="/explore"
                    className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm hover:bg-white/30 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back
                </Link>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
                <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                                {community.name}
                            </h1>
                            {currentUser && (
                                <ReportButton targetType="community" targetId={community.id} />
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-4">
                            <span className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-neutral-400" />
                                {community.city_name || 'Noida'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Users size={14} className="text-neutral-400" />
                                {memberCount} members
                            </span>
                            {community.category && (
                                <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                                    {community.category}
                                </span>
                            )}
                            {(community.rating_count > 0) && (
                                <span className="flex items-center gap-1">
                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                    <span className="font-medium text-neutral-700">{community.rating_avg}</span>
                                    <span className="text-neutral-400">·</span>
                                    <span>{community.rating_count} review{community.rating_count !== 1 ? 's' : ''}</span>
                                </span>
                            )}
                        </div>

                        {community.description && (
                            <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                                {community.description}
                            </p>
                        )}

                        {/* Join Button */}
                        <JoinCommunityButton
                            communityId={community.id}
                            isLoggedIn={!!currentUser}
                            isMember={isMember}
                            hasPendingRequest={hasPendingRequest}
                        />

                        {/* Admin Panel — only shown to the organizer */}
                        {isOrganizer && (
                            <AdminPanel
                                communityId={community.id}
                                currentName={community.name}
                                currentDescription={community.description || ''}
                                currentCoverImageUrl={community.cover_image_url}
                            />
                        )}
                    </div>

                    {/* Events */}
                    <div className="border-t border-neutral-200 p-6 sm:p-8 bg-neutral-50">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-primary-600" />
                            Community Events ({approvedEvents.length})
                        </h2>

                        {approvedEvents.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {approvedEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={{ ...event, communities: community } as any}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-neutral-500 text-sm text-center py-8">
                                No events yet. Stay tuned!
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="h-16" />
        </div>
    );
}
