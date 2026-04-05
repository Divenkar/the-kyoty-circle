import Link from 'next/link';
import Image from 'next/image';
import {
    MapPin, Users, Star, ShieldCheck, Calendar, Lock, Globe,
    MessageCircle, ImageIcon, Settings, ExternalLink,
} from 'lucide-react';
import type { Community, CommunityRole } from '@/types';

interface CommunitySidebarProps {
    community: Community;
    memberCount: number;
    moderators: CommunityRole[];
    isMember: boolean;
    canManage: boolean;
    communitySlug: string;
}

const COMMUNITY_RULES = [
    'Be respectful and kind to all members.',
    'No spam or self-promotion without context.',
    'Keep posts relevant to the community topic.',
    'Use real information — no fake profiles.',
    'Event RSVPs are commitments. Cancel early if plans change.',
];

export function CommunitySidebar({
    community,
    memberCount,
    moderators,
    isMember,
    canManage,
    communitySlug,
}: CommunitySidebarProps) {
    const ratingDisplay = community.rating_count > 0
        ? `${Number(community.rating_avg).toFixed(1)} · ${community.rating_count} review${community.rating_count !== 1 ? 's' : ''}`
        : 'No reviews yet';

    return (
        <aside className="space-y-4">
            {/* Community identity card */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                {/* Mini cover */}
                <div className="relative h-16 bg-gradient-to-br from-primary-400 to-primary-600">
                    {community.cover_image_url && (
                        <Image
                            src={community.cover_image_url}
                            alt={community.name}
                            fill
                            className="object-cover opacity-70"
                        />
                    )}
                </div>

                <div className="p-4">
                    <h2 className="text-sm font-semibold text-neutral-900 leading-snug">{community.name}</h2>
                    {community.description && (
                        <p className="mt-1.5 text-xs leading-5 text-neutral-500 line-clamp-3">
                            {community.description}
                        </p>
                    )}

                    {/* Stats row */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-neutral-50 px-3 py-2 text-center">
                            <p className="text-sm font-bold text-neutral-900">{memberCount}</p>
                            <p className="text-[10px] text-neutral-500">Members</p>
                        </div>
                        <div className="rounded-lg bg-neutral-50 px-3 py-2 text-center">
                            <p className="text-sm font-bold text-neutral-900">
                                {community.rating_count > 0 ? Number(community.rating_avg).toFixed(1) : '—'}
                            </p>
                            <p className="text-[10px] text-neutral-500">Rating</p>
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="mt-3 space-y-1 text-xs text-neutral-500">
                        {community.city_name && (
                            <div className="flex items-center gap-2">
                                <MapPin size={11} className="text-neutral-400 shrink-0" />
                                {community.city_name}
                            </div>
                        )}
                        {community.category && (
                            <div className="flex items-center gap-2">
                                <Star size={11} className="text-neutral-400 shrink-0" />
                                {community.category}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            {community.visibility === 'private'
                                ? <Lock size={11} className="text-neutral-400 shrink-0" />
                                : <Globe size={11} className="text-neutral-400 shrink-0" />
                            }
                            {community.visibility === 'private' ? 'Private' : 'Public'}
                        </div>
                    </div>

                    {/* Quick links for members */}
                    {isMember && (
                        <div className="mt-4 border-t border-neutral-100 pt-3 space-y-0.5">
                            <Link
                                href={`/community/${communitySlug}/feed`}
                                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
                            >
                                <MessageCircle size={12} className="text-neutral-400" />
                                Feed
                            </Link>
                            <Link
                                href={`/community/${communitySlug}/chat`}
                                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
                            >
                                <MessageCircle size={12} className="text-neutral-400" />
                                Chat
                            </Link>
                            <Link
                                href={`/community/${communitySlug}/media`}
                                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
                            >
                                <ImageIcon size={12} className="text-neutral-400" />
                                Gallery
                            </Link>
                            <Link
                                href={`/community/${communitySlug}/members`}
                                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
                            >
                                <Users size={12} className="text-neutral-400" />
                                Members
                            </Link>
                            {canManage && (
                                <Link
                                    href={`/community/${communitySlug}/manage`}
                                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
                                >
                                    <Settings size={12} className="text-neutral-400" />
                                    Manage
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Community rules */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">Rules</h3>
                <ol className="space-y-1.5">
                    {COMMUNITY_RULES.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs leading-5 text-neutral-600">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[9px] font-bold text-neutral-500">
                                {i + 1}
                            </span>
                            {rule}
                        </li>
                    ))}
                </ol>
            </div>

            {/* Moderators */}
            {(moderators.length > 0 || community.organizer) && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                    <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">Moderators</h3>
                    <div className="space-y-2">
                        {community.organizer && (
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100">
                                    {(community.organizer as any).avatar_url ? (
                                        <Image
                                            src={(community.organizer as any).avatar_url}
                                            alt={community.organizer.name}
                                            width={28}
                                            height={28}
                                            className="h-full w-full rounded-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="text-[10px] font-bold text-primary-700">
                                            {community.organizer.name?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-medium text-neutral-900">
                                        {community.organizer.name}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <ShieldCheck size={9} className="text-green-600" />
                                        <span className="text-[10px] text-green-600">Organizer</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {moderators.map((mod) => {
                            const modUser = mod.kyoty_users;
                            if (!modUser) return null;
                            return (
                                <div key={mod.id} className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-100">
                                        {modUser.avatar_url ? (
                                            <Image
                                                src={modUser.avatar_url}
                                                alt={modUser.name}
                                                width={28}
                                                height={28}
                                                className="h-full w-full rounded-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <span className="text-[10px] font-bold text-violet-700">
                                                {modUser.name?.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-neutral-900">{modUser.name}</p>
                                        <span className="text-[10px] capitalize text-violet-600">{mod.role}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Create post CTA */}
            {isMember && (
                <Link
                    href={`/post/create?community=${communitySlug}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                    <MessageCircle size={14} />
                    Create Post
                </Link>
            )}
        </aside>
    );
}
