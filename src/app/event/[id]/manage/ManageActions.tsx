'use client';

import React from 'react';
import { removeAttendeeAction, sendMessageAction, checkInAction } from '@/server/actions/organizer.actions';
import { Users, Mail, Download, UserX, CheckCircle, Clock } from 'lucide-react';

interface ManageActionsProps {
    eventId: number;
    attendees: any[];
    waitlisted: any[];
}

export function ManageActions({ eventId, attendees: initialAttendees, waitlisted: initialWaitlisted }: ManageActionsProps) {
    const [tab, setTab] = React.useState<'attendees' | 'waitlist' | 'message'>('attendees');
    const [attendees, setAttendees] = React.useState<any[]>(initialAttendees);
    const [waitlisted, setWaitlisted] = React.useState<any[]>(initialWaitlisted);
    const [loading, setLoading] = React.useState<number | null>(null);
    const [subject, setSubject] = React.useState('');
    const [body, setBody] = React.useState('');
    const [feedback, setFeedback] = React.useState('');

    const handleRemove = async (participantId: number) => {
        setLoading(participantId);
        const result = await removeAttendeeAction(participantId, eventId);
        if (result.success) {
            setAttendees(prev => prev.filter(a => a.id !== participantId));
            setWaitlisted(prev => prev.filter(w => w.id !== participantId));
            setFeedback('Attendee removed');
            setTimeout(() => setFeedback(''), 2000);
        }
        setLoading(null);
    };

    const handleCheckIn = async (userId: number) => {
        setLoading(userId);
        const result = await checkInAction(eventId, userId);
        if (result.success) {
            // Optimistically mark as checked in without reload
            setAttendees(prev => prev.map(a =>
                a.user_id === userId
                    ? { ...a, checked_in_at: new Date().toISOString() }
                    : a
            ));
            setFeedback('Checked in!');
            setTimeout(() => setFeedback(''), 2000);
        }
        setLoading(null);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !body.trim()) return;
        setLoading(-1);
        const result = await sendMessageAction(eventId, subject, body);
        if (result.success) {
            setFeedback('Message sent to all attendees!');
            setSubject('');
            setBody('');
        } else {
            setFeedback(result.error || 'Failed to send');
        }
        setLoading(null);
        setTimeout(() => setFeedback(''), 3000);
    };

    const exportCSV = () => {
        const headers = ['Name', 'Email', 'Status', 'Joined At'];
        const rows = attendees.map((a: any) => [
            a.kyoty_users?.name || 'N/A',
            a.kyoty_users?.email || 'N/A',
            a.status,
            new Date(a.joined_at).toLocaleString(),
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `event-${eventId}-attendees.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            {/* Tabs */}
            <div className="flex gap-1 bg-neutral-100 rounded-xl p-1 mb-6">
                {[
                    { key: 'attendees', label: `Attendees (${attendees.length})`, icon: Users },
                    { key: 'waitlist', label: `Waitlist (${waitlisted.length})`, icon: Clock },
                    { key: 'message', label: 'Message All', icon: Mail },
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key as any)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${tab === key ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {feedback && (
                <div className="mb-4 p-3 text-sm font-medium text-green-700 bg-green-50 rounded-xl border border-green-200">
                    {feedback}
                </div>
            )}

            {/* Attendees Tab */}
            {tab === 'attendees' && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-neutral-700">Registered Attendees</h3>
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                            <Download size={12} />
                            Export CSV
                        </button>
                    </div>
                    {attendees.length > 0 ? (
                        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
                            {attendees.map((a: any) => (
                                <div key={a.id} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                                            {(a.kyoty_users?.name || 'U')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-neutral-900">{a.kyoty_users?.name || 'Unknown'}</div>
                                            <div className="text-xs text-neutral-500">{a.kyoty_users?.email || ''}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleCheckIn(a.user_id)}
                                            disabled={loading === a.user_id || !!a.checked_in_at}
                                            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${a.checked_in_at
                                                    ? 'bg-green-50 text-green-700 cursor-default'
                                                    : 'text-green-600 bg-green-50 hover:bg-green-100'
                                                }`}
                                        >
                                            <CheckCircle size={12} />
                                            {a.checked_in_at ? 'Checked In' : 'Check In'}
                                        </button>
                                        <button
                                            onClick={() => handleRemove(a.id)}
                                            disabled={loading === a.id}
                                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <UserX size={12} />
                                            {loading === a.id ? '...' : 'Remove'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white border border-neutral-200 rounded-xl">
                            <Users size={28} className="text-neutral-300 mx-auto mb-3" />
                            <p className="text-neutral-500 text-sm">No attendees yet</p>
                        </div>
                    )}
                </div>
            )}

            {/* Waitlist Tab */}
            {tab === 'waitlist' && (
                <div>
                    <h3 className="text-sm font-semibold text-neutral-700 mb-4">Waitlisted Users</h3>
                    {waitlisted.length > 0 ? (
                        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
                            {waitlisted.map((w: any, idx: number) => (
                                <div key={w.id} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-neutral-900">{w.kyoty_users?.name || 'Unknown'}</div>
                                            <div className="text-xs text-neutral-500">{w.kyoty_users?.email || ''}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(w.id)}
                                        disabled={loading === w.id}
                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        <UserX size={12} />
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white border border-neutral-200 rounded-xl">
                            <Clock size={28} className="text-neutral-300 mx-auto mb-3" />
                            <p className="text-neutral-500 text-sm">No one on the waitlist</p>
                        </div>
                    )}
                </div>
            )}

            {/* Message Tab */}
            {tab === 'message' && (
                <form onSubmit={handleSendMessage} className="bg-white rounded-xl border border-neutral-200 p-6">
                    <h3 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                        <Mail size={14} />
                        Send Message to All Attendees
                    </h3>
                    <input
                        type="text"
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all mb-3"
                    />
                    <textarea
                        placeholder="Your message..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all resize-none mb-4"
                    />
                    <button
                        type="submit"
                        disabled={loading === -1 || !subject.trim() || !body.trim()}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        {loading === -1 ? 'Sending...' : `Send to ${attendees.length} Attendees`}
                    </button>
                </form>
            )}
        </div>
    );
}
