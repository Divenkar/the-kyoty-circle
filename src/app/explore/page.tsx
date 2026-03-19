import { EventRepository } from '@/lib/repositories/event-repo';
import { EventCard } from '@/components/EventCard';
import { EVENT_CATEGORIES } from '@/types';
import { FilterBar } from '@/components/FilterBar';
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
    }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
    const params = await searchParams;
    const city = params.city || 'Noida';
    const category = params.category || 'All';

    const hasFilters = params.q || params.from || params.to || params.price;
    const events = hasFilters
        ? await EventRepository.search({
            query: params.q,
            dateFrom: params.from,
            dateTo: params.to,
            isPaid: params.price === 'paid' ? true : params.price === 'free' ? false : undefined,
            city: city === 'all' ? undefined : city,
            category,
        })
        : city === 'all'
            ? await EventRepository.findAll(category)
            : await EventRepository.findByCity(city, category);

    const buildCategoryHref = (cat: string) => {
        const nextParams = new URLSearchParams();
        nextParams.set('city', city);
        nextParams.set('category', cat);
        if (params.q) nextParams.set('q', params.q);
        if (params.from) nextParams.set('from', params.from);
        if (params.to) nextParams.set('to', params.to);
        if (params.price) nextParams.set('price', params.price);
        return `/explore?${nextParams.toString()}`;
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="border-b border-neutral-200 bg-[radial-gradient(circle_at_top_right,_rgba(129,140,248,0.16),_transparent_25%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
                    <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
                                <Sparkles size={15} />
                                Curated event discovery
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                                {city === 'all' ? 'Explore events everywhere' : `Explore events in ${city}`}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                                Browse trusted events hosted by communities, then narrow the list by category, date, pricing, and keywords.
                            </p>
                        </div>

                        <div className="grid gap-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-2">
                            <div className="rounded-2xl bg-neutral-50 p-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Available now</div>
                                <div className="mt-2 text-2xl font-bold text-neutral-900">{events.length}</div>
                                <div className="mt-1 text-sm text-neutral-500">event{events.length !== 1 ? 's' : ''}</div>
                            </div>
                            <div className="rounded-2xl bg-neutral-50 p-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Active filters</div>
                                <div className="mt-2 text-2xl font-bold text-neutral-900">{[params.q, params.from || params.to, params.price].filter(Boolean).length}</div>
                                <div className="mt-1 text-sm text-neutral-500">search refinements</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-7 flex gap-2 overflow-x-auto pb-1">
                        {EVENT_CATEGORIES.map((cat) => (
                            <Link
                                key={cat}
                                href={buildCategoryHref(cat)}
                                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${cat === category
                                    ? 'border-primary-600 bg-primary-600 text-white shadow-sm'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 hover:text-primary-600'
                                    }`}
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>

                    <Suspense fallback={null}>
                        <FilterBar />
                    </Suspense>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                {events.length > 0 ? (
                    <>
                        <div className="mb-5 flex items-center gap-2 text-sm text-neutral-500">
                            <MapPin size={15} className="text-primary-500" />
                            Showing {events.length} result{events.length !== 1 ? 's' : ''} for {city === 'all' ? 'all cities' : city}
                            {category !== 'All' && <span>· {category}</span>}
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {events.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
                            <CalendarRange size={28} className="text-primary-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900">No events match these filters</h3>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-neutral-500">
                            {params.q
                                ? `We couldn’t find any events matching “${params.q}”. Try broadening the keyword or clearing a few filters.`
                                : category !== 'All'
                                    ? `There are no ${category.toLowerCase()} events for this view yet. Try a different category or switch cities.`
                                    : 'No events are available right now. This is a good moment to seed the experience with more community-led events.'}
                        </p>
                        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link href="/create-community" className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
                                Create a community
                            </Link>
                            <Link href="/explore?city=Noida&category=All" className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:border-primary-300 hover:text-primary-600">
                                Reset browse view
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
