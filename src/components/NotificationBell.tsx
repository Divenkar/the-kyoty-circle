'use client';

import React, { useEffect } from 'react';
import { Bell, Check, CheckCircle, XCircle, UserCheck, UserPlus, ArrowUp } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface Notification {
    id: number;
    type: string;
    title: string;
    body: string | null;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
    event_approved:     <CheckCircle size={14} className="text-green-600" />,
    event_rejected:     <XCircle size={14} className="text-red-500" />,
    community_approved: <CheckCircle size={14} className="text-primary-600" />,
    community_rejected: <XCircle size={14} className="text-red-500" />,
    member_approved:    <UserCheck size={14} className="text-green-600" />,
    join_request:       <UserPlus size={14} className="text-amber-500" />,
    waitlist_promoted:  <ArrowUp size={14} className="text-blue-500" />,
};

interface NotificationBellProps {
    userId: number | null;
}

export function NotificationBell({ userId }: NotificationBellProps) {
    const [open, setOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [loading, setLoading] = React.useState(false);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch {
            // silent fail
        }
        setLoading(false);
    };

    const markAllRead = async () => {
        try {
            await fetch('/api/notifications', { method: 'PUT' });
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch {
            // silent fail
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Realtime subscription — re-fetch on new notification for this user
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel(`notifications-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    return (
        <div className="relative">
            <button
                onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Notifications"
                aria-expanded={open}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="fixed inset-x-4 top-20 z-50 max-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:inset-x-auto">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                            <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    <Check size={12} />
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="overflow-y-auto max-h-72">
                            {loading && notifications.length === 0 ? (
                                <div className="p-4 text-sm text-neutral-500 text-center">Loading...</div>
                            ) : notifications.length > 0 ? (
                                <div className="max-h-[calc(100vh-11rem)] overflow-y-auto">
                                    {notifications.map((n) => (
                                        <a
                                            key={n.id}
                                            href={n.link || '#'}
                                            className={`flex items-start gap-3 px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 transition-colors ${!n.is_read ? 'bg-primary-50/50' : ''}`}
                                            onClick={() => setOpen(false)}
                                        >
                                            <div className="mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
                                                {TYPE_ICON[n.type] ?? <Bell size={14} className="text-neutral-500" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-neutral-900 leading-snug">{n.title}</p>
                                                {n.body && <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{n.body}</p>}
                                                <p className="text-xs text-neutral-400 mt-1">
                                                    {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                            {!n.is_read && (
                                                <span className="mt-2 h-2 w-2 rounded-full bg-primary-500 shrink-0" />
                                            )}
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <Bell size={24} className="text-neutral-300 mx-auto mb-2" />
                                    <p className="text-sm text-neutral-500">No notifications yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
