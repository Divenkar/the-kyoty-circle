import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users } from 'lucide-react';
import type { Community } from '@/types';

interface CommunityCardProps {
    community: Community;
    memberCount?: number;
}

export function CommunityCard({ community, memberCount = 0 }: CommunityCardProps) {
    return (
        <Link href={`/community/${community.id}`} className="group block">
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-card hover:shadow-cardHover transition-all duration-300 hover:-translate-y-1">
                {/* Cover Image */}
                <div className="relative h-36 bg-gradient-to-br from-primary-200 to-primary-300 overflow-hidden">
                    {community.cover_image_url ? (
                        <Image
                            src={community.cover_image_url}
                            alt={community.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Users size={32} className="text-primary-400" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="text-sm font-semibold text-neutral-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {community.name}
                    </h3>
                    {community.description && (
                        <p className="text-xs text-neutral-500 line-clamp-2 mt-1 mb-2">
                            {community.description}
                        </p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <Users size={12} />
                        <span>{memberCount} members</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
