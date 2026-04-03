'use client';

import React, { useState } from 'react';
import {
    Bell, Check, CheckCheck, CheckCircle, XCircle, UserCheck, UserPlus,
    ArrowUp, ExternalLink, Heart, MessageCircle, AtSign, Calendar,
} from 'lucide-react';

interface Notification {
    id: number;
    type: string;
    title: string;
    body: string | null;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; bg: string; label: string; tab: string }> = {
    // Admin
    event_approved:     { icon: <CheckCircle size={16} />, bg: 'bg-green-100 text-green-700',     label: 'Event Approved',      tab: 'admin' },
    event_rejected:     { icon: <XCircle size={16} />,     bg: 'bg-red-100 text-red-700',          label: 'Event Rejected',      tab: 'admin' },
    community_approved: { icon: <CheckCircle size={16} />, bg: 'bg-primary-100 text-primary-700',  label: 'Community Approved',  tab: 'admin' },
    community_rejected: { icon: <XCircle size={16} />,     bg: 'bg-red-100 text-red-700',          label: 'Community Rejected',  tab: 'admin' },
    member_approved:    { icon: <UserCheck size={16} />,   bg: 'bg-green-100 text-green-700',      label: 'Member Approved',     tab: 'admin' },
    join_request:       { icon: <UserPlus size={16} />,    bg: 'bg-amber-100 text-amber-700',      label: 'Join Request',        tab: 'admin' },
    // Events
    waitlist_promoted:  { icon: <ArrowUp size={16} />,     bg: 'bg-blue-100 text-blue-700',        label: 'Waitlist Promoted',   tab: 'events' },
    event_reminder:     { icon: <Calendar size={16} />,    bg: 'bg-violet-100 text-violet-700',    label: 'Event Reminder',      tab: 'events' },
    event_cancelled:    { icon: <XCircle size={16} />,     bg: 'bg-red-100 text-red-700',          label: 'Event Cancelled',     tab: 'events' },
    // Social
    post_reaction:      { icon: <Heart size={16} />,       bg: 'bg-pink-100 text-pink-700',        label: 'Reaction',            tab: 'social' },
    post_comment:       { icon: <MessageCircle size={16} />, bg: 'bg-primary-100 text-primary-700', label: 'New Comment',         tab: 'social' },
    mention:            { icon: <AtSign size={16} />,      bg: 'bg-indigo-100 text-indigo-700',    label: 'Mention',             tab: 'social' },
};

const DEFAULT_CONFIG = { icon: <Bell size={16} />, bg: 'bg-neutral-100 text-neutral-600', label: 'Notification', tab: 'all' };

const TABS = [
    { key: 'all',    label: 'All' },
    { key: 'social', label: 'Social' },
    { key: 'admin',  label: 'Admin' },
    { key: 'events', label: 'Events' },
] as const;

type Tab = typeof TABS[number]['key'];

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

interface NotificationsListProps {
    initialNotifications: Notification[];
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
    const [notifications, setNotifications] = useState(initialNotifications);
    const [activeTab, setActiveTab] = useState<Tab>('all');
    const [markingAll, setMarkingAll] = useState(false);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const filteredNotifications = activeTab === 'all'
        ? notifications
        : notifications.filter((n) => {
            const cfg = TYPE_CONFIG[n.type];
            return cfg?.tab === activeTab;
        });

    const tabUnread = (tab: Tab) =>
        tab === 'all'
            ? unreadCount
            : notifications.filter((n) => !n.is_read && TYPE_CONFIG[n.type]?.tab === tab).length;

    const markAllRead = async () => {
        setMarkingAll(true);
        try {
            await fetch('/api/notifications', { method: 'PUT' });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch {
            // silent
        }
        setMarkingAll(false);
    };

    const markOneRead = async (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    return (
        <div>
            {/* Tab bar */}
            <div className="mb-5 flex items-center gap-1 rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm">
                {TABS.map((tab) => {
                    const count = tabUnread(tab.key);
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                activeTab === tab.key
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
                            }`}
                        >
                            {tab.label}
                            {count > 0 && (
                                <span className={`inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                                    activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-primary-100 text-primary-700'
                                }`}>
                                    {count > 99 ? '99+' : count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Summary + mark all */}
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-neutral-500">
                    {unreadCount > 0
                        ? <><span className="font-semibold text-primary-600">{unreadCount} unread</span> · {notifications.length} total</>
                        : `${notifications.length} notifications`}
                </p>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        disabled={markingAll}
                        className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:border-primary-300 hover:text-primary-600 disabled:opacity-50"
                    >
                        <CheckCheck size={13} />
                        {markingAll ? 'Marking…' : 'Mark all read'}
                    </button>
                )}
            </div>

            {/* List */}
            {filteredNotifications.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
                        <Bell size={24} className="text-neutral-400" />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900">
                        {activeTab === 'all' ? 'All caught up' : `No ${activeTab} notifications`}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-500">
                        {activeTab === 'all'
                            ? 'You have no notifications yet.'
                            : `Nothing in this category yet.`}
                    </p>
                </div>
            ) : (
                <div className="rounded-[2rem] border border-neutral-200 bg-white shadow-sm divide-y divide-neutral-100 overflow-hidden">
                    {filteredNotifications.map((n) => {
                        const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_CONFIG;
                        return (
                            <div
                                key={n.id}
                                className={`flex items-start gap-4 p-5 transition-colors ${!n.is_read ? 'bg-primary-50/40' : 'hover:bg-neutral-50'}`}
                            >
                                {/* Type icon */}
                                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                                    {cfg.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mb-0.5 block">
                                                {cfg.label}
                                            </span>
                                            <p className="text-sm font-medium text-neutral-900">{n.title}</p>
                                            {n.body && <p className="mt-0.5 text-xs leading-5 text-neutral-500">{n.body}</p>}
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            <span className="text-xs text-neutral-400">{timeAgo(n.created_at)}</span>
                                            {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary-500" />}
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center gap-3">
                                        {n.link && (
                                            <a
                                                href={n.link}
                                                onClick={() => markOneRead(n.id)}
                                                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                                            >
                                                View <ExternalLink size={10} />
                                            </a>
                                        )}
                                        {!n.is_read && (
                                            <button
                                                onClick={() => markOneRead(n.id)}
                                                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600"
                                            >
                                                <Check size={10} /> Mark read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
