import { unstable_cache } from 'next/cache';

/**
 * Cache tags used for on-demand revalidation.
 * Call `revalidateTag(tag)` in server actions after mutations.
 */
export const CacheTags = {
    EXPLORE_EVENTS: 'explore-events',
    COMMUNITIES: 'communities',
    communityDetail: (slug: string) => `community-${slug}`,
} as const;

/**
 * Wraps a fetcher with `unstable_cache`.
 *
 * @param fn       — async fetcher function
 * @param keyParts — cache key segments (must be serialisable)
 * @param tags     — cache tags for revalidation
 * @param revalidate — seconds until stale (default 60)
 */
export function cached<T>(
    fn: () => Promise<T>,
    keyParts: string[],
    tags: string[],
    revalidate = 60,
): Promise<T> {
    return unstable_cache(fn, keyParts, { tags, revalidate })();
}
