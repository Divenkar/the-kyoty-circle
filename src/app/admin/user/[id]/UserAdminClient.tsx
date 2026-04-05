'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import {
    ExternalLink, Users, Calendar, Shield, IndianRupee,
    Mail, Clock, CheckCircle, XCircle,
} from 'lucide-react';
import type { User } from '@/types';
import { updateUserRoleAction } from '@/server/actions/admin.actions';

const ROLE_COLOR: Record<string, string> = {
    participant: 'bg-neutral-100 text-neutral-600',
    community_admin: 'bg-blue-100 text-blue-700',
    admin: 'bg-violet-100 text-violet-700',
    kyoty_admin: 'bg-primary-100 text-primary-700',
};

const ROLE_OPTIONS = ['participant', 'community_admin', 'admin', 'kyoty_admin'];

interface Props {
    targetUser: User;
    currentUserId: number;
    memberships: any[];
    eventParticipations: any[];
    communitiesCreated: any[];
    eventsCreated: any[];
    payments: any[];
}

export function UserAdminClient({
    targetUser, currentUserId, memberships, eventParticipations,
    communitiesCreated, eventsCreated, payments,
}: Props) {
    const router = useRouter();
    const [roleLoading, setRoleLoading] = useState(false);
    const isSelf = targetUser.id === currentUserId;

    const handleRoleChange = async (newRole: string) => {
        if (isSelf) {
            toast.error("You can't change your own role");
            return;
        }
        setRoleLoading(true);
        const result = await updateUserRoleAction(targetUser.id, newRole);
        setRoleLoading(false);
        if (result.success) {
            toast.success(`Role updated to ${newRole}`);
            router.refresh();
        } else {
            toast.error(result.error ?? 'Failed to update role');
        }
    };

    const totalSpent = payments
        .filter((p: any) => p.status === 'captured')
        .reduce((sum: number, p: any) => sum + (p.amount_paise || 0), 0);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3">
                <Link href="/admin/users" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
                    ← Users
                </Link>
                <span className="text-neutral-300">/</span>
                <h1 className="text-xl font-bold text-neutral-900 truncate">{targetUser.name}</h1>
                {isSelf && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">You</span>
                )}
            </div>

            {/* Profile Card */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-lg font-bold text-white shrink-0">
                        {targetUser.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-neutral-900">{targetUser.name}</h2>
                        <p className="flex items-center gap-1.5 text-sm text-neutral-500">
                            <Mail size={13} /> {targetUser.email}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLOR[targetUser.role] ?? 'bg-neutral-100 text-neutral-500'}`}>
                                {targetUser.role}
                            </span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                targetUser.verification_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                            }`}>
                                {targetUser.verification_status ?? 'pending'}
                            </span>
                            {targetUser.onboarding_completed ? (
                                <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle size={12} /> Onboarded</span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs text-amber-600"><XCircle size={12} /> Not onboarded</span>
                            )}
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-xs text-neutral-400">Joined</p>
                        <p className="text-sm font-medium text-neutral-700">
                            {new Date(targetUser.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Social proof */}
                {targetUser.social_proof_type && (
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                        <p className="text-xs text-neutral-400 mb-1">Social Proof</p>
                        <a
                            href={targetUser.social_proof_link ?? '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:underline capitalize"
                        >
                            {targetUser.social_proof_type} ↗
                        </a>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <StatCard icon={<Users size={14} />} label="Communities Joined" value={memberships.length} />
                <StatCard icon={<Shield size={14} />} label="Communities Created" value={communitiesCreated.length} />
                <StatCard icon={<Calendar size={14} />} label="Events Attended" value={eventParticipations.length} />
                <StatCard icon={<Calendar size={14} />} label="Events Created" value={eventsCreated.length} />
                <StatCard icon={<IndianRupee size={14} />} label="Total Spent" value={`₹${(totalSpent / 100).toLocaleString()}`} />
            </div>

            {/* Role Management */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-neutral-900">Change Role</h2>
                {isSelf ? (
                    <p className="text-sm text-neutral-500">You cannot change your own role.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {ROLE_OPTIONS.map(r => (
                            <button
                                key={r}
                                onClick={() => handleRoleChange(r)}
                                disabled={roleLoading || r === targetUser.role}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${
                                    r === targetUser.role
                                        ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                }`}
                            >
                                {r.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Communities Created */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">
                        Communities Created <span className="text-neutral-400 font-normal">({communitiesCreated.length})</span>
                    </h2>
                    {communitiesCreated.length > 0 ? (
                        <ul className="divide-y divide-neutral-100 max-h-64 overflow-y-auto">
                            {communitiesCreated.map((c: any) => (
                                <li key={c.id} className="flex items-center justify-between py-2.5">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-neutral-800 truncate">{c.name}</p>
                                        <p className="text-xs text-neutral-400">{c.status}</p>
                                    </div>
                                    <Link
                                        href={`/admin/community/${c.id}`}
                                        className="shrink-0 p-1.5 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                    >
                                        <ExternalLink size={13} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-neutral-400 text-center py-4">None</p>
                    )}
                </div>

                {/* Events Created */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">
                        Events Created <span className="text-neutral-400 font-normal">({eventsCreated.length})</span>
                    </h2>
                    {eventsCreated.length > 0 ? (
                        <ul className="divide-y divide-neutral-100 max-h-64 overflow-y-auto">
                            {eventsCreated.map((e: any) => (
                                <li key={e.id} className="flex items-center justify-between py-2.5">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-neutral-800 truncate">{e.title}</p>
                                        <p className="text-xs text-neutral-400">
                                            {e.status} · {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/admin/event/${e.id}`}
                                        className="shrink-0 p-1.5 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                    >
                                        <ExternalLink size={13} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-neutral-400 text-center py-4">None</p>
                    )}
                </div>
            </div>

            {/* Payments */}
            {payments.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-neutral-900 mb-4">
                        Payment History <span className="text-neutral-400 font-normal">({payments.length})</span>
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    <th className="px-3 py-2">Amount</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Event</th>
                                    <th className="px-3 py-2">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {payments.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-neutral-50">
                                        <td className="px-3 py-2.5 font-medium text-neutral-800">₹{((p.amount_paise || 0) / 100).toLocaleString()}</td>
                                        <td className="px-3 py-2.5">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                                                p.status === 'captured' ? 'bg-green-100 text-green-700'
                                                : p.status === 'refunded' ? 'bg-amber-100 text-amber-700'
                                                : 'bg-red-100 text-red-600'
                                            }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            {p.event_id ? (
                                                <Link href={`/admin/event/${p.event_id}`} className="text-primary-600 hover:underline text-xs">
                                                    Event #{p.event_id}
                                                </Link>
                                            ) : '—'}
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

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-neutral-400 mb-2">{icon}</div>
            <p className="text-xl font-bold text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
        </div>
    );
}
