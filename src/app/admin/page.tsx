import { getCurrentUser } from '@/lib/auth-server';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { EventRepository } from '@/lib/repositories/event-repo';
import { AdminLogRepository } from '@/lib/repositories/admin-log-repo';
import { AdminActions } from './AdminActions';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import {
    Shield,
    Users,
    Calendar,
    AlertTriangle,
    UserCircle,
    Image as ImageIcon,
    Activity,
    ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

async function getPlatformStats() {
    const supabase = await createClient();

    const results = await Promise.all([
        supabase.from('communities').select('*', { count: 'exact', head: true }),
        supabase.from('kyoty_users').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('community_members').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('community_media').select('*', { count: 'exact', head: true }),
    ]);

    for (const r of results) {
        if (r.error) console.error('[admin] getPlatformStats query error:', r.error.message);
    }

    return {
        totalCommunities: results[0].count ?? 0,
        totalUsers: results[1].count ?? 0,
        totalEvents: results[2].count ?? 0,
        totalMembers: results[3].count ?? 0,
        totalMedia: results[4].count ?? 0,
    };
}

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
};

export default async function AdminPage() {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'kyoty_admin' && user.role !== 'admin')) redirect('/dashboard');

    const [pendingCommunitiesResult, pendingEventsResult, statsResult, recentLogsResult] = await Promise.allSettled([
        CommunityRepository.findPending(),
        EventRepository.findPending(),
        getPlatformStats(),
        AdminLogRepository.findRecent(12),
    ]);

    if (pendingCommunitiesResult.status === 'rejected') console.error('[admin] findPending communities failed:', pendingCommunitiesResult.reason);
    if (pendingEventsResult.status === 'rejected') console.error('[admin] findPending events failed:', pendingEventsResult.reason);
    if (statsResult.status === 'rejected') console.error('[admin] getPlatformStats failed:', statsResult.reason);
    if (recentLogsResult.status === 'rejected') console.error('[admin] findRecent logs failed:', recentLogsResult.reason);

    const pendingCommunities = pendingCommunitiesResult.status === 'fulfilled' ? pendingCommunitiesResult.value : [];
    const pendingEvents = pendingEventsResult.status === 'fulfilled' ? pendingEventsResult.value : [];
    const stats = statsResult.status === 'fulfilled' ? statsResult.value : { totalCommunities: 0, totalUsers: 0, totalEvents: 0, totalMembers: 0, totalMedia: 0 };
    const recentLogs = recentLogsResult.status === 'fulfilled' ? recentLogsResult.value : [];

    const totalPending = pendingCommunities.length + pendingEvents.length;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                    <Shield size={22} className="text-primary-600" />
                    Dashboard
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">Platform overview and moderation queue</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <StatCard icon={<Users size={16} />} color="primary" value={stats.totalCommunities} label="Communities" />
                <StatCard icon={<UserCircle size={16} />} color="violet" value={stats.totalUsers} label="Users" />
                <StatCard icon={<Calendar size={16} />} color="blue" value={stats.totalEvents} label="Events" />
                <StatCard icon={<Users size={16} />} color="green" value={stats.totalMembers} label="Active Members" />
                <StatCard icon={<ImageIcon size={16} />} color="amber" value={stats.totalMedia} label="Media Items" />
            </div>

            {/* Pending alert */}
            {totalPending > 0 && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800 font-medium">
                        {totalPending} item{totalPending > 1 ? 's' : ''} waiting for approval
                    </p>
                </div>
            )}

            {/* Quick nav */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { href: '/admin/communities', icon: <Users size={16} />, label: 'Communities', sub: `${stats.totalCommunities} total` },
                    { href: '/admin/events', icon: <Calendar size={16} />, label: 'Events', sub: `${stats.totalEvents} total` },
                    { href: '/admin/users', icon: <UserCircle size={16} />, label: 'Users', sub: `${stats.totalUsers} total` },
                    { href: '/admin/communities', icon: <AlertTriangle size={16} />, label: 'Pending Approvals', sub: `${totalPending} waiting` },
                ].map(({ href, icon, label, sub }) => (
                    <Link
                        key={label}
                        href={href}
                        className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-2xl hover:border-primary-300 hover:shadow-sm transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                                {icon}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-neutral-800">{label}</p>
                                <p className="text-xs text-neutral-400">{sub}</p>
                            </div>
                        </div>
                        <ChevronRight size={14} className="text-neutral-300 group-hover:text-primary-400 transition-colors" />
                    </Link>
                ))}
            </div>

            {/* Pending approvals queue */}
            <AdminActions pendingCommunities={pendingCommunities} pendingEvents={pendingEvents} />

            {/* Recent activity */}
            <div>
                <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2 mb-4">
                    <Activity size={16} className="text-neutral-500" />
                    Recent Admin Activity
                </h2>
                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                    {recentLogs.length > 0 ? (
                        <ul className="divide-y divide-neutral-100">
                            {recentLogs.map((log) => (
                                <li key={log.id} className="flex items-center justify-between px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center">
                                            <Shield size={12} className="text-neutral-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-neutral-800">
                                                {ACTION_LABELS[log.action] ?? log.action}
                                            </p>
                                            <p className="text-xs text-neutral-400 capitalize">
                                                {log.target_type} #{log.target_id}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-neutral-400 shrink-0 ml-4">
                                        {new Date(log.created_at).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="py-10 text-center text-sm text-neutral-400">No activity yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}

type StatColor = 'primary' | 'violet' | 'blue' | 'green' | 'amber';

function StatCard({
    icon,
    color,
    value,
    label,
}: {
    icon: React.ReactNode;
    color: StatColor;
    value: number;
    label: string;
}) {
    const colors: Record<StatColor, string> = {
        primary: 'bg-primary-50 text-primary-600',
        violet: 'bg-violet-50 text-violet-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        amber: 'bg-amber-50 text-amber-600',
    };

    return (
        <div className="p-4 bg-white border border-neutral-200 rounded-2xl">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
                {icon}
            </div>
            <p className="text-2xl font-bold text-neutral-900">{value.toLocaleString()}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
        </div>
    );
}
