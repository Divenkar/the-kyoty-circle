'use client';

import React from 'react';
import { submitReviewAction, getReviewsAction } from '@/server/actions/review.actions';
import { Star } from 'lucide-react';

interface ReviewSectionProps {
    eventId: number;
    communityId: number;
    isLoggedIn: boolean;
    hasAttended: boolean;
}

export function ReviewSection({ eventId, communityId, isLoggedIn, hasAttended }: ReviewSectionProps) {
    const [reviews, setReviews] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [rating, setRating] = React.useState(0);
    const [hoverRating, setHoverRating] = React.useState(0);
    const [comment, setComment] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        getReviewsAction(eventId).then((result) => {
            if (result.success && result.data) setReviews(result.data);
            setLoading(false);
        });
    }, [eventId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) { setError('Please select a rating'); return; }
        setSubmitting(true);
        setError('');
        const result = await submitReviewAction(eventId, communityId, rating, comment);
        if (result.success) {
            setSubmitted(true);
            // Refresh reviews
            const updated = await getReviewsAction(eventId);
            if (updated.success && updated.data) setReviews(updated.data);
        } else {
            setError(result.error || 'Failed to submit');
        }
        setSubmitting(false);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Reviews</h3>

            {/* Review Form */}
            {isLoggedIn && hasAttended && !submitted && (
                <form onSubmit={handleSubmit} className="bg-neutral-50 rounded-xl p-4 mb-6">
                    <p className="text-sm font-medium text-neutral-700 mb-3">How was your experience?</p>
                    <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setRating(s)}
                                onMouseEnter={() => setHoverRating(s)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star
                                    size={24}
                                    className={`transition-colors ${s <= (hoverRating || rating)
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-neutral-300'
                                        }`}
                                />
                            </button>
                        ))}
                        {rating > 0 && <span className="text-sm text-neutral-500 ml-2">{rating}/5</span>}
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts (optional)..."
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none resize-none"
                    />
                    {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-3 px-5 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            )}

            {submitted && (
                <div className="p-3 mb-4 text-sm font-medium text-green-700 bg-green-50 rounded-xl border border-green-200">
                    ✓ Thank you for your review!
                </div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="text-sm text-neutral-500">Loading reviews...</div>
            ) : reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((r: any) => (
                        <div key={r.id} className="bg-neutral-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                                        {(r.kyoty_users?.name || 'U')[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-neutral-900">{r.kyoty_users?.name || 'User'}</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={14} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'} />
                                    ))}
                                </div>
                            </div>
                            {r.comment && <p className="text-sm text-neutral-600">{r.comment}</p>}
                            <p className="text-xs text-neutral-400 mt-2">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-neutral-500">No reviews yet.</p>
            )}
        </div>
    );
}
