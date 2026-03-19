import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MapPin, Users } from 'lucide-react';
import type { Community } from '@/types';

interface CommunityCardProps {
    community: Community;
    memberCount?: number;
}

export function CommunityCard({ community, memberCount = 0 }: CommunityCardProps) {
    const communityHref = `/community/${community.slug || community.id}`;

    return (
        <Link href={communityHref} className="group block h-full">
            <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-300 hover:shadow-cardHover">
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary-200 via-primary-300 to-primary-400">
                    {community.cover_image_url ? (
                        <Image
                            src={community.cover_image_url}
                            alt={community.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Users size={34} className="text-primary-700/55" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />

                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary-700 backdrop-blur-sm">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        {community.category || 'Community'}
                    </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-900 transition-colors group-hover:text-primary-600">
                                {community.name}
                            </h3>
                            {community.city_name && (
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
                                    <MapPin size={14} className="text-neutral-400" />
                                    {community.city_name}
                                </p>
                            )}
                        </div>

                        <div className="rounded-full bg-primary-50 p-2 text-primary-600 transition-colors group-hover:bg-primary-100">
                            <ArrowUpRight size={16} />
                        </div>
                    </div>

                    {community.description && (
                        <p className="mb-4 line-clamp-3 text-sm leading-6 text-neutral-600">
                            {community.description}
                        </p>
                    )}

                    <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-4 text-sm">
                        <span className="inline-flex items-center gap-2 font-medium text-neutral-700">
                            <Users size={14} className="text-primary-500" />
                            {memberCount} member{memberCount === 1 ? '' : 's'}
                        </span>
                        <span className="font-semibold text-primary-600">View community</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
