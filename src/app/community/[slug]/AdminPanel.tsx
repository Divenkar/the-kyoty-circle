'use client';

import React from 'react';
import { updateCommunityAction } from '@/server/actions/community-admin.actions';
import { Settings, Save, X, Pencil } from 'lucide-react';

interface AdminPanelProps {
    communityId: number;
    currentName: string;
    currentDescription: string;
    currentCoverImageUrl: string | null;
}

export function AdminPanel({
    communityId,
    currentName,
    currentDescription,
    currentCoverImageUrl,
}: AdminPanelProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [name, setName] = React.useState(currentName);
    const [description, setDescription] = React.useState(currentDescription);
    const [coverImageUrl, setCoverImageUrl] = React.useState(currentCoverImageUrl || '');

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const result = await updateCommunityAction(communityId, {
                name: name.trim(),
                description: description.trim(),
                cover_image_url: coverImageUrl.trim() || undefined,
            });
            if (result.success) {
                setMessage({ type: 'success', text: 'Community updated successfully!' });
                setIsEditing(false);
            } else {
                setMessage({ type: 'error', text: result.error || 'Update failed' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setName(currentName);
        setDescription(currentDescription);
        setCoverImageUrl(currentCoverImageUrl || '');
        setIsEditing(false);
        setMessage(null);
    };

    if (!isEditing) {
        return (
            <div className="mt-6">
                <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors border border-neutral-200"
                >
                    <Settings size={16} />
                    Manage Community
                </button>
                {message && (
                    <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {message.text}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="mt-6 p-5 bg-amber-50/50 border border-amber-200 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                    <Pencil size={14} />
                    Edit Community
                </h3>
                <button
                    onClick={handleCancel}
                    className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">Community Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all resize-none"
                    />
                </div>

                {/* Cover Image URL */}
                <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">Cover Image URL</label>
                    <input
                        type="url"
                        value={coverImageUrl}
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-sm"
                    >
                        <Save size={14} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-5 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                {message && (
                    <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {message.text}
                    </p>
                )}
            </div>
        </div>
    );
}
