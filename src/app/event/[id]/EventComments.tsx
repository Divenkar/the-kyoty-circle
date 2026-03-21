'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { addCommentAction, deleteCommentAction } from '@/server/actions/event-comments.actions';
import type { EventComment } from '@/lib/repositories/event-comments-repo';
import { MessageSquare, Trash2, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';

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

interface EventCommentsProps {
    eventId: number;
    initialComments: EventComment[];
    currentUserId: number | null;
    isMember: boolean;
}

export function EventComments({ eventId, initialComments, currentUserId, isMember }: EventCommentsProps) {
    const [comments, setComments] = useState<EventComment[]>(initialComments);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setSubmitting(true);
        const result = await addCommentAction(eventId, content);
        setSubmitting(false);
        if (result.success && result.data) {
            setComments(prev => [...prev, result.data!]);
            setContent('');
        } else {
            toast.error(result.error || 'Failed to post comment');
        }
    };

    const handleDelete = async (commentId: number) => {
        const result = await deleteCommentAction(commentId);
        if (result.success) {
            setComments(prev => prev.filter(c => c.id !== commentId));
            toast.success('Comment deleted');
        } else {
            toast.error(result.error || 'Failed to delete comment');
        }
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-5">
                <MessageSquare size={18} className="text-primary-600" />
                <h3 className="text-base font-semibold text-neutral-900">
                    Questions & Comments
                    {comments.length > 0 && (
                        <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
                            {comments.length}
                        </span>
                    )}
                </h3>
            </div>

            {/* Comment list */}
            {comments.length > 0 ? (
                <div className="space-y-4 mb-6">
                    {comments.map(comment => {
                        const user = comment.kyoty_users;
                        const initials = user?.name?.slice(0, 2).toUpperCase() || '?';
                        const isOwn = comment.user_id === currentUserId;

                        return (
                            <div key={comment.id} className="flex items-start gap-3">
                                <Link href={`/profile/${comment.user_id}`} className="shrink-0">
                                    {user?.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.name} className="h-8 w-8 rounded-full object-cover hover:opacity-80 transition" />
                                    ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 hover:opacity-80 transition">
                                            {initials}
                                        </div>
                                    )}
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <div className="rounded-2xl bg-neutral-50 border border-neutral-200 px-4 py-3">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <Link href={`/profile/${comment.user_id}`} className="text-xs font-semibold text-neutral-700 hover:text-primary-600 transition-colors">
                                                {user?.name || 'User'}
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-neutral-400">{timeAgo(comment.created_at)}</span>
                                                {isOwn && (
                                                    <button
                                                        onClick={() => handleDelete(comment.id)}
                                                        className="text-neutral-300 hover:text-red-500 transition-colors"
                                                        title="Delete comment"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-neutral-700 leading-relaxed">{comment.content}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="mb-6 rounded-xl border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-400">
                    No comments yet. Be the first to ask a question!
                </div>
            )}

            {/* Add comment */}
            {!currentUserId ? (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-center text-sm text-neutral-500">
                    <Link href="/login" className="font-medium text-primary-600 hover:underline">Sign in</Link> to leave a comment.
                </div>
            ) : !isMember ? (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-center text-sm text-neutral-500">
                    Join the community to leave a comment.
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex items-end gap-3">
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Ask a question or leave a comment…"
                        rows={2}
                        maxLength={1000}
                        className="flex-1 resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                    />
                    <button
                        type="submit"
                        disabled={submitting || !content.trim()}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </form>
            )}
        </div>
    );
}
