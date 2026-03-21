'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateUserRoleAction } from '@/server/actions/admin.actions';

const ROLES = ['participant', 'community_admin', 'admin', 'kyoty_admin'];

const ROLE_COLOR: Record<string, string> = {
    participant: 'bg-neutral-100 text-neutral-600',
    community_admin: 'bg-blue-100 text-blue-700',
    admin: 'bg-violet-100 text-violet-700',
    kyoty_admin: 'bg-primary-100 text-primary-700',
};

interface Props {
    userId: number;
    currentRole: string;
    isSelf: boolean;
}

export function UserRoleSelect({ userId, currentRole, isSelf }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value;
        setLoading(true);
        const result = await updateUserRoleAction(userId, newRole);
        setLoading(false);
        if (result.success) {
            toast.success('Role updated');
            router.refresh();
        } else {
            toast.error(result.error ?? 'Failed to update role');
        }
    };

    if (isSelf) {
        return (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLE_COLOR[currentRole] ?? 'bg-neutral-100 text-neutral-500'}`}>
                {currentRole.replace('_', ' ')}
            </span>
        );
    }

    return (
        <select
            defaultValue={currentRole}
            onChange={handleChange}
            disabled={loading}
            className="text-xs border border-neutral-200 rounded-lg px-2 py-1 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:opacity-50"
        >
            {ROLES.map(r => (
                <option key={r} value={r}>{r.replace('_', ' ')}</option>
            ))}
        </select>
    );
}
