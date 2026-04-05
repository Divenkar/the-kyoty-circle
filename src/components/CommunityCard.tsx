import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MapPin, Star, Users } from 'lucide-react';
import type { Community } from '@/types';

interface CommunityCardProps {
    community: Community;
    memberCount?: number;
}

export function CommunityCard({ community, memberCount = 0 }: CommunityCardProps) {
    const communityHref = `/community/${community.slug || community.id}`;
    const hasRating = community.rating_count > 0 && community.rating_avg != null;

    return (
        <Link href={communityHref} className="group block h-full">
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-200 hover:border-neutral-300 hover:shadow-md">
                {/* Cover image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200">
                    {community.cover_image_url ? (
                        <Image
                            src={community.cover_image_url}
                            alt={community.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Users size={28} className="text-primary-400" />
                        </div>
                    )}

                    {/* Category badge */}
                    <div className="absolute left-3 top-3 rounded-md bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 shadow-sm">
                        {community.category || 'Community'}
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-[15px] font-semibold text-neutral-900 transition-colors group-hover:text-primary-600">
                        {community.name}
                    </h3>

                    {community.city_name && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
                            <MapPin size={12} className="text-neutral-400" />
                            {community.city_name}
                        </p>
                    )}

                    {community.description && (
                        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-neutral-500">
                            {community.description}
                        </p>
                    )}

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-3 text-xs">
                        <span className="inline-flex items-center gap-1.5 text-neutral-500">
                            <Users size={12} />
                            {memberCount} member{memberCount === 1 ? '' : 's'}
                        </span>

                        {hasRating ? (
                            <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                {Number(community.rating_avg).toFixed(1)}
                            </span>
                        ) : (
                            <span className="font-medium text-primary-600 transition-colors group-hover:text-primary-700">
                                View →
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
