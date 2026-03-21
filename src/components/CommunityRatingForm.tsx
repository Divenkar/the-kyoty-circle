'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { submitRatingAction } from '@/server/actions/community-ratings.actions';
import { Star } from 'lucide-react';

interface CommunityRatingFormProps {
    communityId: number;
    existingRating: number | null;
    existingReview: string | null;
}

export function CommunityRatingForm({ communityId, existingRating, existingReview }: CommunityRatingFormProps) {
    const [rating, setRating] = useState(existingRating ?? 0);
    const [hovered, setHovered] = useState(0);
    const [review, setReview] = useState(existingReview ?? '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const displayStars = hovered || rating;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rating) { toast.error('Please select a star rating'); return; }
        setSaving(true);
        const result = await submitRatingAction(communityId, rating, review || undefined);
        setSaving(false);
        if (result.success) {
            setSaved(true);
            toast.success(existingRating ? 'Rating updated' : 'Rating submitted');
            setTimeout(() => setSaved(false), 3000);
        } else {
            toast.error(result.error || 'Failed to submit rating');
        }
    };

    return (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                {existingRating ? 'Your rating' : 'Rate this community'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Star selector */}
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHovered(star)}
                            onMouseLeave={() => setHovered(0)}
                            className="transition-transform hover:scale-110"
                        >
                            <Star
                                size={24}
                                className={star <= displayStars
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-neutral-200 text-neutral-200'
                                }
                            />
                        </button>
                    ))}
                    {rating > 0 && (
                        <span className="ml-2 text-sm text-neutral-500">
                            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                        </span>
                    )}
                </div>

                {/* Optional review */}
                <textarea
                    value={review}
                    onChange={e => setReview(e.target.value)}
                    maxLength={300}
                    rows={2}
                    placeholder="Share your experience (optional)"
                    className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                />

                <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">{review.length}/300</span>
                    <button
                        type="submit"
                        disabled={saving || !rating}
                        className="rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? 'Saving…' : saved ? 'Saved!' : existingRating ? 'Update rating' : 'Submit rating'}
                    </button>
                </div>
            </form>
        </div>
    );
}
