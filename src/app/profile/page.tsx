import { getCurrentUser } from '@/lib/auth-server';
import { EventParticipantRepository } from '@/lib/repositories/event-participant-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { PostRepository } from '@/lib/repositories/post-repo';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    Calendar, Users, MapPin, Linkedin, Instagram,
    ShieldCheck, Pencil, Rss, ArrowRight, Clock,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Profile | Kyoty',
};

function initials(name: string) {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default async function ProfilePage() {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const [upcomingRSVPs, memberships, posts] = await Promise.all([
        EventParticipantRepository.listUpcomingByUser(user.id),
        CommunityMemberRepository.listByUser(user.id),
        PostRepository.findByUser(user.id, 6),
    ]);

    const approvedMemberships = memberships.filter((m: any) => m.status === 'approved');
    const memberSince = new Date(user.created_at).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
    });

    const isVerified = !!user.social_proof_type && !!user.social_proof_link;

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* ── Profile Header ────────────────────────────────────────── */}
            <div className="border-b border-neutral-200 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.10),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-neutral-200 bg-primary-100 sm:h-24 sm:w-24">
                                {user.avatar_url ? (
                                    <Image
                                        src={user.avatar_url}
                                        alt={user.name}
                                        width={96}
                                        height={96}
                                        className="h-full w-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary-600">
                                        {initials(user.name || 'U')}
                                    </div>
                                )}
                            </div>
                            {isVerified && (
                                <div className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow">
                                    <ShieldCheck size={13} className="text-white" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">{user.name}</h1>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                                        {(user as any).default_city && (
                                            <span className="flex items-center gap-1">
                                                <MapPin size={13} />
                                                {(user as any).default_city}
                                            </span>
                                        )}
                                        <span>Member since {memberSince}</span>
                                    </div>
                                </div>
                                <Link
                                    href="/profile/edit"
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-primary-300 hover:text-primary-700"
                                >
                                    <Pencil size={13} />
                                    Edit profile
                                </Link>
                            </div>

                            {/* Interest tags */}
                            {user.interest_tags?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {user.interest_tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full border border-primary-200 bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Verification */}
                            {isVerified && (
                                <div className="mt-3">
                                    <a
                                        href={user.social_proof_link!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                                    >
                                        {user.social_proof_type === 'linkedin'
                                            ? <Linkedin size={12} />
                                            : <Instagram size={12} />
                                        }
                                        Verified via {user.social_proof_type === 'linkedin' ? 'LinkedIn' : 'Instagram'}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats strip */}
                    <div className="mt-6 flex flex-wrap gap-3">
                        {[
                            { icon: Rss, label: 'posts', value: posts.length },
                            { icon: Users, label: 'communities', value: approvedMemberships.length },
                            { icon: Calendar, label: 'upcoming events', value: upcomingRSVPs.length },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-white px-4 py-2.5 shadow-sm text-sm">
                                <s.icon size={14} className="text-primary-600" />
                                <span className="font-bold text-neutral-900">{s.value}</span>
                                <span className="text-neutral-500">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Content ───────────────────────────────────────────────── */}
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-8">

                {/* Recent Posts */}
                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-base font-bold text-neutral-900">Recent Posts</h2>
                    </div>

                    {posts.length > 0 ? (
                        <div className="space-y-3">
                            {posts.map((post: any) => (
                                <div
                                    key={post.id}
                                    className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm leading-6 text-neutral-800 line-clamp-3">{post.content}</p>
                                    </div>
                                    <div className="mt-2 flex items-center gap-3 text-xs text-neutral-400">
                                        {post.community && (
                                            <Link
                                                href={`/community/${post.community.slug}/feed`}
                                                className="font-medium text-primary-600 hover:text-primary-700"
                                            >
                                                {post.community.name}
                                            </Link>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} />
                                            {timeAgo(post.created_at)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
                            <Rss size={24} className="mx-auto mb-3 text-neutral-300" />
                            <p className="text-sm font-medium text-neutral-500">No posts yet</p>
                            <p className="mt-1 text-xs text-neutral-400">Join a community and share something.</p>
                            <Link
                                href="/communities"
                                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-primary-300"
                            >
                                Browse communities
                            </Link>
                        </div>
                    )}
                </section>

                {/* Communities */}
                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-base font-bold text-neutral-900">Communities</h2>
                        <Link href="/communities" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                            Explore →
                        </Link>
                    </div>

                    {approvedMemberships.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {approvedMemberships.map((m: any) => {
                                const community = m.communities;
                                if (!community) return null;
                                const slug = community.slug || m.community_id;
                                return (
                                    <Link
                                        key={m.id}
                                        href={`/community/${slug}`}
                                        className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm transition hover:border-primary-300 hover:shadow-md"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-sm font-bold text-primary-700">
                                            {(community.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-neutral-900">{community.name}</p>
                                            <p className="text-xs text-neutral-500">{community.category}</p>
                                        </div>
                                        <ArrowRight size={14} className="shrink-0 text-neutral-300" />
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
                            <Users size={24} className="mx-auto mb-3 text-neutral-300" />
                            <p className="text-sm font-medium text-neutral-500">No communities yet</p>
                            <Link
                                href="/communities"
                                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-primary-300"
                            >
                                Find communities
                            </Link>
                        </div>
                    )}
                </section>

                {/* Upcoming Events */}
                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-base font-bold text-neutral-900">Upcoming Events</h2>
                        <Link href="/explore" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                            Find more →
                        </Link>
                    </div>

                    {upcomingRSVPs.length > 0 ? (
                        <div className="space-y-2">
                            {upcomingRSVPs.slice(0, 5).map((rsvp: any) => {
                                const event = rsvp.events;
                                if (!event) return null;
                                const dateStr = new Date(event.date).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                });
                                return (
                                    <Link
                                        key={rsvp.id}
                                        href={`/event/${event.id}`}
                                        className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white px-4 py-3.5 transition hover:border-primary-200 hover:shadow-sm"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-50 text-center">
                                            <span className="text-[10px] font-semibold uppercase leading-none text-primary-500">
                                                {new Date(event.date).toLocaleDateString('en-IN', { month: 'short' })}
                                            </span>
                                            <span className="mt-0.5 text-base font-extrabold leading-none text-primary-700">
                                                {new Date(event.date).getDate()}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold text-neutral-900">{event.title}</span>
                                            <span className="text-xs text-neutral-500">{dateStr}</span>
                                        </div>
                                        <ArrowRight size={14} className="shrink-0 text-neutral-300" />
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
                            <Calendar size={24} className="mx-auto mb-3 text-neutral-300" />
                            <p className="text-sm font-medium text-neutral-500">No upcoming events</p>
                            <Link
                                href="/explore"
                                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-primary-300"
                            >
                                Explore events
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
