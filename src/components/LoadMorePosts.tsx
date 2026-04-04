'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadMorePostsProps {
    communityId: number;
    lastPostDate: string;
    hasMore: boolean;
}

export function LoadMorePosts({ communityId, lastPostDate, hasMore: initialHasMore }: LoadMorePostsProps) {
    const [loading, startTransition] = useTransition();
    const [hasMore, setHasMore] = useState(initialHasMore);

    if (!hasMore) return null;

    const handleLoadMore = () => {
        startTransition(async () => {
            // Trigger a page refresh with cursor parameter
            // The server component handles the actual fetching
            const url = new URL(window.location.href);
            url.searchParams.set('before', lastPostDate);
            window.location.href = url.toString();
        });
    };

    return (
        <div className="mt-6 text-center">
            <button
                onClick={handleLoadMore}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <Loader2 size={14} className="animate-spin" />
                        Loading...
                    </>
                ) : (
                    'Load more posts'
                )}
            </button>
        </div>
    );
}
