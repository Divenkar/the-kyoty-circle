import { EventRepository } from '@/lib/repositories/event-repo';
import { EventCard } from '@/components/EventCard';
import { EVENT_CATEGORIES } from '@/types';
import { FilterBar } from '@/components/FilterBar';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
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

    // Use new search method when filters are active
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

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 flex items-center gap-2">
                                <MapPin size={24} className="text-primary-600" />
                                {city === 'all' ? 'All Events' : `${city} Events`}
                            </h1>
                            <p className="text-neutral-500 mt-1">
                                {events.length} event{events.length !== 1 ? 's' : ''} available
                            </p>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 mt-6 overflow-x-auto pb-1 scrollbar-hide">
                        {EVENT_CATEGORIES.map((cat) => (
                            <Link
                                key={cat}
                                href={`/explore?city=${city}&category=${cat}`}
                                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 border
                  ${cat === category
                                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300 hover:text-primary-600'
                                    }`}
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>

                    {/* Filters */}
                    <Suspense fallback={null}>
                        <FilterBar />
                    </Suspense>
                </div>
            </div>

            {/* Events Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {events.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-100 flex items-center justify-center mb-4">
                            <MapPin size={28} className="text-primary-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">No events found</h3>
                        <p className="text-neutral-500 text-sm max-w-sm mx-auto">
                            {params.q
                                ? `No results for "${params.q}". Try a different search.`
                                : category !== 'All'
                                    ? `No ${category.toLowerCase()} events right now. Try a different category.`
                                    : 'Be the first to host an event in your community!'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
