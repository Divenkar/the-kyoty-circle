'use client';

import { useState, useTransition } from 'react';
import { Bookmark } from 'lucide-react';
import { toggleSaveEventAction } from '@/server/actions/saved-events.actions';

interface BookmarkButtonProps {
    eventId: number;
    initialSaved: boolean;
}

export function BookmarkButton({ eventId, initialSaved }: BookmarkButtonProps) {
    const [saved, setSaved] = useState(initialSaved);
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            const result = await toggleSaveEventAction(eventId);
            if (result.success && result.data) {
                setSaved(result.data.saved);
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            title={saved ? 'Remove bookmark' : 'Save event'}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                saved
                    ? 'border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary-200 hover:text-primary-600'
            }`}
        >
            <Bookmark
                size={15}
                className={saved ? 'fill-primary-600 text-primary-600' : ''}
            />
            {saved ? 'Saved' : 'Save'}
        </button>
    );
}
