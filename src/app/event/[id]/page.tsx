import { EventRepository } from '@/lib/repositories/event-repo';
import { EventParticipantRepository } from '@/lib/repositories/event-participant-repo';
import { getCurrentUser } from '@/lib/auth-server';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { JoinEventButton } from './JoinEventButton';
import { ReviewSection } from './ReviewSection';
import { ReportButton } from '@/components/ReportButton';
import { Calendar, MapPin, Users, Clock, ArrowLeft, IndianRupee, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface EventDetailPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
    const { id } = await params;
    const event = await EventRepository.findById(Number(id));
    if (!event) return { title: 'Event Not Found' };

    const dateStr = new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    return {
        title: `${event.title} | Kyoty`,
        description: event.description || `${event.title} on ${dateStr}`,
        openGraph: {
            title: event.title,
            description: event.description || `Join ${event.title} on ${dateStr}`,
            images: event.communities?.cover_image_url ? [event.communities.cover_image_url] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: event.title,
            description: event.description || `Join ${event.title} on ${dateStr}`,
        },
    };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
    const { id } = await params;
    const event = await EventRepository.findById(Number(id));
    if (!event) notFound();

    const participants = await EventParticipantRepository.listByEvent(event.id);
    const participantCount = participants.length;
    const currentUser = await getCurrentUser();

    let isRegistered = false;
    let isWaitlisted = false;
    let waitlistPosition = 0;
    let isCommunityMember = false;
    let isOrganizer = false;

    if (currentUser) {
        const existing = await EventParticipantRepository.findExisting(event.id, currentUser.id);
        isRegistered = existing?.status === 'registered';
        isWaitlisted = existing?.status === 'waitlisted';
        if (isWaitlisted) {
            waitlistPosition = await EventParticipantRepository.getWaitlistPosition(event.id, currentUser.id);
        }
        isCommunityMember = await CommunityMemberRepository.isMember(event.community_id, currentUser.id);
        isOrganizer = event.created_by === currentUser.id || currentUser.role === 'admin' || currentUser.role === 'kyoty_admin';
    }

    const communityName = event.communities?.name || 'Community';
    const communitySlug = event.communities?.slug || String(event.community_id);
    const dateStr = new Date(event.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const isPastEvent = new Date(event.date) < new Date();
    const isFull = participantCount >= event.max_participants;
    const timeDisplay = event.start_time && event.end_time
        ? `${event.start_time} – ${event.end_time}`
        : event.start_time || null;

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header Image */}
            <div className="relative h-64 sm:h-80 bg-gradient-to-br from-primary-500 to-primary-700">
                {event.communities?.cover_image_url ? (
                    <Image src={event.communities.cover_image_url} alt={event.title} fill className="object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar size={64} className="text-primary-300" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
                    <Link
                        href="/explore"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Link>
                </div>
                {isOrganizer && (
                    <Link
                        href={`/event/${id}/manage`}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm hover:bg-white/30 transition-colors"
                    >
                        <Settings size={16} />
                        Manage
                    </Link>
                )}
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
                <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        {/* Category */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                {event.communities?.category && (
                                    <span className="inline-flex px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                                        {event.communities.category}
                                    </span>
                                )}
                                {isPastEvent && (
                                    <span className="inline-flex px-3 py-1 bg-neutral-100 text-neutral-500 rounded-full text-xs font-medium">
                                        Past Event
                                    </span>
                                )}
                            </div>
                            {currentUser && (
                                <ReportButton targetType="event" targetId={event.id} />
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
                            {event.title}
                        </h1>

                        <Link
                            href={`/community/${communitySlug}`}
                            className="inline-flex items-center gap-2 text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors mb-6"
                        >
                            <span className="w-2 h-2 rounded-full bg-primary-500" />
                            {communityName}
                        </Link>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                    <Calendar size={18} className="text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">Date</p>
                                    <p className="text-sm font-medium text-neutral-900">{dateStr}</p>
                                </div>
                            </div>

                            {timeDisplay && (
                                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                        <Clock size={18} className="text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500">Time</p>
                                        <p className="text-sm font-medium text-neutral-900">{timeDisplay}</p>
                                    </div>
                                </div>
                            )}

                            {event.location_text && (
                                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                        <MapPin size={18} className="text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500">Location</p>
                                        <p className="text-sm font-medium text-neutral-900">{event.location_text}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                    <Users size={18} className="text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">Capacity</p>
                                    <p className="text-sm font-medium text-neutral-900">
                                        {participantCount} / {event.max_participants} Going
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Cost */}
                        <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl mb-6">
                            <span className="text-sm text-neutral-600 font-medium">Cost per person</span>
                            {event.is_paid ? (
                                <span className="text-lg font-bold text-neutral-900 flex items-center gap-0.5">
                                    <IndianRupee size={16} />
                                    {event.price_per_person || event.per_person_estimate || '—'}
                                </span>
                            ) : (
                                <span className="text-lg font-bold text-green-600">Free</span>
                            )}
                        </div>

                        {/* Join/Waitlist Button */}
                        {!isPastEvent && (
                            <JoinEventButton
                                eventId={event.id}
                                isLoggedIn={!!currentUser}
                                isRegistered={isRegistered}
                                isWaitlisted={isWaitlisted}
                                waitlistPosition={waitlistPosition}
                                isCommunityMember={isCommunityMember}
                                isFull={isFull}
                                isPaid={event.is_paid}
                                price={event.price_per_person || 0}
                            />
                        )}

                        {/* Description */}
                        {event.description && (
                            <div className="mt-8 pt-6 border-t border-neutral-200">
                                <h2 className="text-lg font-semibold text-neutral-900 mb-3">About this event</h2>
                                <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
                                    {event.description}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Attendees */}
                    {participants.length > 0 && (
                        <div className="border-t border-neutral-200 p-6 sm:p-8 bg-neutral-50">
                            <h3 className="text-sm font-semibold text-neutral-900 mb-4">
                                Attendees ({participantCount})
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {participants.slice(0, 8).map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-neutral-200 text-sm"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-primary-200 flex items-center justify-center text-xs font-semibold text-primary-700">
                                            {(p.kyoty_users?.name || 'U')[0].toUpperCase()}
                                        </div>
                                        <span className="text-neutral-700 font-medium">{p.kyoty_users?.name || 'User'}</span>
                                    </div>
                                ))}
                                {participantCount > 8 && (
                                    <div className="flex items-center px-3 py-2 text-sm text-neutral-500">
                                        + {participantCount - 8} others
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Reviews (only for past events) */}
                    {isPastEvent && (
                        <div className="border-t border-neutral-200 p-6 sm:p-8">
                            <ReviewSection
                                eventId={event.id}
                                communityId={event.community_id}
                                isLoggedIn={!!currentUser}
                                hasAttended={isRegistered}
                            />
                        </div>
                    )}

                    {/* Community Link */}
                    <div className="border-t border-neutral-200 p-6 sm:p-8 flex items-center justify-between">
                        <span className="text-sm text-neutral-500">
                            Hosted by <span className="font-semibold text-neutral-900">{communityName}</span>
                        </span>
                        <Link
                            href={`/community/${communitySlug}`}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            View Community
                        </Link>
                    </div>
                </div>
            </div>

            <div className="h-16" />
        </div>
    );
}
