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
        <div id="explore-filters" className="mt-6 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-800">
                <SlidersHorizontal size={16} className="text-primary-500" />
                Refine your event search
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <form onSubmit={handleSearch} className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by event name or description"
                        className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-500/10"
                    />
                </form>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center lg:min-w-[360px]">
                    <label className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-600 focus-within:border-primary-400 focus-within:bg-white">
                        <Calendar size={15} className="text-primary-500" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => handleDateChange(e.target.value, dateTo)}
                            className="min-w-0 flex-1 bg-transparent outline-none"
                        />
                    </label>
                    <span className="hidden text-center text-xs font-medium uppercase tracking-wide text-neutral-400 sm:block">to</span>
                    <label className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-600 focus-within:border-primary-400 focus-within:bg-white">
                        <Calendar size={15} className="text-primary-500" />
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
                            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-all ${priceFilter === opt
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center gap-1 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                        >
                            <X size={14} />
                            Clear
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
