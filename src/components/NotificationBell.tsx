'use client';

import React from 'react';
import { Bell, X, Check } from 'lucide-react';

interface Notification {
    id: number;
    type: string;
    title: string;
    body: string | null;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

export function NotificationBell() {
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

    React.useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative">
            <button
                onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
                className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
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
                    <div className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-white rounded-2xl shadow-xl border border-neutral-200 z-50 overflow-hidden">
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
                                notifications.map((n) => (
                                    <a
                                        key={n.id}
                                        href={n.link || '#'}
                                        className={`block px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 transition-colors ${!n.is_read ? 'bg-primary-50/50' : ''
                                            }`}
                                        onClick={() => setOpen(false)}
                                    >
                                        <div className="flex items-start gap-2">
                                            {!n.is_read && <span className="w-2 h-2 mt-1.5 rounded-full bg-primary-500 flex-shrink-0" />}
                                            <div className={!n.is_read ? '' : 'pl-4'}>
                                                <p className="text-sm font-medium text-neutral-900">{n.title}</p>
                                                {n.body && <p className="text-xs text-neutral-500 mt-0.5">{n.body}</p>}
                                                <p className="text-xs text-neutral-400 mt-1">
                                                    {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                    </a>
                                ))
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
