'use client';

import React from 'react';
import {
    approveCommunityAction,
    rejectCommunityAction,
    approveEventAction,
    rejectEventAction,
} from '@/server/actions/admin.actions';
import type { Community, KyotyEvent } from '@/types';
import { Check, X, Users, Calendar } from 'lucide-react';

interface AdminActionsProps {
    pendingCommunities: Community[];
    pendingEvents: KyotyEvent[];
}

export function AdminActions({ pendingCommunities, pendingEvents }: AdminActionsProps) {
    const [communities, setCommunities] = React.useState(pendingCommunities);
    const [events, setEvents] = React.useState(pendingEvents);
    const [loadingId, setLoadingId] = React.useState<string | null>(null);

    const handleCommunityAction = async (id: number, action: 'approve' | 'reject') => {
        const key = `community-${id}-${action}`;
        setLoadingId(key);
        try {
            const result = action === 'approve'
                ? await approveCommunityAction(id)
                : await rejectCommunityAction(id);
            if (result.success) {
                setCommunities(prev => prev.filter(c => c.id !== id));
            }
        } catch {
            // Silent fail
        } finally {
            setLoadingId(null);
        }
    };

    const handleEventAction = async (id: number, action: 'approve' | 'reject') => {
        const key = `event-${id}-${action}`;
        setLoadingId(key);
        try {
            const result = action === 'approve'
                ? await approveEventAction(id)
                : await rejectEventAction(id);
            if (result.success) {
                setEvents(prev => prev.filter(e => e.id !== id));
            }
        } catch {
            // Silent fail
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="space-y-10">
            {/* Pending Communities */}
            <section>
                <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 mb-4">
                    <Users size={18} className="text-primary-600" />
                    Pending Communities
                </h2>

                {communities.length > 0 ? (
                    <div className="space-y-3">
                        {communities.map((c) => (
                            <div
                                key={c.id}
                                className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl"
                            >
                                <div>
                                    <span className="text-sm font-semibold text-neutral-900 block">{c.name}</span>
                                    <span className="text-xs text-neutral-500">{c.city_name || c.category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleCommunityAction(c.id, 'approve')}
                                        disabled={loadingId === `community-${c.id}-approve`}
                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleCommunityAction(c.id, 'reject')}
                                        disabled={loadingId === `community-${c.id}-reject`}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-white border border-neutral-200 rounded-2xl">
                        <p className="text-neutral-500 text-sm">No pending communities</p>
                    </div>
                )}
            </section>

            {/* Pending Events */}
            <section>
                <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 mb-4">
                    <Calendar size={18} className="text-primary-600" />
                    Pending Events
                </h2>

                {events.length > 0 ? (
                    <div className="space-y-3">
                        {events.map((e) => (
                            <div
                                key={e.id}
                                className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl"
                            >
                                <div>
                                    <span className="text-sm font-semibold text-neutral-900 block">{e.title}</span>
                                    <span className="text-xs text-neutral-500">
                                        {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        {' · '}{e.location_text}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEventAction(e.id, 'approve')}
                                        disabled={loadingId === `event-${e.id}-approve`}
                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleEventAction(e.id, 'reject')}
                                        disabled={loadingId === `event-${e.id}-reject`}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-white border border-neutral-200 rounded-2xl">
                        <p className="text-neutral-500 text-sm">No pending events</p>
                    </div>
                )}
            </section>
        </div>
    );
}
