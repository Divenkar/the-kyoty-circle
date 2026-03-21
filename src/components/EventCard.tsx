'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Calendar, Clock3, MapPin, Users } from 'lucide-react';
import type { EventWithCommunity } from '@/types';

interface EventCardProps {
    event: EventWithCommunity;
}

export function EventCard({ event }: EventCardProps) {
    const eventDate = new Date(event.date);
    const dateStr = eventDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });

    const communityName = event.communities?.name || 'Community';
    const communitySlug = event.communities?.slug || String(event.community_id);
    const isPast = eventDate < new Date();
    const spotsLeft = Math.max((event.max_participants || 0) - (event.registered_count || 0), 0);

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-300 hover:shadow-cardHover">
                <Link href={`/event/${event.id}`} className="relative block h-48 overflow-hidden bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300">
                    {event.communities?.cover_image_url ? (
                        <Image
                            src={event.communities.cover_image_url}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Calendar size={42} className="text-primary-500/70" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        {event.communities?.category && (
                            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary-700 backdrop-blur-sm">
                                {event.communities.category}
                            </span>
                        )}
                        {isPast && (
                            <span className="rounded-full bg-neutral-900/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                Past event
                            </span>
                        )}
                    </div>

                    <div className="absolute bottom-4 right-4 rounded-full bg-white/90 p-2 text-primary-600 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                        <ArrowUpRight size={16} />
                    </div>
                </Link>

                <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <Link href={`/event/${event.id}`} className="block">
                            <h3 className="line-clamp-2 text-lg font-semibold leading-7 text-neutral-900 transition-colors group-hover:text-primary-600">
                                {event.title}
                            </h3>
                        </Link>
                        <div className="rounded-2xl bg-primary-50 px-3 py-2 text-right">
                            <div className="text-xs font-medium uppercase tracking-wide text-primary-500">{eventDate.toLocaleDateString('en-IN', { month: 'short' })}</div>
                            <div className="text-lg font-bold text-primary-700">{eventDate.toLocaleDateString('en-IN', { day: 'numeric' })}</div>
                        </div>
                    </div>

                    <Link
                        href={`/community/${communitySlug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                    >
                        <span className="h-2 w-2 rounded-full bg-primary-500" />
                        {communityName}
                    </Link>

                    <div className="space-y-2.5 text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                            <Calendar size={15} className="text-primary-500" />
                            <span>{dateStr}</span>
                        </div>

                        {event.start_time && (
                            <div className="flex items-center gap-2">
                                <Clock3 size={15} className="text-primary-500" />
                                <span>{event.start_time}</span>
                            </div>
                        )}

                        {event.location_text && (
                            <div className="flex items-center gap-2">
                                <MapPin size={15} className="text-primary-500" />
                                <span className="line-clamp-1">{event.location_text}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
                        <div>
                            <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700">
                                <Users size={15} className="text-primary-500" />
                                {(event.registered_count || 0)}/{event.max_participants} joined
                            </div>
                            <p className="mt-1 text-xs text-neutral-500">
                                {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Waitlist or full'}
                            </p>
                        </div>
                        {event.is_paid ? (
                            <span className="text-lg font-bold text-neutral-900">
                                ₹{event.price_per_person || event.per_person_estimate || '—'}
                            </span>
                        ) : (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">Free</span>
                        )}
                    </div>
                    <div className="mt-4">
                        <Link href={`/event/${event.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700">
                            View event
                            <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>
            </article>
    );
}
