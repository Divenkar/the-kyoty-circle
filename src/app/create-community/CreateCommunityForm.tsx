'use client';

import React, { useState } from 'react';
import { createCommunityAction } from '@/server/actions/community.actions';
import { CoverImageUploader } from '@/components/CoverImageUploader';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, Users, Globe, Lock } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
    'Sports', 'Fitness', 'Tech', 'Arts & Culture', 'Networking',
    'Outdoor & Adventure', 'Music', 'Food & Drinks', 'Gaming', 'Books',
    'Photography', 'Travel', 'Wellness', 'Business', 'Education', 'Other',
];

const CITIES = ['Noida', 'Delhi', 'Gurgaon', 'Bangalore'];

export function CreateCommunityForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [createdSlug, setCreatedSlug] = useState<string | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [visibility, setVisibility] = useState('public');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        if (coverImageUrl) {
            formData.set('cover_image_url', coverImageUrl);
        }
        formData.set('visibility', visibility);

        const result = await createCommunityAction(formData);

        if (result.success && result.data) {
            setCreatedSlug(result.data.slug);
        } else {
            setError(result.error || 'Failed to create community');
            toast.error(result.error || 'Failed to create community');
        }
        setLoading(false);
    };

    if (createdSlug) {
        return (
            <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-neutral-50 px-4">
                <div className="w-full max-w-md rounded-[2rem] border border-neutral-200 bg-white p-10 text-center shadow-lg">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
                        <CheckCircle size={28} className="text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900">Community created!</h2>
                    <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-neutral-500">
                        Your community is live. Start inviting members and posting events.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href={`/community/${createdSlug}/feed`}
                            className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                        >
                            Go to my community
                        </Link>
                        <Link
                            href="/create-event"
                            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                        >
                            Create first event
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-72px)] bg-neutral-50">
            <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
                <Link
                    href="/dashboard"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>

                <div className="mb-8">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
                        <Users size={15} />
                        Community creation
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Start a community</h1>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                        Your community goes live immediately. Fill in the details below to get started.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                    {/* Cover photo */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                            Cover Photo <span className="text-neutral-400 font-normal">(optional)</span>
                        </label>
                        <CoverImageUploader
                            currentUrl={null}
                            onUpload={url => setCoverImageUrl(url)}
                            onRemove={() => setCoverImageUrl('')}
                        />
                    </div>

                    {/* Community Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                            Community Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            maxLength={80}
                            placeholder="e.g. Noida Photography Club"
                            className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
                            Description
                        </label>
                        <p className="mt-0.5 text-xs text-neutral-400">Describe what your community is about and who it&apos;s for.</p>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            maxLength={500}
                            placeholder="We're a group of photography enthusiasts in Noida who meet monthly to shoot, share, and learn together."
                            className="mt-1.5 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                        />
                    </div>

                    {/* Category + City row */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-neutral-700">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="category"
                                name="category"
                                required
                                defaultValue=""
                                className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                            >
                                <option value="" disabled>Select a category</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-neutral-700">
                                City <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="city"
                                name="city"
                                required
                                defaultValue="Noida"
                                className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                            >
                                {CITIES.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Visibility */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700">
                            Visibility
                        </label>
                        <p className="mt-0.5 text-xs text-neutral-400">Control who can find and join your community.</p>
                        <div className="mt-2 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setVisibility('public')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${visibility === 'public' ? 'border-primary-400 bg-primary-50 text-primary-700 font-semibold' : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300'}`}
                            >
                                <Globe size={16} />
                                <div className="text-left">
                                    <div className="font-medium">Public</div>
                                    <div className="text-xs text-neutral-400 font-normal">Anyone can find &amp; join</div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setVisibility('private')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${visibility === 'private' ? 'border-primary-400 bg-primary-50 text-primary-700 font-semibold' : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300'}`}
                            >
                                <Lock size={16} />
                                <div className="text-left">
                                    <div className="font-medium">Private</div>
                                    <div className="text-xs text-neutral-400 font-normal">Invite only</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Creating…' : 'Create Community'}
                    </button>
                </form>
            </div>
        </div>
    );
}
