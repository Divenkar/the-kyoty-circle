'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Calendar, Clock3, MapPin, Users, CheckCircle2, Zap } from 'lucide-react';
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
    const fillPercent = event.max_participants
        ? Math.min(((event.registered_count || 0) / event.max_participants) * 100, 100)
        : 0;

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-cardHover">
            {/* Image */}
            <Link href={`/event/${event.id}`} className="relative block aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300">
                {(event.cover_image_url || event.communities?.cover_image_url) ? (
                    <Image
                        src={event.cover_image_url || event.communities!.cover_image_url!}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar size={38} className="text-primary-500/60" />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Date badge */}
                <div className="absolute left-3 top-3 flex flex-col items-center rounded-xl bg-white/95 px-2.5 py-1.5 text-center shadow-sm backdrop-blur-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600">
                        {eventDate.toLocaleDateString('en-IN', { month: 'short' })}
                    </span>
                    <span className="text-lg font-extrabold leading-tight text-neutral-900">
                        {eventDate.getDate()}
                    </span>
                </div>

                {/* Tags */}
                <div className="absolute right-3 top-3 flex flex-wrap gap-1.5">
                    {event.communities?.category && (
                        <span className="rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-primary-700 backdrop-blur-sm">
                            {event.communities.category}
                        </span>
                    )}
                    {isPast && (
                        <span className="rounded-lg bg-neutral-900/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                            Past
                        </span>
                    )}
                </div>

                {/* Price tag on image */}
                <div className="absolute bottom-3 right-3">
                    {event.is_paid ? (
                        <span className="rounded-lg bg-white/95 px-2.5 py-1 text-sm font-bold text-neutral-900 shadow-sm backdrop-blur-sm">
                            ₹{event.price_per_person || event.per_person_estimate || '—'}
                        </span>
                    ) : (
                        <span className="rounded-lg bg-green-500/90 px-2.5 py-1 text-sm font-bold text-white shadow-sm backdrop-blur-sm">
                            Free
                        </span>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                {/* Community pill */}
                <Link
                    href={`/community/${communitySlug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mb-2.5 inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                    {communityName}
                </Link>

                {/* Title */}
                <Link href={`/event/${event.id}`} className="block">
                    <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-primary-600">
                        {event.title}
                    </h3>
                </Link>

                {/* Meta row */}
                <div className="mt-2.5 space-y-1.5 text-[13px] text-neutral-500">
                    <div className="flex items-center gap-2">
                        <Calendar size={13} className="shrink-0 text-primary-500" />
                        <span>{dateStr}</span>
                        {event.start_time && (
                            <>
                                <span className="text-neutral-300">·</span>
                                <Clock3 size={13} className="shrink-0 text-primary-500" />
                                <span>{event.start_time}</span>
                            </>
                        )}
                    </div>
                    {event.location_text && (
                        <div className="flex items-center gap-2">
                            <MapPin size={13} className="shrink-0 text-primary-500" />
                            <span className="truncate">{event.location_text}</span>
                        </div>
                    )}
                </div>

                {/* Capacity bar + CTA */}
                <div className="mt-auto pt-4">
                    {/* Capacity */}
                    <div className="mb-3 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-neutral-600">
                            <Users size={13} className="text-primary-500" />
                            {(event.registered_count || 0)}/{event.max_participants}
                        </span>
                        <span className={`font-medium ${spotsLeft <= 3 && spotsLeft > 0 ? 'text-amber-600' : spotsLeft === 0 ? 'text-red-500' : 'text-neutral-500'}`}>
                            {spotsLeft > 0 ? `${spotsLeft} left` : 'Full'}
                        </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mb-3 h-1 overflow-hidden rounded-full bg-neutral-100">
                        <div
                            className={`h-full rounded-full transition-all ${fillPercent >= 90 ? 'bg-red-400' : fillPercent >= 70 ? 'bg-amber-400' : 'bg-primary-500'}`}
                            style={{ width: `${fillPercent}%` }}
                        />
                    </div>

                    {/* CTA */}
                    {isPast ? (
                        <Link
                            href={`/event/${event.id}`}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-600 transition-colors hover:border-primary-300 hover:text-primary-600"
                        >
                            View Details
                            <ArrowUpRight size={14} />
                        </Link>
                    ) : spotsLeft === 0 ? (
                        <Link
                            href={`/event/${event.id}`}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                        >
                            <Zap size={14} />
                            Join Waitlist
                        </Link>
                    ) : (
                        <Link
                            href={`/event/${event.id}`}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md"
                        >
                            <CheckCircle2 size={14} />
                            Join Event
                        </Link>
                    )}
                </div>
            </div>
        </article>
    );
}
