'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    removeAttendeeAction,
    checkInAction,
    sendMessageAction,
} from '@/server/actions/organizer.actions';
import {
    Users,
    UserCheck,
    Trash2,
    Send,
    Search,
    CheckCircle,
    Mail,
    X,
    AlertTriangle,
} from 'lucide-react';

interface Attendee {
    id: number;
    event_id: number;
    user_id: number;
    status: string;
    checked_in_at: string | null;
    joined_at: string;
    kyoty_users?: {
        id: number;
        name: string;
        email: string;
        avatar_url?: string;
    };
}

interface AttendeeManagerProps {
    eventId: number;
    initialAttendees: Attendee[];
}

export function AttendeeManager({ eventId, initialAttendees }: AttendeeManagerProps) {
    const router = useRouter();
    const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'list' | 'message'>('list');
    const [loadingId, setLoadingId] = useState<number | null>(null);

    // Message form state
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    // Remove confirmation
    const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);

    // Filter attendees by search query
    const filteredAttendees = useMemo(() => {
        if (!searchQuery.trim()) return attendees;
        const q = searchQuery.toLowerCase();
        return attendees.filter(
            (a) =>
                a.kyoty_users?.name?.toLowerCase().includes(q) ||
                a.kyoty_users?.email?.toLowerCase().includes(q) ||
                a.status.toLowerCase().includes(q)
        );
    }, [attendees, searchQuery]);

    // Handle check-in
    const handleCheckIn = async (userId: number) => {
        setLoadingId(userId);
        try {
            const result = await checkInAction(eventId, userId);
            if (result.success) {
                setAttendees((prev) =>
                    prev.map((a) =>
                        a.user_id === userId
                            ? { ...a, checked_in_at: new Date().toISOString() }
                            : a
                    )
                );
                toast.success('Attendee checked in successfully');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to check in attendee');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setLoadingId(null);
        }
    };

    // Handle remove attendee
    const handleRemove = async (participantId: number) => {
        setLoadingId(participantId);
        try {
            const result = await removeAttendeeAction(participantId, eventId);
            if (result.success) {
                setAttendees((prev) => prev.filter((a) => a.id !== participantId));
                setConfirmRemoveId(null);
                toast.success('Attendee removed successfully');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to remove attendee');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setLoadingId(null);
        }
    };

    // Handle send message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !body.trim()) {
            toast.error('Please fill in both subject and message');
            return;
        }
        setSendingMessage(true);
        try {
            const result = await sendMessageAction(eventId, subject, body);
            if (result.success) {
                toast.success(`Message sent to ${attendees.length} attendees`);
                setSubject('');
                setBody('');
            } else {
                toast.error(result.error || 'Failed to send message');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setSendingMessage(false);
        }
    };

    return (
        <div>
            {/* Tab bar */}
            <div className="flex gap-1 bg-neutral-100 rounded-2xl p-1 mb-6">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                        activeTab === 'list'
                            ? 'bg-white text-neutral-900 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                    <Users size={14} />
                    Attendees ({attendees.length})
                </button>
                <button
                    onClick={() => setActiveTab('message')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                        activeTab === 'message'
                            ? 'bg-white text-neutral-900 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                    <Send size={14} />
                    Message All
                </button>
            </div>

            {/* Attendee List Tab */}
            {activeTab === 'list' && (
                <div>
                    {/* Search bar */}
                    <div className="relative mb-4">
                        <Search
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                        />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Attendee table */}
                    {filteredAttendees.length > 0 ? (
                        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                            {/* Table header */}
                            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-5 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                <div className="col-span-4">Name</div>
                                <div className="col-span-3">Email</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-1">Check-in</div>
                                <div className="col-span-2 text-right">Actions</div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-neutral-100">
                                {filteredAttendees.map((attendee) => (
                                    <div
                                        key={attendee.id}
                                        className="sm:grid sm:grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-neutral-50/50 transition-colors"
                                    >
                                        {/* Name */}
                                        <div className="col-span-4 flex items-center gap-3 mb-2 sm:mb-0">
                                            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs flex-shrink-0">
                                                {(attendee.kyoty_users?.name || 'U')[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-neutral-900 truncate">
                                                {attendee.kyoty_users?.name || 'Unknown'}
                                            </span>
                                        </div>

                                        {/* Email */}
                                        <div className="col-span-3 mb-2 sm:mb-0">
                                            <span className="text-sm text-neutral-500 truncate block">
                                                {attendee.kyoty_users?.email || '--'}
                                            </span>
                                        </div>

                                        {/* Registration status */}
                                        <div className="col-span-2 mb-2 sm:mb-0">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    attendee.status === 'registered'
                                                        ? 'bg-green-50 text-green-700'
                                                        : attendee.status === 'waitlisted'
                                                          ? 'bg-amber-50 text-amber-700'
                                                          : 'bg-neutral-100 text-neutral-600'
                                                }`}
                                            >
                                                {attendee.status.charAt(0).toUpperCase() +
                                                    attendee.status.slice(1)}
                                            </span>
                                        </div>

                                        {/* Check-in status */}
                                        <div className="col-span-1 mb-2 sm:mb-0">
                                            {attendee.checked_in_at ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                                                    <CheckCircle size={14} />
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="text-xs text-neutral-400">No</span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-2 flex items-center justify-end gap-2">
                                            {!attendee.checked_in_at && (
                                                <button
                                                    onClick={() => handleCheckIn(attendee.user_id)}
                                                    disabled={loadingId === attendee.user_id}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                                                    title="Check in attendee"
                                                >
                                                    <UserCheck size={12} />
                                                    {loadingId === attendee.user_id
                                                        ? '...'
                                                        : 'Check In'}
                                                </button>
                                            )}

                                            {confirmRemoveId === attendee.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleRemove(attendee.id)}
                                                        disabled={loadingId === attendee.id}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                                    >
                                                        {loadingId === attendee.id
                                                            ? '...'
                                                            : 'Confirm'}
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmRemoveId(null)}
                                                        className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmRemoveId(attendee.id)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Remove attendee"
                                                >
                                                    <Trash2 size={12} />
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-14 bg-white border border-neutral-200 rounded-2xl shadow-sm">
                            <Users size={32} className="text-neutral-300 mx-auto mb-3" />
                            <p className="text-neutral-500 text-sm">
                                {searchQuery
                                    ? 'No attendees match your search'
                                    : 'No attendees yet'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Message Tab */}
            {activeTab === 'message' && (
                <form
                    onSubmit={handleSendMessage}
                    className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6"
                >
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                            <Mail size={18} className="text-primary-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-900">
                                Send Message to All Attendees
                            </h3>
                            <p className="text-xs text-neutral-500">
                                This will email all {attendees.length} registered attendees
                            </p>
                        </div>
                    </div>

                    {attendees.length === 0 && (
                        <div className="flex items-center gap-2 p-3 mb-4 text-sm text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
                            <AlertTriangle size={16} />
                            No attendees to send a message to.
                        </div>
                    )}

                    <div className="space-y-3">
                        <div>
                            <label
                                htmlFor="msg-subject"
                                className="block text-xs font-medium text-neutral-600 mb-1.5"
                            >
                                Subject
                            </label>
                            <input
                                id="msg-subject"
                                type="text"
                                placeholder="e.g. Important update about the event"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="msg-body"
                                className="block text-xs font-medium text-neutral-600 mb-1.5"
                            >
                                Message
                            </label>
                            <textarea
                                id="msg-body"
                                placeholder="Write your message here..."
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-100">
                        <p className="text-xs text-neutral-400">
                            Recipients: {attendees.length} attendee{attendees.length !== 1 ? 's' : ''}
                        </p>
                        <button
                            type="submit"
                            disabled={
                                sendingMessage ||
                                !subject.trim() ||
                                !body.trim() ||
                                attendees.length === 0
                            }
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={14} />
                            {sendingMessage ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
