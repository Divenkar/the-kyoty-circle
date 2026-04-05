'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Search, X } from 'lucide-react';

const CATEGORIES = [
    'Sports', 'Fitness', 'Tech', 'Arts & Culture', 'Networking',
    'Outdoor & Adventure', 'Music', 'Food & Drinks', 'Gaming',
    'Books', 'Photography', 'Travel', 'Wellness', 'Business', 'Education',
];

interface CommunitiesFiltersProps {
    currentQuery: string;
    currentCategory: string;
    currentCity: string;
}

export function CommunitiesFilters({ currentQuery, currentCategory, currentCity }: CommunitiesFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const updateParam = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all' && value !== '') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    }, [pathname, router, searchParams]);

    const clearAll = () => {
        startTransition(() => {
            router.push(pathname);
        });
    };

    const hasFilters = currentQuery || (currentCategory && currentCategory !== 'all');

    return (
        <div className={`transition-opacity ${isPending ? 'opacity-60' : 'opacity-100'}`}>
            {/* Search bar */}
            <div className="relative mb-4">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                    type="text"
                    placeholder="Search communities..."
                    defaultValue={currentQuery}
                    onChange={e => updateParam('q', e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
                />
                {currentQuery && (
                    <button
                        onClick={() => updateParam('q', '')}
                        aria-label="Clear search"
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => updateParam('category', 'all')}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                        !currentCategory || currentCategory === 'all'
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                >
                    All
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => updateParam('category', cat)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                            currentCategory === cat
                                ? 'bg-neutral-900 text-white'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Clear filters */}
            {hasFilters && (
                <button
                    onClick={clearAll}
                    className="mt-3 flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700"
                >
                    <X size={12} /> Clear all filters
                </button>
            )}
        </div>
    );
}
