import { EventRepository } from '@/lib/repositories/event-repo';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { EventCard } from '@/components/EventCard';
import { CommunityCard } from '@/components/CommunityCard';
import { cached, CacheTags } from '@/lib/cache';
import { SearchInput } from './SearchInput';
import { Search, Users, Calendar, Sparkles } from 'lucide-react';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Search | Kyoty',
};

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
    }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const query = params.q?.trim() || '';

    const hasQuery = query.length > 0;

    const [communities, events] = hasQuery
        ? await Promise.all([
              cached(
                  () =>
                      CommunityRepository.search({
                          city: 'all',
                          query,
                          category: 'all',
                      }),
                  ['search-communities', query],
                  [CacheTags.COMMUNITIES],
                  30,
              ),
              cached(
                  () =>
                      EventRepository.search({
                          query,
                      }),
                  ['search-events', query],
                  [CacheTags.EXPLORE_EVENTS],
                  30,
              ),
          ])
        : [[], []];

    const totalResults = communities.length + events.length;

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="border-b border-neutral-200 bg-[radial-gradient(circle_at_top_right,_rgba(108,71,255,0.1),_transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
                    <div className="text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
                            <Sparkles size={15} />
                            Discover what matters
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                            {hasQuery
                                ? `Results for "${query}"`
                                : 'Search Kyoty'}
                        </h1>
                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                            Find communities and events across the Kyoty network.
                        </p>
                    </div>

                    <div className="mt-8">
                        <Suspense
                            fallback={
                                <div className="mx-auto max-w-2xl">
                                    <div className="h-14 animate-pulse rounded-2xl bg-neutral-200" />
                                </div>
                            }
                        >
                            <SearchInput />
                        </Suspense>
                    </div>

                    {hasQuery && (
                        <div className="mt-5 text-center text-sm text-neutral-500">
                            <Search size={14} className="mr-1.5 inline text-primary-500" />
                            Found {totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                {!hasQuery ? (
                    /* No query — prompt state */
                    <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
                            <Search size={28} className="text-primary-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900">
                            Start typing to search
                        </h3>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-neutral-500">
                            Search for communities by name or topic, and events by title, description, or location.
                        </p>
                    </div>
                ) : totalResults === 0 ? (
                    /* Query but no results */
                    <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
                            <Search size={28} className="text-primary-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900">
                            No results found
                        </h3>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-neutral-500">
                            We couldn&apos;t find any communities or events matching
                            &ldquo;{query}&rdquo;. Try a different keyword or broaden your search.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Communities section */}
                        {communities.length > 0 && (
                            <section>
                                <div className="mb-5 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                                        <Users size={16} className="text-primary-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-neutral-900">
                                        Communities
                                    </h2>
                                    <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                                        {communities.length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {communities.map((community) => (
                                        <CommunityCard
                                            key={community.id}
                                            community={community}
                                            memberCount={community.member_count ?? 0}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Events section */}
                        {events.length > 0 && (
                            <section>
                                <div className="mb-5 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                                        <Calendar size={16} className="text-primary-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-neutral-900">
                                        Events
                                    </h2>
                                    <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                                        {events.length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {events.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
