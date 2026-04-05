'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react';
import { resolveReportAction } from '@/server/actions/admin.actions';

const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    resolved: 'bg-green-100 text-green-700',
    dismissed: 'bg-neutral-100 text-neutral-500',
};

const TARGET_LINKS: Record<string, (id: number) => string> = {
    community: (id) => `/admin/community/${id}`,
    event: (id) => `/admin/event/${id}`,
    user: (id) => `/admin/user/${id}`,
    post: (id) => `/admin/reports`,
    comment: (id) => `/admin/reports`,
    message: (id) => `/admin/reports`,
};

type FilterStatus = 'all' | 'pending' | 'resolved' | 'dismissed';

interface Props {
    reports: any[];
}

export function ReportsClient({ reports }: Props) {
    const router = useRouter();
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

    const counts = reports.reduce<Record<string, number>>((acc, r) => {
        acc[r.status] = (acc[r.status] ?? 0) + 1;
        return acc;
    }, {});

    const handleResolve = async (reportId: number, newStatus: 'resolved' | 'dismissed') => {
        setLoadingId(reportId);
        const result = await resolveReportAction(reportId, newStatus);
        setLoadingId(null);
        if (result.success) {
            toast.success(`Report ${newStatus}`);
            router.refresh();
        } else {
            toast.error(result.error ?? 'Failed to update report');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-amber-500" />
                    Reports
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                    {reports.length} total &mdash;&nbsp;
                    {counts.pending ?? 0} pending,&nbsp;
                    {counts.resolved ?? 0} resolved,&nbsp;
                    {counts.dismissed ?? 0} dismissed
                </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <Filter size={14} className="text-neutral-400" />
                {(['all', 'pending', 'resolved', 'dismissed'] as const).map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            filter === s
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                    >
                        {s === 'all' ? `All (${reports.length})` : `${s} (${counts[s] ?? 0})`}
                    </button>
                ))}
            </div>

            {/* Reports list */}
            <div className="space-y-3">
                {filtered.length > 0 ? (
                    filtered.map((report: any) => {
                        const reporter = report.kyoty_users;
                        const linkFn = TARGET_LINKS[report.target_type];
                        const targetLink = linkFn ? linkFn(report.target_id) : null;

                        return (
                            <div key={report.id} className="bg-white border border-neutral-200 rounded-2xl p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLOR[report.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                                                {report.status}
                                            </span>
                                            <span className="text-xs text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-full capitalize">
                                                {report.target_type} #{report.target_id}
                                            </span>
                                            <span className="text-xs text-neutral-400">
                                                {new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <p className="text-sm font-semibold text-neutral-800 mb-1">{report.reason}</p>
                                        {report.description && (
                                            <p className="text-sm text-neutral-600">{report.description}</p>
                                        )}

                                        <div className="flex items-center gap-3 mt-3 text-xs text-neutral-500">
                                            <span>
                                                Reported by: {reporter ? (
                                                    <Link href={`/admin/user/${reporter.id}`} className="text-primary-600 hover:underline">
                                                        {reporter.name}
                                                    </Link>
                                                ) : 'Unknown'}
                                            </span>
                                            {targetLink && (
                                                <Link href={targetLink} className="text-primary-600 hover:underline">
                                                    View {report.target_type} →
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {report.status === 'pending' && (
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => handleResolve(report.id, 'resolved')}
                                                disabled={loadingId === report.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-40"
                                            >
                                                <CheckCircle size={13} /> Resolve
                                            </button>
                                            <button
                                                onClick={() => handleResolve(report.id, 'dismissed')}
                                                disabled={loadingId === report.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors disabled:opacity-40"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    )}

                                    {report.status !== 'pending' && report.resolved_at && (
                                        <div className="text-xs text-neutral-400 shrink-0">
                                            <Clock size={12} className="inline mr-1" />
                                            Resolved {new Date(report.resolved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-2xl py-12 text-center">
                        <p className="text-sm text-neutral-400">
                            {filter === 'all' ? 'No reports yet.' : `No ${filter} reports.`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
