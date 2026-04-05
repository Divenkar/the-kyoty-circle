import { CommunityRepository } from '@/lib/repositories/community-repo';
import { CityRepository } from '@/lib/repositories/city-repo';
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

export default async function CommunitiesPage({ searchParams }: CommunitiesPageProps) {
    const params = await searchParams;
    const city = params.city || 'all';
    const query = params.q || '';
    const category = params.category || 'all';

    const [communities, currentUser, allCities] = await Promise.all([
        cached(
            () => CommunityRepository.search({ city, query, category }),
            ['communities', city, query, category],
            [CacheTags.COMMUNITIES],
            60, // 60s revalidation for community listing
        ),
        getCurrentUser(),
        CityRepository.getAll().catch(() => []),
    ]);

    const cityOptions = [
        { label: 'All Cities', value: 'all' },
        ...allCities.map((c) => ({ label: c.name, value: c.name })),
    ];

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
            {/* Hero header */}
            <div className="border-b border-neutral-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-primary-600 tracking-wide">
                            Community-led discovery
                        </p>
                        <h1 className="font-display text-2xl tracking-tight text-neutral-900 sm:text-3xl">
                            {city === 'all' ? 'Browse communities' : `Communities in ${city}`}
                            {category !== 'all' && <span className="text-primary-500"> · {category}</span>}
                        </h1>
                        <p className="mt-1 max-w-xl text-sm leading-relaxed text-neutral-500">
                            Discover local groups and trusted organizers building recurring experiences around shared interests.
                        </p>
                    </div>

                    {/* Stats + City pills row */}
                    <div className="mt-6 flex items-center gap-2 text-sm">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary-700">{communities.length}</span>
                        <span className="mr-4 text-neutral-500">{hasFilters ? 'matching' : 'available'}</span>
                    </div>

                    {/* City filter pills */}
                    <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {cityOptions.map((option) => (
                            <Link
                                key={option.value}
                                href={`/communities?city=${option.value}${query ? `&q=${encodeURIComponent(query)}` : ''}${category !== 'all' ? `&category=${encodeURIComponent(category)}` : ''}`}
                                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                    city === option.value
                                        ? 'bg-neutral-900 text-white'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
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

                {/* Suggested for you */}
                {showSuggested && suggestedCommunities.length > 0 && (
                    <div className="mb-8 rounded-2xl border border-primary-100 bg-primary-50/50 p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <Sparkles size={16} className="text-primary-600" />
                            <div>
                                <p className="text-sm font-semibold text-neutral-900">Suggested for you</p>
                                <p className="text-xs text-neutral-500">
                                    Based on: {interestTags.slice(0, 3).join(', ')}
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
                <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5">
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
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {communities.map((community) => (
                            <CommunityCard
                                key={community.id}
                                community={community}
                                memberCount={community.member_count || 0}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                            <Users size={24} className="text-primary-500" />
                        </div>
                        {hasFilters ? (
                            <>
                                <h3 className="font-display text-lg text-neutral-900">No communities found</h3>
                                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
                                    Try different keywords or remove some filters to see more results.
                                </p>
                                <Link
                                    href="/communities"
                                    className="mt-5 inline-flex rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                                >
                                    Clear all filters
                                </Link>
                            </>
                        ) : (
                            <>
                                <h3 className="font-display text-lg text-neutral-900">No communities yet</h3>
                                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
                                    Be the first to start a community in this city and bring people together.
                                </p>
                                <Link
                                    href="/create-community"
                                    className="mt-5 inline-flex rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
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
