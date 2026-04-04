'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Link2, Copy, Trash2, Plus, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import {
    createInviteAction,
    deleteInviteAction,
} from '@/server/actions/invite.actions';
import type { InviteToken } from '@/lib/repositories/invite-token-repo';

interface InviteManagerProps {
    communityId: number;
    communitySlug: string;
    communityName: string;
    initialInvites: InviteToken[];
}

export function InviteManager({
    communityId,
    communitySlug,
    communityName,
    initialInvites,
}: InviteManagerProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    function getInviteUrl(token: string) {
        return `${window.location.origin}/invite/${token}`;
    }

    async function handleCopy(token: string) {
        try {
            await navigator.clipboard.writeText(getInviteUrl(token));
            setCopiedToken(token);
            toast.success('Invite link copied to clipboard');
            setTimeout(() => setCopiedToken(null), 2000);
        } catch {
            toast.error('Failed to copy link');
        }
    }

    function handleCreate() {
        startTransition(async () => {
            const result = await createInviteAction(communityId);
            if (result.success) {
                toast.success('Invite link created');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to create invite link');
            }
        });
    }

    function handleDelete(id: number) {
        startTransition(async () => {
            const result = await deleteInviteAction(id, communityId);
            if (result.success) {
                toast.success('Invite link deleted');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to delete invite link');
            }
        });
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(108,71,255,0.1),_transparent_25%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/community/${communitySlug}/manage`}
                        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-primary-600"
                    >
                        <ArrowLeft size={16} />
                        Back to manage
                    </Link>

                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900">
                                Invite Links
                            </h1>
                            <p className="mt-1 text-sm text-neutral-500">
                                Manage invite links for{' '}
                                <span className="font-medium text-neutral-700">
                                    {communityName}
                                </span>
                            </p>
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={isPending}
                            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
                        >
                            <Plus size={16} />
                            New invite
                        </button>
                    </div>
                </div>

                {/* Invite list */}
                {initialInvites.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center shadow-sm">
                        <Link2
                            size={32}
                            className="mx-auto mb-3 text-neutral-300"
                        />
                        <p className="text-sm font-medium text-neutral-500">
                            No invite links yet
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                            Create one to share with potential members.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {initialInvites.map((invite) => (
                            <div
                                key={invite.id}
                                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300 sm:p-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    {/* Left: token info */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Link2
                                                size={16}
                                                className="shrink-0 text-primary-500"
                                            />
                                            <code className="truncate text-sm font-medium text-neutral-800">
                                                {invite.token}
                                            </code>
                                        </div>

                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                                            <span>
                                                Uses:{' '}
                                                <span className="font-medium text-neutral-700">
                                                    {invite.use_count}
                                                </span>
                                                {' / '}
                                                <span className="font-medium text-neutral-700">
                                                    {invite.max_uses}
                                                </span>
                                            </span>
                                            <span>
                                                Created{' '}
                                                {formatDate(invite.created_at)}
                                            </span>
                                            {invite.expires_at && (
                                                <span>
                                                    Expires{' '}
                                                    {formatDate(
                                                        invite.expires_at,
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: actions */}
                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <button
                                            onClick={() =>
                                                handleCopy(invite.token)
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-600 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                                            title="Copy invite link"
                                        >
                                            {copiedToken === invite.token ? (
                                                <>
                                                    <Check
                                                        size={14}
                                                        className="text-green-600"
                                                    />
                                                    <span className="hidden sm:inline">
                                                        Copied
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={14} />
                                                    <span className="hidden sm:inline">
                                                        Copy
                                                    </span>
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(invite.id)
                                            }
                                            disabled={isPending}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                                            title="Delete invite link"
                                        >
                                            <Trash2 size={14} />
                                            <span className="hidden sm:inline">
                                                Delete
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
