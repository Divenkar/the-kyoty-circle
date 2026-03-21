'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, PowerOff, Power, Settings, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import {
    deleteCommunityAction,
    toggleCommunityStatusAction,
} from '@/server/actions/admin.actions';

interface Props {
    communityId: number;
    slug: string;
    status: string;
}

export function CommunityRowActions({ communityId, slug, status }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const isDisabled = status === 'disabled';

    const handleToggle = async () => {
        setLoading('toggle');
        const newStatus = isDisabled ? 'active' : 'disabled';
        await toggleCommunityStatusAction(communityId, newStatus);
        setLoading(null);
        router.refresh();
    };

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
            return;
        }
        setLoading('delete');
        await deleteCommunityAction(communityId);
        setLoading(null);
        router.refresh();
    };

    return (
        <div className="flex items-center gap-1">
            <Link
                href={`/community/${slug}`}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                title="View"
            >
                <ExternalLink size={14} />
            </Link>
            <Link
                href={`/admin/community/${communityId}`}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                title="Manage"
            >
                <Settings size={14} />
            </Link>
            <button
                onClick={handleToggle}
                disabled={loading === 'toggle'}
                title={isDisabled ? 'Enable' : 'Disable'}
                className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                    isDisabled
                        ? 'text-green-500 hover:bg-green-50'
                        : 'text-amber-500 hover:bg-amber-50'
                }`}
            >
                {isDisabled ? <Power size={14} /> : <PowerOff size={14} />}
            </button>
            <button
                onClick={handleDelete}
                disabled={loading === 'delete'}
                title={confirmDelete ? 'Click again to confirm delete' : 'Delete'}
                className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                    confirmDelete
                        ? 'bg-red-100 text-red-700'
                        : 'text-red-400 hover:bg-red-50'
                }`}
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
}
