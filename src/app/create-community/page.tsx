'use client';

import React from 'react';
import { createCommunityAction } from '@/server/actions/community.actions';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';

export default function CreateCommunityPage() {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await createCommunityAction(formData);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || 'Failed to create community');
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                        <Users size={28} className="text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">Community Created!</h2>
                    <p className="text-neutral-500 text-sm mb-6">
                        Your community has been submitted for review. You&apos;ll be notified when it&apos;s approved.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex px-6 py-3 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>

                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Create Community</h1>
                <p className="text-neutral-500 text-sm mb-8">
                    Start a community and begin hosting events for your city.
                </p>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-5">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Community Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder="e.g. Noida Photography Club"
                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            placeholder="What's your community about?"
                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all resize-none"
                        />
                    </div>

                    <input type="hidden" name="city" value="Noida" />

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Community'}
                    </button>
                </form>
            </div>
        </div>
    );
}
