'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Search, SlidersHorizontal, X } from 'lucide-react';

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

    React.useEffect(() => {
        setQuery(searchParams.get('q') || '');
        setDateFrom(searchParams.get('from') || '');
        setDateTo(searchParams.get('to') || '');
        setPriceFilter(searchParams.get('price') || 'all');
    }, [searchParams]);

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
        // If both dates set, ensure from <= to
        if (from && to && from > to) {
            // Swap them automatically
            setDateFrom(to);
            setDateTo(from);
            updateFilters({ from: to, to: from });
            return;
        }
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
        const sort = searchParams.get('sort');
        if (city) params.set('city', city);
        if (category) params.set('category', category);
        if (sort) params.set('sort', sort);
        router.push(`/explore?${params.toString()}`);
    };

    const hasActiveFilters = query || dateFrom || dateTo || priceFilter !== 'all';

    return (
        <div id="explore-filters" className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-700">
                <SlidersHorizontal size={15} className="text-neutral-400" />
                Filters
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <form onSubmit={handleSearch} className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search events..."
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
                    />
                </form>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center lg:min-w-[320px]">
                    <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-600 focus-within:border-primary-400 focus-within:bg-white">
                        <Calendar size={14} className="text-neutral-400" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => handleDateChange(e.target.value, dateTo)}
                            className="min-w-0 flex-1 bg-transparent outline-none"
                        />
                    </label>
                    <span className="hidden text-center text-xs text-neutral-400 sm:block">to</span>
                    <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-600 focus-within:border-primary-400 focus-within:bg-white">
                        <Calendar size={14} className="text-neutral-400" />
                        <input
                            type="date"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={(e) => handleDateChange(dateFrom, e.target.value)}
                            className="min-w-0 flex-1 bg-transparent outline-none"
                        />
                    </label>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {['all', 'free', 'paid'].map((opt) => (
                        <button
                            type="button"
                            key={opt}
                            onClick={() => handlePriceChange(opt)}
                            className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-all ${priceFilter === opt
                                ? 'bg-neutral-900 text-white'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                            <X size={13} />
                            Clear
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
