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
        <div className="sticky top-[4.5rem] z-30 -mx-4 border-b border-neutral-200 bg-white px-4 py-2.5 sm:hidden">
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900">
                        {city === 'all' ? 'Everywhere' : city}
                        <span className="mx-1 text-neutral-300">·</span>
                        <span className="text-neutral-500">{category}</span>
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={scrollToFilters}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-xs font-medium text-neutral-700"
                    >
                        <Filter size={14} />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">{activeFilterCount}</span>
                        )}
                    </button>

                    <label className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 text-xs font-medium text-neutral-700">
                        <ArrowUpDown size={13} className="shrink-0 text-neutral-400" />
                        <select
                            aria-label="Sort events"
                            value={sort}
                            onChange={(e) => updateSort(e.target.value)}
                            className="bg-transparent outline-none"
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    {activeFilterCount > 0 && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium text-red-600"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
