'use client';

import { useState, useRef } from 'react';
import type { CommunityMedia } from '@/types';
import { uploadMediaAction, deleteMediaAction } from '@/server/actions/community-manage.actions';
import { Upload, Trash2, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface MediaGalleryProps {
    communityId: number;
    initialMedia: CommunityMedia[];
    currentUserId: number;
    canManage: boolean;
    isMember: boolean;
}

export function MediaGallery({ communityId, initialMedia, currentUserId, canManage, isMember }: MediaGalleryProps) {
    const [media, setMedia] = useState<CommunityMedia[]>(initialMedia);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<CommunityMedia | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError(null);

        const fd = new FormData();
        fd.append('file', file);

        const result = await uploadMediaAction(communityId, fd);
        setUploading(false);
        e.target.value = '';

        if (result.success && result.data) {
            setMedia(prev => [result.data!, ...prev]);
        } else {
            setError(result.error || 'Upload failed');
        }
    };

    const handleDelete = async (item: CommunityMedia) => {
        const result = await deleteMediaAction(communityId, item.id);
        if (result.success) {
            setMedia(prev => prev.filter(m => m.id !== item.id));
            if (preview?.id === item.id) setPreview(null);
        }
    };

    return (
        <div>
            {/* Upload button */}
            {isMember && (
                <div className="mb-6 flex items-center gap-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
                    >
                        {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                        {uploading ? 'Uploading…' : 'Add Photo'}
                    </button>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
            )}

            {/* Grid */}
            {media.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center">
                    <ImageIcon size={32} className="mb-3 text-neutral-300" />
                    <p className="text-sm font-medium text-neutral-500">No photos yet</p>
                    {isMember && <p className="mt-1 text-xs text-neutral-400">Be the first to share a photo!</p>}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {media.map(item => (
                        <div key={item.id} className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-neutral-100" onClick={() => setPreview(item)}>
                            <img src={item.url} alt={item.caption || ''} className="h-full w-full object-cover transition group-hover:scale-105" />
                            {/* Delete button */}
                            {(item.uploaded_by === currentUserId || canManage) && (
                                <button
                                    onClick={e => { e.stopPropagation(); handleDelete(item); }}
                                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500"
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                            {item.caption && (
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 p-2 opacity-0 group-hover:opacity-100 transition">
                                    <p className="text-xs text-white line-clamp-2">{item.caption}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {preview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreview(null)}>
                    <div className="relative max-h-[90vh] max-w-4xl" onClick={e => e.stopPropagation()}>
                        <img src={preview.url} alt={preview.caption || ''} className="max-h-[85vh] rounded-2xl object-contain" />
                        {preview.caption && (
                            <p className="mt-2 text-center text-sm text-neutral-300">{preview.caption}</p>
                        )}
                        <button onClick={() => setPreview(null)} className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-700 shadow-lg hover:bg-neutral-100">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
