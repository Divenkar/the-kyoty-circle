'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateEventStatusAction } from '@/server/actions/admin.actions';

const STATUSES = ['pending', 'approved', 'rejected', 'open', 'full', 'completed', 'cancelled'];

interface Props {
    eventId: number;
    currentStatus: string;
}

export function EventStatusSelect({ eventId, currentStatus }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setLoading(true);
        const result = await updateEventStatusAction(eventId, newStatus);
        setLoading(false);
        if (result.success) {
            toast.success('Event status updated');
            router.refresh();
        } else {
            toast.error(result.error ?? 'Failed to update status');
        }
    };

    return (
        <select
            defaultValue={currentStatus}
            onChange={handleChange}
            disabled={loading}
            className="text-xs border border-neutral-200 rounded-lg px-2 py-1 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:opacity-50"
        >
            {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
            ))}
        </select>
    );
}
