import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users } from 'lucide-react';
import type { EventWithCommunity } from '@/types';

interface EventCardProps {
    event: EventWithCommunity;
}

export function EventCard({ event }: EventCardProps) {
    const dateStr = new Date(event.date).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });

    const communityName = event.communities?.name || 'Community';
    const communitySlug = event.communities?.slug || String(event.community_id);
    const isPast = new Date(event.date) < new Date();

    return (
        <Link href={`/event/${event.id}`} className="group block">
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-card hover:shadow-cardHover transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                <div className="relative h-44 bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
                    {event.communities?.cover_image_url ? (
                        <Image
                            src={event.communities.cover_image_url}
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Calendar size={40} className="text-primary-400" />
                        </div>
                    )}
                    {/* Category Badge */}
                    {event.communities?.category && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary-700">
                            {event.communities.category}
                        </div>
                    )}
                    {/* Past Event Badge */}
                    {isPast && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-neutral-800/70 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                            Past
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="text-base font-semibold text-neutral-900 line-clamp-1 mb-1 group-hover:text-primary-600 transition-colors">
                        {event.title}
                    </h3>
                    {/* Clickable Community Name */}
                    <Link
                        href={`/community/${communitySlug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-primary-600 font-medium flex items-center gap-1 mb-3 hover:text-primary-700 transition-colors"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        {communityName}
                    </Link>

                    <div className="space-y-1.5 text-xs text-neutral-500">
                        <div className="flex items-center gap-2">
                            <Calendar size={13} className="text-neutral-400" />
                            <span>{dateStr}</span>
                            {event.start_time && (
                                <>
                                    <span className="text-neutral-300">·</span>
                                    <span>{event.start_time}</span>
                                </>
                            )}
                        </div>

                        {event.location_text && (
                            <div className="flex items-center gap-2">
                                <MapPin size={13} className="text-neutral-400" />
                                <span className="line-clamp-1">{event.location_text}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-neutral-100">
                            <span className="flex items-center gap-1.5 text-neutral-500">
                                <Users size={13} />
                                {event.registered_count || 0}/{event.max_participants} Going
                            </span>
                            {event.is_paid ? (
                                <span className="font-semibold text-neutral-900 text-sm">
                                    ₹{event.price_per_person || event.per_person_estimate || '—'}
                                </span>
                            ) : (
                                <span className="font-semibold text-green-600 text-sm">Free</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
