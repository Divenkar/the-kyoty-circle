'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Calendar, X } from 'lucide-react';

export function FilterBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = React.useState(searchParams.get('q') || '');
    const [dateFrom, setDateFrom] = React.useState(searchParams.get('from') || '');
    const [dateTo, setDateTo] = React.useState(searchParams.get('to') || '');
    const [priceFilter, setPriceFilter] = React.useState(searchParams.get('price') || 'all');

    const updateFilters = React.useCallback((overrides: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(overrides).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        router.push(`/explore?${params.toString()}`);
    }, [router, searchParams]);

    // Debounced search — fires 400ms after user stops typing
    React.useEffect(() => {
        const currentQ = searchParams.get('q') || '';
        if (query === currentQ) return;
        const timer = setTimeout(() => {
            updateFilters({ q: query });
        }, 400);
        return () => clearTimeout(timer);
    }, [query, searchParams, updateFilters]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({ q: query });
    };

    const handlePriceChange = (val: string) => {
        setPriceFilter(val);
        updateFilters({ price: val === 'all' ? '' : val });
    };

    const handleDateChange = (from: string, to: string) => {
        setDateFrom(from);
        setDateTo(to);
        updateFilters({ from, to });
    };

    const clearFilters = () => {
        setQuery('');
        setDateFrom('');
        setDateTo('');
        setPriceFilter('all');
        const params = new URLSearchParams();
        const city = searchParams.get('city');
        const category = searchParams.get('category');
        if (city) params.set('city', city);
        if (category) params.set('category', category);
        router.push(`/explore?${params.toString()}`);
    };

    const hasActiveFilters = query || dateFrom || dateTo || priceFilter !== 'all';

    return (
        <div className="flex flex-col gap-3 mt-5">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                {/* Search */}
                <form onSubmit={handleSearch} className="relative flex-1 min-w-0 sm:min-w-[200px] sm:max-w-xs">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search events..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                    />
                </form>

                {/* Date Range */}
                <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-neutral-400 hidden sm:block" />
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => handleDateChange(e.target.value, dateTo)}
                        className="flex-1 sm:flex-none px-2.5 py-2 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all min-w-0"
                    />
                    <span className="text-xs text-neutral-400">to</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => handleDateChange(dateFrom, e.target.value)}
                        className="flex-1 sm:flex-none px-2.5 py-2 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all min-w-0"
                    />
                </div>

                {/* Price Toggle */}
                <div className="flex items-center bg-neutral-100 rounded-xl p-0.5 self-start">
                    {['all', 'free', 'paid'].map((opt) => (
                        <button
                            type="button"
                            key={opt}
                            onClick={() => handlePriceChange(opt)}
                            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${priceFilter === opt
                                ? 'bg-white text-neutral-900 shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-700'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* Clear */}
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors self-start"
                    >
                        <X size={12} />
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
