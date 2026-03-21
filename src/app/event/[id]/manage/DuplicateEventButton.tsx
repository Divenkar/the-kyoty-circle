'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cloneEventAction } from '@/server/actions/event.actions';
import { Copy, Loader2 } from 'lucide-react';

export function DuplicateEventButton({ eventId }: { eventId: number }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDuplicate = async () => {
        setLoading(true);
        const result = await cloneEventAction(eventId);
        setLoading(false);
        if (result.success && result.data) {
            toast.success('Event duplicated as a draft');
            router.push(`/event/${result.data.id}/manage`);
        } else {
            toast.error(result.error || 'Failed to duplicate event');
        }
    };

    return (
        <button
            onClick={handleDuplicate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-60"
        >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
            Duplicate
        </button>
    );
}
