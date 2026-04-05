'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import {
    ExternalLink, Users, Clock, MapPin, Calendar,
    IndianRupee, UserCheck, UserX, ChevronRight,
} from 'lucide-react';
import type { EventWithCommunity, EventParticipantWithUser } from '@/types';
import { updateEventStatusAction } from '@/server/actions/admin.actions';

const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    open: 'bg-blue-100 text-blue-700',
    full: 'bg-violet-100 text-violet-700',
    completed: 'bg-neutral-100 text-neutral-600',
    cancelled: 'bg-red-100 text-red-600',
    rejected: 'bg-red-100 text-red-600',
    draft: 'bg-neutral-100 text-neutral-500',
};

const PARTICIPANT_STATUS_COLOR: Record<string, string> = {
    registered: 'bg-green-100 text-green-700',
    waitlisted: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-neutral-100 text-neutral-500',
    removed: 'bg-red-100 text-red-600',
};

const STATUS_OPTIONS = ['draft', 'pending', 'approved', 'open', 'full', 'completed', 'cancelled', 'rejected'];

interface Props {
    event: EventWithCommunity;
    participants: EventParticipantWithUser[];
    waitlisted: EventParticipantWithUser[];
    checkInStats: { total: number; checkedIn: number };
    payments: any[];
}

export function EventAdminClient({ event, participants, waitlisted, checkInStats, payments }: Props) {
    const router = useRouter();
    const [statusLoading, setStatusLoading] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
        setStatusLoading(true);
        const result = await updateEventStatusAction(event.id, newStatus);
        setStatusLoading(false);
        if (result.success) {
            toast.success(`Event status updated to ${newStatus}`);
            router.refresh();
        } else {
            toast.error(result.error ?? 'Failed to update status');
        }
    };

    const totalRevenue = payments
        .filter(p => p.status === 'captured')
        .reduce((sum: number, p: any) => sum + (p.amount_paise || 0), 0);

    const dateStr = new Date(event.date).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3">
                <Link href="/admin/events" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
                    ← Events
                </Link>
                <span className="text-neutral-300">/</span>
                <h1 className="text-xl font-bold text-neutral-900 truncate">{event.title}</h1>
                <Link
                    href={`/event/${event.id}`}
                    target="_blank"
                    className="ml-auto shrink-0 flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 transition-colors"
                >
                    <ExternalLink size={13} /> View live
                </Link>
            </div>

            {/* Status + Quick Info */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_COLOR[event.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                        {event.status}
                    </span>
                    {event.communities && (
                        <Link
                            href={`/admin/community/${event.communities.id}`}
                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                            {event.communities.name} <ChevronRight size={13} />
                        </Link>
                    )}
                    {event.is_paid && (
                        <span className="flex items-center gap-1 text-sm text-neutral-600">
                            <IndianRupee size={13} />
                            {event.price_per_person ?? event.per_person_estimate ?? 0} per person
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <InfoItem icon={<Calendar size={14} />} label="Date" value={dateStr} />
                    <InfoItem icon={<Clock size={14} />} label="Time" value={`${event.start_time || '—'} – ${event.end_time || '—'}`} />
                    <InfoItem icon={<MapPin size={14} />} label="Location" value={event.location_text || '—'} />
                    <InfoItem icon={<Users size={14} />} label="Capacity" value={`${event.registered_count} / ${event.max_participants}`} />
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Registered" value={participants.length} color="bg-green-50 text-green-700" />
                <StatCard label="Waitlisted" value={waitlisted.length} color="bg-amber-50 text-amber-700" />
                <StatCard label="Checked In" value={`${checkInStats.checkedIn}/${checkInStats.total}`} color="bg-blue-50 text-blue-700" />
                <StatCard label="Revenue" value={`₹${(totalRevenue / 100).toLocaleString()}`} color="bg-violet-50 text-violet-700" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Management */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-neutral-900">Change Status</h2>
                    <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map(s => (
                            <button
                                key={s}
                                onClick={() => handleStatusChange(s)}
                                disabled={statusLoading || s === event.status}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${
                                    s === event.status
                                        ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-3">Description</h2>
                    <p className="text-sm text-neutral-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {event.description || 'No description provided.'}
                    </p>
                </div>
            </div>

            {/* Participants */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-neutral-900 mb-4">
                    Registered Participants <span className="text-neutral-400 font-normal">({participants.length})</span>
                </h2>
                {participants.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    <th className="px-3 py-2">User</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Checked In</th>
                                    <th className="px-3 py-2">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {participants.map(p => {
                                    const u = p.kyoty_users;
                                    return (
                                        <tr key={p.id} className="hover:bg-neutral-50">
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700 shrink-0">
                                                        {u?.name?.[0]?.toUpperCase() ?? '?'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-neutral-800 truncate">{u?.name ?? 'Unknown'}</p>
                                                        <p className="text-xs text-neutral-400 truncate">{u?.email ?? ''}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${PARTICIPANT_STATUS_COLOR[p.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                {p.checked_in_at ? (
                                                    <span className="flex items-center gap-1 text-green-600 text-xs">
                                                        <UserCheck size={13} /> Yes
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-neutral-400 text-xs">
                                                        <UserX size={13} /> No
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5 text-xs text-neutral-500">
                                                {new Date(p.joined_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-neutral-400 text-center py-6">No participants yet.</p>
                )}
            </div>

            {/* Waitlisted */}
            {waitlisted.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">
                        Waitlist <span className="text-neutral-400 font-normal">({waitlisted.length})</span>
                    </h2>
                    <ul className="divide-y divide-neutral-100">
                        {waitlisted.map(w => {
                            const u = w.kyoty_users;
                            return (
                                <li key={w.id} className="flex items-center gap-3 py-2.5">
                                    <span className="text-xs text-neutral-400 w-6 text-right">#{w.waitlist_position ?? '—'}</span>
                                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-semibold text-amber-700 shrink-0">
                                        {u?.name?.[0]?.toUpperCase() ?? '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-neutral-800 truncate">{u?.name ?? 'Unknown'}</p>
                                        <p className="text-xs text-neutral-400 truncate">{u?.email ?? ''}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* Payments */}
            {payments.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">
                        Payments <span className="text-neutral-400 font-normal">({payments.length})</span>
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    <th className="px-3 py-2">Payment ID</th>
                                    <th className="px-3 py-2">Amount</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {payments.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-neutral-50">
                                        <td className="px-3 py-2.5 text-xs text-neutral-600 font-mono">{p.razorpay_payment_id}</td>
                                        <td className="px-3 py-2.5 text-sm font-medium text-neutral-800">₹{((p.amount_paise || 0) / 100).toLocaleString()}</td>
                                        <td className="px-3 py-2.5">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                                                p.status === 'captured' ? 'bg-green-100 text-green-700'
                                                : p.status === 'refunded' ? 'bg-amber-100 text-amber-700'
                                                : 'bg-red-100 text-red-600'
                                            }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-xs text-neutral-500">
                                            {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-xs text-neutral-400">{icon} {label}</p>
            <p className="text-sm font-medium text-neutral-800">{value}</p>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
    return (
        <div className={`rounded-2xl p-4 ${color}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs mt-0.5 opacity-70">{label}</p>
        </div>
    );
}
