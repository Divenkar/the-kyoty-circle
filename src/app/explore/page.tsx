import { EventRepository } from '@/lib/repositories/event-repo';
import { EventCard } from '@/components/EventCard';
import { EVENT_CATEGORIES } from '@/types';
import { FilterBar } from '@/components/FilterBar';
import { ExploreMobileActionBar } from '@/components/ExploreMobileActionBar';
import { cached, CacheTags } from '@/lib/cache';
import Link from 'next/link';
import { CalendarRange, MapPin, Sparkles } from 'lucide-react';
import { Suspense } from 'react';

interface ExplorePageProps {
    searchParams: Promise<{
        city?: string;
        category?: string;
        q?: string;
        from?: string;
        to?: string;
        price?: string;
        sort?: string;
    }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
    const params = await searchParams;
    const city = params.city || 'Noida';
    const category = params.category || 'All';
    const sort = params.sort || 'latest';

    const hasFilters = params.q || params.from || params.to || params.price;
    const events = await cached(
        () =>
            hasFilters
                ? EventRepository.search({
                    query: params.q,
                    dateFrom: params.from,
                    dateTo: params.to,
                    isPaid: params.price === 'paid' ? true : params.price === 'free' ? false : undefined,
                    city: city === 'all' ? undefined : city,
                    category,
                })
                : city === 'all'
                    ? EventRepository.findAll(category)
                    : EventRepository.findByCity(city, category),
        ['explore-events', city, category, params.q ?? '', params.from ?? '', params.to ?? '', params.price ?? ''],
        [CacheTags.EXPLORE_EVENTS],
        30, // 30s revalidation for explore
    );

    const sortedEvents = [...events].sort((a, b) => {
        const left = new Date(a.date).getTime();
        const right = new Date(b.date).getTime();

        if (sort === 'oldest') return left - right;
        return right - left;
    });

    const buildCategoryHref = (cat: string) => {
        const nextParams = new URLSearchParams();
        nextParams.set('city', city);
        nextParams.set('category', cat);
        if (params.q) nextParams.set('q', params.q);
        if (params.from) nextParams.set('from', params.from);
        if (params.to) nextParams.set('to', params.to);
        if (params.price) nextParams.set('price', params.price);
        if (params.sort) nextParams.set('sort', params.sort);
        return `/explore?${nextParams.toString()}`;
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero header */}
            <div className="border-b border-neutral-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-primary-600 tracking-wide">
                            Curated event discovery
                        </p>
                        <h1 className="font-display text-2xl tracking-tight text-neutral-900 sm:text-3xl">
                            {city === 'all' ? 'Explore events everywhere' : `Events in ${city}`}
                        </h1>
                        <p className="mt-1 max-w-xl text-sm leading-relaxed text-neutral-500">
                            Find trusted events from verified communities. Filter by category, date, or price.
                        </p>
                    </div>

                    {/* Stats row */}
                    <div className="mt-6 flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary-700">{events.length}</span>
                            <span className="text-neutral-500">event{events.length !== 1 ? 's' : ''} available</span>
                        </div>
                        {[params.q, params.from || params.to, params.price].filter(Boolean).length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-sm font-bold text-amber-700">
                                    {[params.q, params.from || params.to, params.price].filter(Boolean).length}
                                </span>
                                <span className="text-neutral-500">active filter{[params.q, params.from || params.to, params.price].filter(Boolean).length !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>

                    {/* Category pills */}
                    <div className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {EVENT_CATEGORIES.map((cat) => (
                            <Link
                                key={cat}
                                href={buildCategoryHref(cat)}
                                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${cat === category
                                    ? 'bg-neutral-900 text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                                    }`}
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>

                    <ExploreMobileActionBar />

                    <Suspense fallback={null}>
                        <FilterBar />
                    </Suspense>
                </div>
            </div>

            {/* Results */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                {sortedEvents.length > 0 ? (
                    <>
                        <div className="mb-5 flex items-center gap-2 text-sm text-neutral-500">
                            <MapPin size={15} className="text-primary-500" />
                            Showing {sortedEvents.length} result{sortedEvents.length !== 1 ? 's' : ''} for {city === 'all' ? 'all cities' : city}
                            {category !== 'All' && <span className="font-medium text-neutral-700">· {category}</span>}
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {sortedEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                            <CalendarRange size={24} className="text-primary-500" />
                        </div>
                        <h3 className="font-display text-lg text-neutral-900">No events found</h3>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-500">
                            {params.q
                                ? `Nothing matches "${params.q}". Try different keywords or clear some filters.`
                                : category !== 'All'
                                    ? `No ${category.toLowerCase()} events yet. Try another category or city.`
                                    : 'No events available right now. Start a community to host the first one.'}
                        </p>
                        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link href="/create-community" className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700">
                                Create a community
                            </Link>
                            <Link href="/explore?city=Noida&category=All" className="inline-flex items-center justify-center rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50">
                                Reset filters
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
