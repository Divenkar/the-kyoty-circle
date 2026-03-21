'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Trash2, PowerOff, Power, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Community, CommunityMemberWithUser, CommunityMedia } from '@/types';
import {
    updateCommunityInfoAction,
    toggleCommunityStatusAction,
    deleteCommunityAction,
    removeMemberAction,
    deleteMediaAction,
} from '@/server/actions/admin.actions';

interface Props {
    community: Community;
    members: CommunityMemberWithUser[];
    media: CommunityMedia[];
}

export function CommunityAdminClient({ community, members: initialMembers, media: initialMedia }: Props) {
    const router = useRouter();

    // Edit form state
    const [name, setName] = useState(community.name);
    const [description, setDescription] = useState(community.description ?? '');
    const [coverUrl, setCoverUrl] = useState(community.cover_image_url ?? '');
    const [category, setCategory] = useState(community.category ?? '');
    const [saving, setSaving] = useState(false);

    // Members state
    const [members, setMembers] = useState(initialMembers);
    const [removingId, setRemovingId] = useState<number | null>(null);

    // Media state
    const [media, setMedia] = useState(initialMedia);
    const [deletingMediaId, setDeletingMediaId] = useState<number | null>(null);

    // Danger zone
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const isDisabled = community.status === 'disabled';

    const handleSave = async () => {
        setSaving(true);
        const result = await updateCommunityInfoAction(community.id, {
            name: name.trim() || undefined,
            description: description.trim() || undefined,
            cover_image_url: coverUrl.trim() || undefined,
            category: category.trim() || undefined,
        });
        setSaving(false);
        if (result.success) {
            toast.success('Community updated');
            router.refresh();
        } else {
            toast.error(result.error ?? 'Failed to update');
        }
    };

    const handleToggleStatus = async () => {
        setActionLoading('toggle');
        const newStatus = isDisabled ? 'active' : 'disabled';
        const result = await toggleCommunityStatusAction(community.id, newStatus);
        setActionLoading(null);
        if (result.success) {
            toast.success(newStatus === 'disabled' ? 'Community disabled' : 'Community enabled');
            router.refresh();
        } else {
            toast.error(result.error ?? 'Failed');
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3500);
            return;
        }
        setActionLoading('delete');
        const result = await deleteCommunityAction(community.id);
        setActionLoading(null);
        if (result.success) {
            toast.success('Community deleted');
            router.push('/admin/communities');
        } else {
            toast.error(result.error ?? 'Failed to delete');
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        setRemovingId(memberId);
        const result = await removeMemberAction(memberId);
        setRemovingId(null);
        if (result.success) {
            setMembers(prev => prev.filter(m => m.id !== memberId));
            toast.success('Member removed');
        } else {
            toast.error(result.error ?? 'Failed to remove member');
        }
    };

    const handleDeleteMedia = async (mediaId: number) => {
        setDeletingMediaId(mediaId);
        const result = await deleteMediaAction(mediaId);
        setDeletingMediaId(null);
        if (result.success) {
            setMedia(prev => prev.filter(m => m.id !== mediaId));
            toast.success('Media deleted');
        } else {
            toast.error(result.error ?? 'Failed to delete media');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/admin/communities" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
                    ← Communities
                </Link>
                <span className="text-neutral-300">/</span>
                <h1 className="text-xl font-bold text-neutral-900 truncate">{community.name}</h1>
                <Link
                    href={`/community/${community.slug}`}
                    target="_blank"
                    className="ml-auto shrink-0 flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 transition-colors"
                >
                    <ExternalLink size={13} /> View live
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left — Edit Info */}
                <div className="space-y-5">
                    <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-neutral-900">Community Info</h2>

                        <div className="space-y-3">
                            <Field label="Name">
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                />
                            </Field>
                            <Field label="Category">
                                <input
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                />
                            </Field>
                            <Field label="Cover Image URL">
                                <input
                                    value={coverUrl}
                                    onChange={e => setCoverUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                />
                            </Field>
                            {coverUrl && (
                                <img
                                    src={coverUrl}
                                    alt="Cover preview"
                                    className="w-full h-32 object-cover rounded-xl border border-neutral-100"
                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            )}
                            <Field label="Description (supports URLs in text)">
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={5}
                                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                                />
                            </Field>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 w-full justify-center bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                        >
                            <Save size={14} />
                            {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>

                    {/* Danger zone */}
                    <div className="bg-white border border-red-200 rounded-2xl p-5 space-y-3">
                        <h2 className="text-sm font-semibold text-red-700">Danger Zone</h2>
                        <div className="flex gap-3">
                            <button
                                onClick={handleToggleStatus}
                                disabled={actionLoading === 'toggle'}
                                className={`flex items-center gap-2 flex-1 justify-center text-sm font-medium px-4 py-2.5 rounded-xl border transition-colors disabled:opacity-50 ${
                                    isDisabled
                                        ? 'border-green-300 text-green-700 hover:bg-green-50'
                                        : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                                }`}
                            >
                                {isDisabled ? <Power size={14} /> : <PowerOff size={14} />}
                                {isDisabled ? 'Enable' : 'Disable'}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={actionLoading === 'delete'}
                                className={`flex items-center gap-2 flex-1 justify-center text-sm font-medium px-4 py-2.5 rounded-xl border transition-colors disabled:opacity-50 ${
                                    confirmDelete
                                        ? 'bg-red-600 border-red-600 text-white'
                                        : 'border-red-300 text-red-700 hover:bg-red-50'
                                }`}
                            >
                                <Trash2 size={14} />
                                {confirmDelete ? 'Confirm Delete?' : 'Delete'}
                            </button>
                        </div>
                        {confirmDelete && (
                            <p className="text-xs text-red-500 text-center">This is permanent and cannot be undone.</p>
                        )}
                    </div>
                </div>

                {/* Right — Members + Media */}
                <div className="space-y-5">
                    {/* Members */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                        <h2 className="text-sm font-semibold text-neutral-900 mb-4">
                            Members <span className="text-neutral-400 font-normal">({members.length})</span>
                        </h2>
                        {members.length > 0 ? (
                            <ul className="divide-y divide-neutral-100 max-h-72 overflow-y-auto">
                                {members.map(m => {
                                    const u = m.kyoty_users;
                                    return (
                                        <li key={m.id} className="flex items-center justify-between py-2.5">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700 shrink-0">
                                                    {u?.name?.[0]?.toUpperCase() ?? '?'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-neutral-800 truncate">{u?.name ?? 'Unknown'}</p>
                                                    <p className="text-xs text-neutral-400 truncate">{u?.email ?? ''}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveMember(m.id)}
                                                disabled={removingId === m.id}
                                                title="Remove member"
                                                className="shrink-0 ml-2 p-1.5 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                                            >
                                                <X size={13} />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-sm text-neutral-400 text-center py-4">No approved members</p>
                        )}
                    </div>

                    {/* Media */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                        <h2 className="text-sm font-semibold text-neutral-900 mb-4">
                            Media <span className="text-neutral-400 font-normal">({media.length})</span>
                        </h2>
                        {media.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {media.map(item => (
                                    <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square bg-neutral-100">
                                        <img
                                            src={item.url}
                                            alt={item.caption ?? ''}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => handleDeleteMedia(item.id)}
                                            disabled={deletingMediaId === item.id}
                                            className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
                                            title="Delete"
                                        >
                                            <Trash2 size={11} />
                                        </button>
                                        {item.caption && (
                                            <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-black/50 text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                                {item.caption}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-400 text-center py-4">No media uploaded</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-600">{label}</label>
            {children}
        </div>
    );
}
