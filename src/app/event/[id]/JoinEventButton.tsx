'use client';

import React from 'react';
import { joinEventAction, cancelEventRegistrationAction } from '@/server/actions/event.actions';

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => { open: () => void };
    }
}

interface JoinEventButtonProps {
    eventId: number;
    isLoggedIn: boolean;
    isRegistered: boolean;
    isWaitlisted?: boolean;
    waitlistPosition?: number;
    isCommunityMember: boolean;
    /** True when event.visibility === 'public' — allows non-members to join */
    isPublicEvent?: boolean;
    isFull: boolean;
    isPaid?: boolean;
    price?: number;
    /** User name and email for Razorpay prefill */
    userName?: string;
    userEmail?: string;
}

export function JoinEventButton({
    eventId,
    isLoggedIn,
    isRegistered,
    isWaitlisted = false,
    waitlistPosition = 0,
    isCommunityMember,
    isPublicEvent = false,
    isFull,
    isPaid = false,
    price = 0,
    userName,
    userEmail,
}: JoinEventButtonProps) {
    const [loading, setLoading] = React.useState(false);
    const [status, setStatus] = React.useState<'idle' | 'registered' | 'waitlisted' | 'cancelled'>(
        isRegistered ? 'registered' : isWaitlisted ? 'waitlisted' : 'idle'
    );
    const [position, setPosition] = React.useState(waitlistPosition);
    const [error, setError] = React.useState('');

    const handlePayment = async () => {
        setLoading(true);
        setError('');
        try {
            // 1. Create Razorpay order via API
            const res = await fetch('/api/payments/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: price, eventId }),
            });
            const body = await res.json();
            if (!body.success || !body.data?.order) {
                setError(body.error || 'Failed to create payment order');
                setLoading(false);
                return;
            }

            const order = body.data.order;

            // 2. Open Razorpay checkout
            if (typeof window.Razorpay === 'undefined') {
                setError('Payment gateway is loading. Please try again.');
                setLoading(false);
                return;
            }

            const razorpay = new window.Razorpay({
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Kyoty',
                description: `Event Registration`,
                order_id: order.id,
                prefill: {
                    name: userName || '',
                    email: userEmail || '',
                },
                theme: { color: '#6366f1' },
                handler: async () => {
                    // 3. Payment successful — join event via server action
                    // The webhook will also handle this, but we join immediately for UX
                    const result = await joinEventAction(eventId);
                    if (result.success) {
                        if (result.data?.status === 'waitlisted') {
                            setStatus('waitlisted');
                            setPosition(result.data.position || 0);
                        } else {
                            setStatus('registered');
                        }
                    } else {
                        // Payment succeeded but join failed — show as registered
                        // since webhook will handle registration
                        setStatus('registered');
                    }
                    setLoading(false);
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    },
                },
            });
            razorpay.open();
        } catch {
            setError('Something went wrong with payment');
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        // For paid events, go through Razorpay
        if (isPaid && price > 0 && !isFull) {
            return handlePayment();
        }

        setLoading(true);
        setError('');
        try {
            const result = await joinEventAction(eventId);
            if (result.success) {
                if (result.data?.status === 'waitlisted') {
                    setStatus('waitlisted');
                    setPosition(result.data.position || 0);
                } else {
                    setStatus('registered');
                }
            } else {
                setError(result.error || 'Failed to join');
            }
        } catch {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await cancelEventRegistrationAction(eventId);
            if (result.success) {
                setStatus('cancelled');
            } else {
                setError(result.error || 'Failed to cancel');
            }
        } catch {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <a
                href="/login"
                className="block w-full py-3.5 text-center text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
            >
                Sign in to Join Event
            </a>
        );
    }

    if (status === 'registered') {
        return (
            <div className="space-y-2">
                <div className="w-full py-3.5 text-center text-sm font-semibold text-green-700 bg-green-50 rounded-xl border border-green-200">
                    You&apos;re registered for this event
                </div>
                <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="w-full py-2.5 text-center text-xs font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
                >
                    {loading ? 'Cancelling...' : 'Cancel Registration'}
                </button>
            </div>
        );
    }

    if (status === 'waitlisted') {
        return (
            <div className="space-y-2">
                <div className="w-full py-3.5 text-center text-sm font-semibold text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
                    You&apos;re on the waitlist {position > 0 && `(#${position})`}
                </div>
                <p className="text-xs text-neutral-500 text-center">
                    You&apos;ll be auto-promoted when a spot opens up
                </p>
                <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="w-full py-2.5 text-center text-xs font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
                >
                    {loading ? 'Leaving...' : 'Leave Waitlist'}
                </button>
            </div>
        );
    }

    if (status === 'cancelled') {
        return (
            <div className="w-full py-3.5 text-center text-sm text-neutral-500 bg-neutral-100 rounded-xl">
                Registration cancelled
            </div>
        );
    }

    if (!isCommunityMember && !isPublicEvent) {
        return (
            <div className="w-full py-3.5 text-center text-sm text-neutral-600 bg-neutral-100 rounded-xl">
                Join the community first to register for this event
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full py-3.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                    </span>
                ) : isFull ? (
                    'Join Waitlist'
                ) : isPaid ? (
                    `Pay & Join · ₹${price}`
                ) : (
                    'Join Event'
                )}
            </button>
            {isFull && status === 'idle' && (
                <p className="text-xs text-neutral-500 text-center mt-2">Event is full — you&apos;ll be added to the waitlist</p>
            )}
            {error && (
                <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
            )}
        </div>
    );
}
