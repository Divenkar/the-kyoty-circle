'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export function MarkAllReadButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const markAllRead = async () => {
        setLoading(true);
        try {
            await fetch('/api/notifications', { method: 'PUT' });
            router.refresh();
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={markAllRead}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 transition hover:border-primary-300 hover:text-primary-600 disabled:opacity-50"
        >
            <CheckCircle size={13} />
            {loading ? 'Marking...' : 'Mark all read'}
        </button>
    );
}
