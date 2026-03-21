'use client';

import Link from 'next/link';

interface JoinCommunityButtonProps {
    communityId: number;
    communitySlug: string;
    isLoggedIn: boolean;
    isMember: boolean;
    hasPendingRequest: boolean;
}

export function JoinCommunityButton({
    communitySlug,
    isLoggedIn,
    isMember,
    hasPendingRequest,
}: JoinCommunityButtonProps) {
    if (isMember) {
        return (
            <div className="inline-flex px-6 py-3 text-sm font-semibold text-green-700 bg-green-50 rounded-xl border border-green-200">
                ✓ You&apos;re a member
            </div>
        );
    }

    if (hasPendingRequest) {
        return (
            <div className="inline-flex px-6 py-3 text-sm font-semibold text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
                ⏳ Application pending review
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <Link
                href={`/login?next=/community/${communitySlug}/join`}
                className="inline-flex px-6 py-3 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
            >
                Sign in to Apply
            </Link>
        );
    }

    return (
        <Link
            href={`/community/${communitySlug}/join`}
            className="inline-flex px-6 py-3 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
        >
            Join Community
        </Link>
    );
}
