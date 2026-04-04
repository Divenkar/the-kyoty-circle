import { getCurrentUser } from '@/lib/auth-server';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Bell, Clock, ArrowRight, Activity, Users, Calendar, MessageCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MarkAllReadButton } from './MarkAllReadButton';

export const metadata: Metadata = {
    title: 'Activity | Kyoty',
};

interface Notification {
    id: number;
    user_id: number;
    type: string;
    title: string;
    body: string | null;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getNotificationIcon(type: string) {
    switch (type) {
        case 'event_registration':
        case 'event_update':
            return <Calendar size={16} className="text-primary-600" />;
        case 'community_approved':
        case 'community_update':
            return <Users size={16} className="text-primary-600" />;
        case 'comment':
        case 'message':
            return <MessageCircle size={16} className="text-primary-600" />;
        default:
            return <Bell size={16} className="text-primary-600" />;
    }
}

export default async function ActivityPage() {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const supabase = await createClient();
    const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

    const items: Notification[] = (notifications ?? []) as Notification[];
    const unreadCount = items.filter((n) => !n.is_read).length;

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="border-b border-neutral-200 bg-[radial-gradient(circle_at_top_right,_rgba(108,71,255,0.1),_transparent_25%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
                                <Activity size={15} />
                                Stay in the loop
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                                Activity
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                                Your notifications, updates, and recent activity across Kyoty communities.
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-3">
                            {unreadCount > 0 && <MarkAllReadButton />}
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-primary-300 hover:text-primary-600"
                            >
                                Dashboard
                                <ArrowRight size={15} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                {items.length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
                            <Bell size={28} className="text-primary-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900">
                            No notifications yet
                        </h3>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
                            When communities you follow post updates, or events you registered for have changes, you&apos;ll see them here.
                        </p>
                        <Link
                            href="/explore"
                            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                        >
                            Explore events
                            <ArrowRight size={15} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {unreadCount > 0 && (
                            <div className="mb-4 flex items-center justify-between rounded-2xl border border-primary-100 bg-primary-50 px-5 py-3">
                                <span className="text-sm font-medium text-primary-800">
                                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                                </span>
                                <div className="sm:hidden">
                                    <MarkAllReadButton />
                                </div>
                            </div>
                        )}

                        {items.map((n) => (
                            <div key={n.id}>
                                {n.link ? (
                                    <Link
                                        href={n.link}
                                        className={`flex items-start gap-4 rounded-2xl border bg-white p-4 transition hover:shadow-sm ${
                                            n.is_read
                                                ? 'border-neutral-100'
                                                : 'border-primary-200 bg-primary-50/30'
                                        }`}
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                                            {getNotificationIcon(n.type)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-sm ${n.is_read ? 'text-neutral-700' : 'font-semibold text-neutral-900'}`}>
                                                {n.title}
                                            </p>
                                            {n.body && (
                                                <p className="mt-0.5 text-xs leading-5 text-neutral-500 line-clamp-2">
                                                    {n.body}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-neutral-400">
                                                {timeAgo(n.created_at)}
                                            </p>
                                        </div>
                                        {!n.is_read && (
                                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                                        )}
                                    </Link>
                                ) : (
                                    <div
                                        className={`flex items-start gap-4 rounded-2xl border bg-white p-4 ${
                                            n.is_read
                                                ? 'border-neutral-100'
                                                : 'border-primary-200 bg-primary-50/30'
                                        }`}
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                                            {getNotificationIcon(n.type)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-sm ${n.is_read ? 'text-neutral-700' : 'font-semibold text-neutral-900'}`}>
                                                {n.title}
                                            </p>
                                            {n.body && (
                                                <p className="mt-0.5 text-xs leading-5 text-neutral-500 line-clamp-2">
                                                    {n.body}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-neutral-400">
                                                {timeAgo(n.created_at)}
                                            </p>
                                        </div>
                                        {!n.is_read && (
                                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
