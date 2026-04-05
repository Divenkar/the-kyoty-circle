import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { AdminLogRepository } from '@/lib/repositories/admin-log-repo';
import { Shield, Activity } from 'lucide-react';

const ACTION_LABELS: Record<string, string> = {
    approve_community: 'Approved community',
    reject_community: 'Rejected community',
    disable_community: 'Disabled community',
    enable_community: 'Enabled community',
    delete_community: 'Deleted community',
    update_community: 'Updated community',
    remove_member: 'Removed member',
    delete_media: 'Deleted media',
    approve_event: 'Approved event',
    reject_event: 'Rejected event',
    update_user_role: 'Updated user role',
    set_event_status_cancelled: 'Cancelled event',
    set_event_status_completed: 'Completed event',
    set_event_status_open: 'Opened event',
    set_event_status_approved: 'Approved event',
    set_event_status_rejected: 'Rejected event',
    resolve_report: 'Resolved report',
    dismiss_report: 'Dismissed report',
};

const ACTION_COLOR: Record<string, string> = {
    approve_community: 'bg-green-100 text-green-600',
    approve_event: 'bg-green-100 text-green-600',
    reject_community: 'bg-red-100 text-red-600',
    reject_event: 'bg-red-100 text-red-600',
    delete_community: 'bg-red-100 text-red-600',
    delete_media: 'bg-red-100 text-red-600',
    disable_community: 'bg-amber-100 text-amber-600',
    enable_community: 'bg-green-100 text-green-600',
    remove_member: 'bg-red-100 text-red-600',
    update_user_role: 'bg-violet-100 text-violet-600',
    update_community: 'bg-blue-100 text-blue-600',
    resolve_report: 'bg-green-100 text-green-600',
    dismiss_report: 'bg-neutral-100 text-neutral-600',
};

export default async function AdminActivityPage() {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'kyoty_admin' && user.role !== 'admin')) redirect('/dashboard');

    const logs = await AdminLogRepository.findRecent(200);

    // Group logs by date
    const grouped = logs.reduce<Record<string, typeof logs>>((acc, log) => {
        const date = new Date(log.created_at).toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
    }, {});

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                    <Activity size={20} className="text-primary-600" />
                    Activity Log
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                    Complete admin action history ({logs.length} entries)
                </p>
            </div>

            {Object.keys(grouped).length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([date, dateLogs]) => (
                        <div key={date}>
                            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-3">{date}</h2>
                            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                                <ul className="divide-y divide-neutral-100">
                                    {dateLogs.map(log => (
                                        <li key={log.id} className="flex items-center gap-4 px-5 py-3.5">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ACTION_COLOR[log.action] ?? 'bg-neutral-100 text-neutral-500'}`}>
                                                <Shield size={13} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-neutral-800">
                                                    {ACTION_LABELS[log.action] ?? log.action}
                                                </p>
                                                <p className="text-xs text-neutral-400 capitalize">
                                                    {log.target_type} #{log.target_id}
                                                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                        <span className="ml-2 text-neutral-300">
                                                            {Object.entries(log.metadata).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <span className="text-xs text-neutral-400 shrink-0">
                                                {new Date(log.created_at).toLocaleTimeString('en-IN', {
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-neutral-200 rounded-2xl py-12 text-center">
                    <p className="text-sm text-neutral-400">No admin activity recorded yet.</p>
                </div>
            )}
        </div>
    );
}
