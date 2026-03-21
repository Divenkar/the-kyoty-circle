'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { uploadCoverImageAction } from '@/server/actions/community-manage.actions';

interface CoverImageUploaderProps {
    currentUrl?: string | null;
    onUpload: (url: string) => void;
    onRemove: () => void;
}

export function CoverImageUploader({ currentUrl, onUpload, onRemove }: CoverImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(currentUrl || null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // local preview immediately
        setPreview(URL.createObjectURL(file));
        setUploading(true);
        setError(null);

        const fd = new FormData();
        fd.append('file', file);
        const result = await uploadCoverImageAction(fd);
        setUploading(false);
        e.target.value = '';

        if (result.success && result.data) {
            onUpload(result.data);
        } else {
            setError(result.error || 'Upload failed');
            setPreview(currentUrl || null);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setError(null);
        onRemove();
    };

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFile}
            />

            {preview ? (
                <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-neutral-200">
                    <Image
                        src={preview}
                        alt="Cover preview"
                        fill
                        unoptimized
                        className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 transition hover:opacity-100">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow hover:bg-neutral-100 disabled:opacity-50"
                        >
                            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                            Change
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="flex items-center gap-1.5 rounded-xl bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-600"
                        >
                            <X size={13} /> Remove
                        </button>
                    </div>
                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Loader2 size={24} className="animate-spin text-white" />
                        </div>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 text-neutral-400 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-500 disabled:opacity-50"
                >
                    {uploading ? (
                        <Loader2 size={24} className="animate-spin" />
                    ) : (
                        <ImageIcon size={24} />
                    )}
                    <span className="text-xs font-medium">
                        {uploading ? 'Uploading…' : 'Click to upload cover photo'}
                    </span>
                    <span className="text-[10px] text-neutral-400">JPEG, PNG, WebP · max 5 MB</span>
                </button>
            )}

            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        </div>
    );
}
