'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { ImagePlus, X, Send, Loader2 } from 'lucide-react';
import { createPostAction } from '@/server/actions/post.actions';
import { toast } from 'sonner';

interface PostComposerProps {
    communityId: number;
    communityName: string;
    currentUserName: string;
    currentUserAvatar?: string | null;
    onPostCreated?: () => void;
}

export function PostComposer({
    communityId,
    communityName,
    currentUserName,
    currentUserAvatar,
    onPostCreated,
}: PostComposerProps) {
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [showImageInput, setShowImageInput] = useState(false);
    const [focused, setFocused] = useState(false);
    const [isPending, startTransition] = useTransition();

    const initials = currentUserName
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

    const handleSubmit = () => {
        if (!content.trim()) return;
        startTransition(async () => {
            const res = await createPostAction(
                communityId,
                content.trim(),
                imageUrl.trim() || null,
            );
            if (res.success) {
                setContent('');
                setImageUrl('');
                setShowImageInput(false);
                setFocused(false);
                toast.success('Post shared!');
                onPostCreated?.();
            } else {
                toast.error(res.error || 'Failed to post');
            }
        });
    };

    return (
        <div className={`rounded-2xl border bg-white transition-all ${
            focused ? 'border-primary-300 shadow-md shadow-primary-500/5' : 'border-neutral-200 shadow-sm'
        }`}>
            <div className="flex items-start gap-3 p-4">
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100">
                    {currentUserAvatar ? (
                        <Image
                            src={currentUserAvatar}
                            alt={currentUserName}
                            width={36}
                            height={36}
                            className="h-full w-full object-cover rounded-full"
                            unoptimized
                        />
                    ) : (
                        <span className="text-sm font-bold text-primary-700">{initials}</span>
                    )}
                </div>

                {/* Input */}
                <div className="flex-1 min-w-0">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onFocus={() => setFocused(true)}
                        placeholder={`What's on your mind in ${communityName}?`}
                        rows={focused ? 3 : 1}
                        maxLength={5000}
                        className="w-full resize-none rounded-xl border-0 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:bg-white"
                    />

                    {/* Image URL input */}
                    {showImageInput && (
                        <div className="mt-2 flex items-center gap-2">
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="Paste image URL…"
                                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/15"
                            />
                            <button
                                onClick={() => { setShowImageInput(false); setImageUrl(''); }}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Actions */}
                    {focused && (
                        <div className="mt-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setShowImageInput((v) => !v)}
                                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                        showImageInput
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                                    }`}
                                >
                                    <ImagePlus size={13} />
                                    Image
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] ${content.length > 4500 ? 'text-amber-600' : 'text-neutral-400'}`}>
                                    {content.length}/5000
                                </span>
                                <button
                                    onClick={() => { setContent(''); setFocused(false); setShowImageInput(false); setImageUrl(''); }}
                                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!content.trim() || isPending}
                                    className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                    Post
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
