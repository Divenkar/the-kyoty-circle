import Link from 'next/link';
import { Calendar, Clock, Users, ArrowRight, TrendingUp, ExternalLink } from 'lucide-react';
import type { KyotyEvent, Community } from '@/types';

interface CommunityRightPanelProps {
    upcomingEvents: KyotyEvent[];
    relatedCommunities: Community[];
    communitySlug: string;
    isMember: boolean;
}

function formatEventDate(dateStr: string) {
    const d = new Date(dateStr);
    return {
        day: d.getDate(),
        month: d.toLocaleDateString('en-IN', { month: 'short' }),
        weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        full: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
}

export function CommunityRightPanel({
    upcomingEvents,
    relatedCommunities,
    communitySlug,
    isMember,
}: CommunityRightPanelProps) {
    return (
        <aside className="space-y-4">
            {/* Upcoming Events */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        Upcoming Events
                    </h3>
                    <Link
                        href={`/community/${communitySlug}`}
                        className="text-[10px] font-medium text-primary-600 hover:text-primary-700"
                    >
                        View all →
                    </Link>
                </div>

                {upcomingEvents.length > 0 ? (
                    <div className="space-y-2">
                        {upcomingEvents.slice(0, 4).map((event) => {
                            const d = formatEventDate(event.date);
                            const spotsLeft = Math.max((event.max_participants || 0) - (event.registered_count || 0), 0);
                            return (
                                <Link
                                    key={event.id}
                                    href={`/event/${event.id}`}
                                    className="group flex items-start gap-2.5 rounded-lg border border-neutral-100 p-2 transition hover:border-neutral-200 hover:bg-neutral-50"
                                >
                                    <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-neutral-50 text-center">
                                        <span className="text-[9px] font-semibold uppercase leading-none text-neutral-400">{d.month}</span>
                                        <span className="text-sm font-bold leading-none text-neutral-900">{d.day}</span>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-neutral-900 group-hover:text-primary-700 leading-snug">
                                            {event.title}
                                        </p>
                                        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-neutral-400">
                                            <span className="flex items-center gap-0.5">
                                                <Clock size={9} />
                                                {event.start_time || d.weekday}
                                            </span>
                                            <span>
                                                {spotsLeft > 0 ? `${spotsLeft} spots` : 'Full'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-lg bg-neutral-50 px-4 py-5 text-center">
                        <p className="text-xs text-neutral-400">No upcoming events</p>
                        {isMember && (
                            <Link
                                href="/create-event"
                                className="mt-2 inline-block text-xs font-medium text-primary-600 hover:underline"
                            >
                                Create one →
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Activity */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Activity
                </h3>
                <div className="space-y-1.5 text-xs text-neutral-600">
                    <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                        <span>Posts this week</span>
                        <span className="font-medium text-neutral-900">—</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                        <span>Active members</span>
                        <span className="font-medium text-neutral-900">—</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                        <span>Events</span>
                        <span className="font-medium text-neutral-900">{upcomingEvents.length > 0 ? upcomingEvents.length : '—'}</span>
                    </div>
                </div>
            </div>

            {/* Related communities */}
            {relatedCommunities.length > 0 && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                    <div className="mb-2.5 flex items-center justify-between">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                            Similar
                        </h3>
                        <Link
                            href="/communities"
                            className="text-[10px] font-medium text-primary-600 hover:text-primary-700"
                        >
                            Browse all →
                        </Link>
                    </div>
                    <div className="space-y-1.5">
                        {relatedCommunities.slice(0, 4).map((c) => (
                            <Link
                                key={c.id}
                                href={`/community/${c.slug || c.id}`}
                                className="group flex items-center gap-2.5 rounded-lg p-2 transition hover:bg-neutral-50"
                            >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-[11px] font-bold text-primary-700">
                                    {c.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-medium text-neutral-900 group-hover:text-primary-700">
                                        {c.name}
                                    </p>
                                    <p className="text-[10px] text-neutral-400">
                                        {c.member_count || 0} members
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Share CTA */}
            <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-xs font-medium text-neutral-700 mb-1">Know someone who&apos;d love this?</p>
                <p className="text-[11px] text-neutral-500 mb-3">Share this community with friends.</p>
                <Link
                    href={`/community/${communitySlug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                    <ExternalLink size={11} />
                    Share
                </Link>
            </div>
        </aside>
    );
}
