'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinCommunityAction } from '@/server/actions/community.actions';
import { CheckCircle, Loader2 } from 'lucide-react';

interface Props {
    communityId: number;
    communitySlug: string;
    communityName: string;
    userName: string;
}

export function JoinApplicationForm({ communityId, communitySlug, communityName, userName }: Props) {
    const router = useRouter();
    const [joinReason, setJoinReason] = useState('');
    const [socialProofLink, setSocialProofLink] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinReason.trim()) {
            setError('Please tell us why you want to join.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const result = await joinCommunityAction(communityId, {
                joinReason: joinReason.trim(),
                socialProofLink: socialProofLink.trim() || undefined,
            });
            if (result.success) {
                setSubmitted(true);
            } else {
                setError(result.error || 'Failed to submit application');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="px-6 py-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle size={28} className="text-green-600" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900">Application submitted!</h3>
                <p className="mt-2 text-sm text-neutral-500">
                    Your request to join <strong>{communityName}</strong> is under review. You&apos;ll be notified once the
                    community manager approves it.
                </p>
                <button
                    onClick={() => router.push(`/community/${communitySlug}`)}
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition"
                >
                    Back to community
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="divide-y divide-neutral-100">
            {/* Name (read-only) */}
            <div className="px-6 py-5">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Your name</label>
                <input
                    type="text"
                    value={userName}
                    disabled
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-500"
                />
            </div>

            {/* Why join */}
            <div className="px-6 py-5">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Why do you want to join? <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={joinReason}
                    onChange={e => setJoinReason(e.target.value)}
                    placeholder="Tell the community manager what brings you here and what you're hoping to get out of this community..."
                    rows={4}
                    maxLength={500}
                    className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-neutral-400"
                />
                <p className="mt-1 text-right text-xs text-neutral-400">{joinReason.length} / 500</p>
            </div>

            {/* Social proof */}
            <div className="px-6 py-5">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    LinkedIn or Instagram profile <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <input
                    type="url"
                    value={socialProofLink}
                    onChange={e => setSocialProofLink(e.target.value)}
                    placeholder="https://linkedin.com/in/yourname"
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-neutral-400"
                />
                <p className="mt-1 text-xs text-neutral-400">Helps the manager verify who you are.</p>
            </div>

            {error && (
                <div className="px-6 py-3">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <div className="flex items-center justify-between px-6 py-5">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition"
                >
                    {submitting && <Loader2 size={15} className="animate-spin" />}
                    {submitting ? 'Submitting...' : 'Submit application'}
                </button>
            </div>
        </form>
    );
}
