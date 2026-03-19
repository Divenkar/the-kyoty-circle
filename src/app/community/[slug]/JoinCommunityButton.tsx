'use client';

import React from 'react';
import { joinCommunityAction } from '@/server/actions/community.actions';

interface JoinCommunityButtonProps {
    communityId: number;
    isLoggedIn: boolean;
    isMember: boolean;
    hasPendingRequest: boolean;
}

export function JoinCommunityButton({
    communityId,
    isLoggedIn,
    isMember,
    hasPendingRequest,
}: JoinCommunityButtonProps) {
    const [loading, setLoading] = React.useState(false);
    const [status, setStatus] = React.useState<'idle' | 'pending' | 'member'>(
        isMember ? 'member' : hasPendingRequest ? 'pending' : 'idle'
    );
    const [error, setError] = React.useState('');

    const handleJoin = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await joinCommunityAction(communityId);
            if (result.success) {
                setStatus('pending');
            } else {
                setError(result.error || 'Failed to apply');
            }
        } catch {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <a
                href="/login"
                className="inline-flex px-6 py-3 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
            >
                Sign in to Apply
            </a>
        );
    }

    if (status === 'member') {
        return (
            <div className="inline-flex px-6 py-3 text-sm font-semibold text-green-700 bg-green-50 rounded-xl border border-green-200">
                ✓ You&apos;re a member
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="inline-flex px-6 py-3 text-sm font-semibold text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
                ⏳ Application pending
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={handleJoin}
                disabled={loading}
                className="inline-flex px-6 py-3 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-sm disabled:opacity-50"
            >
                {loading ? 'Applying...' : 'Apply to Join'}
            </button>
            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
