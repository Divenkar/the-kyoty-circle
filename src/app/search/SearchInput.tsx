'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useRef } from 'react';

export function SearchInput() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const currentQuery = searchParams.get('q') || '';

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const q = (formData.get('q') as string)?.trim();
        if (q) {
            router.push(`/search?q=${encodeURIComponent(q)}`);
        } else {
            router.push('/search');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
            <div className="relative">
                <Search
                    size={20}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                />
                <input
                    ref={inputRef}
                    type="text"
                    name="q"
                    defaultValue={currentQuery}
                    placeholder="Search communities, events, topics..."
                    autoFocus
                    className="w-full rounded-2xl border border-neutral-200 bg-white py-4 pl-14 pr-28 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
                />
                <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                >
                    Search
                </button>
            </div>
        </form>
    );
}
