'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown, Filter, X } from 'lucide-react';

const SORT_OPTIONS = [
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
] as const;

export function ExploreMobileActionBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const city = searchParams.get('city') || 'Noida';
    const category = searchParams.get('category') || 'All';
    const activeFilterCount = [searchParams.get('q'), searchParams.get('from'), searchParams.get('to'), searchParams.get('price')].filter(Boolean).length;
    const sort = searchParams.get('sort') || 'latest';

    const pushParams = (mutator: (params: URLSearchParams) => void) => {
        const params = new URLSearchParams(searchParams.toString());
        mutator(params);
        router.push(`/explore?${params.toString()}`);
    };

    const scrollToFilters = () => {
        document.getElementById('explore-filters')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const clearFilters = () => {
        pushParams((params) => {
            params.delete('q');
            params.delete('from');
            params.delete('to');
            params.delete('price');
        });
    };

    const updateSort = (value: string) => {
        pushParams((params) => {
            if (value === 'latest') params.delete('sort');
            else params.set('sort', value);
        });
    };

    return (
        <div className="sticky top-[4.5rem] z-30 -mx-4 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-xl sm:hidden">
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-900">
                            {city === 'all' ? 'Everywhere' : city}
                            <span className="text-neutral-400"> - </span>
                            {category}
                        </p>
                        <p className="text-xs text-neutral-500">
                            {activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'}
                        </p>
                    </div>
                    {activeFilterCount > 0 && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-red-50 px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                        >
                            <X size={14} />
                            Clear
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-2">
                    <button
                        type="button"
                        onClick={scrollToFilters}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                    >
                        <Filter size={16} />
                        Filters
                    </button>

                    <label className="inline-flex h-11 items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm font-medium text-neutral-700 focus-within:border-primary-400 focus-within:bg-white">
                        <ArrowUpDown size={15} className="shrink-0 text-primary-500" />
                        <select
                            aria-label="Sort events"
                            value={sort}
                            onChange={(e) => updateSort(e.target.value)}
                            className="w-full bg-transparent outline-none"
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>
        </div>
    );
}
