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
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                    type="text"
                    placeholder="Search communities by name or description…"
                    defaultValue={currentQuery}
                    onChange={e => updateParam('q', e.target.value)}
                    className="w-full rounded-2xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
                {currentQuery && (
                    <button
                        onClick={() => updateParam('q', '')}
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
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                        !currentCategory || currentCategory === 'all'
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 hover:text-primary-600'
                    }`}
                >
                    All
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => updateParam('category', cat)}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                            currentCategory === cat
                                ? 'border-primary-600 bg-primary-600 text-white'
                                : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 hover:text-primary-600'
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
                    className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800"
                >
                    <X size={12} /> Clear all filters
                </button>
            )}
        </div>
    );
}
