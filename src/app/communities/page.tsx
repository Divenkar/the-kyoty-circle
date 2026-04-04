import { CommunityRepository } from '@/lib/repositories/community-repo';
import { getCurrentUser } from '@/lib/auth-server';
import { CommunityCard } from '@/components/CommunityCard';
import { CommunitiesFilters } from '@/components/CommunitiesFilters';
import { cached, CacheTags } from '@/lib/cache';
import { MapPin, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Communities | Kyoty',
    description: 'Discover and join communities near you on Kyoty',
};

interface CommunitiesPageProps {
    searchParams: Promise<{ city?: string; q?: string; category?: string }>;
}

const CITY_OPTIONS = [
    { label: 'All Cities', value: 'all' },
    { label: 'Noida', value: 'Noida' },
    { label: 'Delhi', value: 'Delhi' },
    { label: 'Gurgaon', value: 'Gurgaon' },
    { label: 'Bangalore', value: 'Bangalore' },
];

export default async function CommunitiesPage({ searchParams }: CommunitiesPageProps) {
    const params = await searchParams;
    const city = params.city || 'all';
    const query = params.q || '';
    const category = params.category || 'all';

    const [communities, currentUser] = await Promise.all([
        cached(
            () => CommunityRepository.search({ city, query, category }),
            ['communities', city, query, category],
            [CacheTags.COMMUNITIES],
            60, // 60s revalidation for community listing
        ),
        getCurrentUser(),
    ]);

    // Fetch interest-based suggestions when user has tags and no active filters
    const hasFilters = query || (category && category !== 'all');
    const interestTags = currentUser?.interest_tags ?? [];
    const showSuggested = !hasFilters && interestTags.length > 0;

    let suggestedCommunities: typeof communities = [];
    if (showSuggested) {
        const allByInterest = await CommunityRepository.search({ city, query: '', category: 'all' });
        // Filter to those whose category matches an interest tag (case-insensitive)
        const lowerTags = interestTags.map((t) => t.toLowerCase());
        suggestedCommunities = allByInterest
            .filter((c) => lowerTags.some((t) => c.category?.toLowerCase().includes(t)))
            .slice(0, 3);
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="border-b border-neutral-200 bg-[radial-gradient(circle_at_top_left,_rgba(108,71,255,0.1),_transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
                    <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
                                <Sparkles size={15} />
                                Community-led discovery
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                                {city === 'all' ? 'Browse communities' : `${city} communities`}
                                {category !== 'all' && <span className="text-primary-500"> · {category}</span>}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                                Discover niche circles, local groups, and trusted organizers building recurring experiences around shared interests.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Found</div>
                            <div className="mt-2 text-3xl font-bold text-neutral-900">{communities.length}</div>
                            <div className="mt-1 text-sm text-neutral-500">
                                {hasFilters ? 'matching your filters' : 'communities available'}
                            </div>
                        </div>
                    </div>

                    {/* City filter pills */}
                    <div className="mt-7 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {CITY_OPTIONS.map((option) => (
                            <Link
                                key={option.value}
                                href={`/communities?city=${option.value}${query ? `&q=${encodeURIComponent(query)}` : ''}${category !== 'all' ? `&category=${encodeURIComponent(category)}` : ''}`}
                                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                                    city === option.value
                                        ? 'border-primary-600 bg-primary-600 text-white'
                                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 hover:text-primary-600'
                                }`}
                            >
                                {option.value !== 'all' && <MapPin size={14} className="mr-1 inline" />}
                                {option.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

                {/* ── Suggested for you ───────────────────────────────── */}
                {showSuggested && suggestedCommunities.length > 0 && (
                    <div className="mb-8 rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-violet-50 p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary-100">
                                <Sparkles size={14} className="text-primary-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-primary-900">Suggested for you</p>
                                <p className="text-xs text-primary-600">
                                    Based on your interests: {interestTags.slice(0, 3).join(', ')}
                                    {interestTags.length > 3 ? ` +${interestTags.length - 3} more` : ''}
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {suggestedCommunities.map((community) => (
                                <CommunityCard
                                    key={community.id}
                                    community={community}
                                    memberCount={community.member_count || 0}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Search + category filters */}
                <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <Suspense>
                        <CommunitiesFilters
                            currentQuery={query}
                            currentCategory={category}
                            currentCity={city}
                        />
                    </Suspense>
                </div>

                {/* Results */}
                {communities.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {communities.map((community) => (
                            <CommunityCard
                                key={community.id}
                                community={community}
                                memberCount={community.member_count || 0}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
                            <Users size={28} className="text-primary-500" />
                        </div>
                        {hasFilters ? (
                            <>
                                <h3 className="text-xl font-semibold text-neutral-900">No communities match your search</h3>
                                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-neutral-500">
                                    Try different keywords or remove some filters to see more results.
                                </p>
                                <Link
                                    href="/communities"
                                    className="mt-6 inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                                >
                                    Clear all filters
                                </Link>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-semibold text-neutral-900">No communities yet</h3>
                                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-neutral-500">
                                    This city needs a few founding communities to make discovery feel alive. Be the first to create one.
                                </p>
                                <Link
                                    href="/create-community"
                                    className="mt-6 inline-flex rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                                >
                                    Create Community
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
