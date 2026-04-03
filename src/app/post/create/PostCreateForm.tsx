'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Image, Calendar, Send, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { createPostAction } from '@/server/actions/post.actions';
import { toast } from 'sonner';

interface JoinedCommunity {
    id: number;
    name: string;
    slug: string | null;
}

interface PostCreateFormProps {
    communities: JoinedCommunity[];
    defaultCommunitySlug?: string | null;
}

const POST_TYPES = [
    { key: 'discussion', label: 'Discussion', icon: FileText, desc: 'Start a conversation' },
    { key: 'media', label: 'Media', icon: Image, desc: 'Share a photo or link' },
    { key: 'event', label: 'Event', icon: Calendar, desc: 'Create an event' },
] as const;

type PostType = typeof POST_TYPES[number]['key'];

export function PostCreateForm({ communities, defaultCommunitySlug }: PostCreateFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const defaultType = (searchParams.get('type') as PostType) || 'discussion';

    // Find the community matching the default slug
    const defaultCommunity = communities.find(
        (c) => c.slug === defaultCommunitySlug || String(c.id) === defaultCommunitySlug
    );

    const [postType, setPostType] = useState<PostType>(defaultType);
    const [selectedCommunityId, setSelectedCommunityId] = useState<number | ''>(
        defaultCommunity?.id ?? (communities.length === 1 ? communities[0].id : '')
    );
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isPending, startTransition] = useTransition();

    // For event type: redirect to create-event page
    const isEventType = postType === 'event';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCommunityId) {
            toast.error('Please select a community');
            return;
        }
        if (!content.trim()) {
            toast.error('Post content cannot be empty');
            return;
        }
        if (content.trim().length < 3) {
            toast.error('Post must be at least 3 characters');
            return;
        }

        startTransition(async () => {
            const result = await createPostAction(
                selectedCommunityId as number,
                content.trim(),
                postType === 'media' && imageUrl.trim() ? imageUrl.trim() : undefined
            );

            if (result.success) {
                toast.success('Post published!');
                const community = communities.find((c) => c.id === selectedCommunityId);
                const target = community?.slug || community?.id;
                router.push(target ? `/community/${target}/feed` : '/communities');
            } else {
                toast.error(result.error || 'Failed to create post');
            }
        });
    };

    const selectedCommunity = communities.find((c) => c.id === selectedCommunityId);

    return (
        <div className="mx-auto max-w-2xl">
            {/* Back nav */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-800"
                >
                    <ArrowLeft size={15} />
                    Back
                </button>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
                {/* Header */}
                <div className="border-b border-neutral-100 px-6 py-4">
                    <h1 className="text-base font-bold text-neutral-900">Create a post</h1>
                    <p className="mt-0.5 text-xs text-neutral-500">Share something with your community</p>
                </div>

                {/* Post type selector */}
                <div className="border-b border-neutral-100 px-6 py-4">
                    <div className="flex gap-2">
                        {POST_TYPES.map((type) => (
                            <button
                                key={type.key}
                                type="button"
                                onClick={() => setPostType(type.key)}
                                className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center transition ${
                                    postType === type.key
                                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                                        : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-neutral-300 hover:bg-neutral-100'
                                }`}
                            >
                                <type.icon size={17} />
                                <span className="text-xs font-semibold">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Event shortcut */}
                {isEventType ? (
                    <div className="px-6 py-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
                            <Calendar size={26} className="text-violet-600" />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-900">Create an event</h3>
                        <p className="mt-1 text-xs text-neutral-500 max-w-xs mx-auto">
                            Events have their own dedicated page with RSVP, ticketing, and location details.
                        </p>
                        <Link
                            href={selectedCommunity?.slug
                                ? `/create-event?community=${selectedCommunity.slug}`
                                : '/create-event'
                            }
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                        >
                            <ExternalLink size={14} />
                            Go to Event Creator
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                        {/* Community selector */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                                Community <span className="text-red-500">*</span>
                            </label>
                            {communities.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-center">
                                    <p className="text-xs text-neutral-500">You haven't joined any communities yet.</p>
                                    <Link href="/communities" className="mt-1.5 inline-block text-xs font-medium text-primary-600 hover:underline">
                                        Browse communities →
                                    </Link>
                                </div>
                            ) : (
                                <select
                                    value={selectedCommunityId}
                                    onChange={(e) => setSelectedCommunityId(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                                    required
                                >
                                    <option value="">Select a community…</option>
                                    {communities.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Content */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                                {postType === 'media' ? 'Caption / description' : 'What\'s on your mind?'}{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={
                                    postType === 'media'
                                        ? 'Add a caption for your photo or link…'
                                        : 'Share something interesting, ask a question, or start a discussion…'
                                }
                                rows={5}
                                maxLength={2000}
                                className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                required
                            />
                            <div className="mt-1 text-right text-xs text-neutral-400">
                                {content.length}/2000
                            </div>
                        </div>

                        {/* Image URL (Media only) */}
                        {postType === 'media' && (
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
                                    Image URL
                                </label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                                />
                                {imageUrl && (
                                    <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={imageUrl}
                                            alt="Preview"
                                            className="max-h-48 w-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending || communities.length === 0}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                            >
                                {isPending ? (
                                    <><Loader2 size={14} className="animate-spin" /> Publishing…</>
                                ) : (
                                    <><Send size={14} /> Publish post</>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
