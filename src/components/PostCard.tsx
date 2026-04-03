'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Flame, ThumbsUp, MessageCircle, Trash2, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { toggleReactionAction, addCommentAction, deletePostAction, deleteCommentAction } from '@/server/actions/post.actions';
import { toast } from 'sonner';
import type { CommunityPost } from '@/lib/repositories/post-repo';
import type { PostComment } from '@/lib/repositories/post-comment-repo';

// ─── Reaction config ─────────────────────────────────────────────────────────

const REACTIONS = [
    { type: 'like' as const, emoji: '👍', label: 'Like', icon: ThumbsUp },
    { type: 'fire' as const, emoji: '🔥', label: 'Fire', icon: Flame },
    { type: 'heart' as const, emoji: '❤️', label: 'Heart', icon: Heart },
    { type: 'clap' as const, emoji: '👏', label: 'Clap' },
] as const;

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function AuthorAvatar({ author }: { author: CommunityPost['author'] }) {
    if (!author) return null;
    const initials = author.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

    return author.avatar_url ? (
        <Image
            src={author.avatar_url}
            alt={author.name}
            width={36}
            height={36}
            className="h-full w-full rounded-full object-cover"
            unoptimized
        />
    ) : (
        <span className="text-sm font-bold text-primary-700">{initials}</span>
    );
}

// ─── Comment row ─────────────────────────────────────────────────────────────

function CommentRow({
    comment,
    currentUserId,
    onDelete,
}: {
    comment: PostComment;
    currentUserId?: number;
    onDelete: (id: number) => void;
}) {
    const [deleting, startDelete] = useTransition();
    const initials = (comment.author?.name || '?')
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

    return (
        <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100">
                {comment.author?.avatar_url ? (
                    <Image
                        src={comment.author.avatar_url}
                        alt={comment.author.name}
                        width={28}
                        height={28}
                        className="h-full w-full object-cover rounded-full"
                        unoptimized
                    />
                ) : (
                    <span className="text-[10px] font-bold text-primary-700">{initials}</span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="rounded-2xl bg-neutral-100 px-3 py-2">
                    <span className="text-xs font-semibold text-neutral-900">{comment.author?.name || 'Member'} </span>
                    <span className="text-xs text-neutral-700">{comment.content}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 px-1">
                    <span className="text-[10px] text-neutral-400">{timeAgo(comment.created_at)}</span>
                    {currentUserId === comment.user_id && (
                        <button
                            onClick={() => startDelete(async () => {
                                const res = await deleteCommentAction(comment.id);
                                if (res.success) onDelete(comment.id);
                                else toast.error(res.error);
                            })}
                            disabled={deleting}
                            className="text-[10px] text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                            delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── PostCard ────────────────────────────────────────────────────────────────

interface PostCardProps {
    post: CommunityPost & {
        reaction_count: number;
        comment_count: number;
        user_reacted: boolean;
        user_reaction_type?: string | null;
        initialComments?: PostComment[];
    };
    currentUserId?: number;
    communitySlug?: string;
}

export function PostCard({ post: initialPost, currentUserId, communitySlug }: PostCardProps) {
    const [post, setPost] = useState(initialPost);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<PostComment[]>(initialPost.initialComments ?? []);
    const [commentText, setCommentText] = useState('');
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleReact = (type: 'like' | 'fire' | 'heart' | 'clap') => {
        setShowReactionPicker(false);
        startTransition(async () => {
            const res = await toggleReactionAction(post.id, type);
            if (res.success) {
                const wasMyType = post.user_reaction_type === type;
                setPost((p) => ({
                    ...p,
                    user_reacted: !wasMyType,
                    user_reaction_type: wasMyType ? null : type,
                    reaction_count: wasMyType ? p.reaction_count - 1 : p.reaction_count + 1,
                }));
            } else {
                toast.error(res.error);
            }
        });
    };

    const handleComment = () => {
        if (!commentText.trim()) return;
        const text = commentText.trim();
        setCommentText('');
        startTransition(async () => {
            const res = await addCommentAction(post.id, text);
            if (res.success) {
                // Optimistic — add placeholder comment
                const optimistic: PostComment = {
                    id: res.data!.id,
                    post_id: post.id,
                    user_id: currentUserId!,
                    content: text,
                    is_deleted: false,
                    created_at: new Date().toISOString(),
                    author: undefined,
                };
                setComments((c) => [...c, optimistic]);
                setPost((p) => ({ ...p, comment_count: p.comment_count + 1 }));
            } else {
                toast.error(res.error);
            }
        });
    };

    const handleDeletePost = () => {
        startTransition(async () => {
            const res = await deletePostAction(post.id);
            if (!res.success) toast.error(res.error);
            // Page will revalidate via server action
        });
    };

    const handleDeleteComment = (id: number) => {
        setComments((c) => c.filter((cm) => cm.id !== id));
        setPost((p) => ({ ...p, comment_count: Math.max(0, p.comment_count - 1) }));
    };

    const currentReaction = REACTIONS.find((r) => r.type === post.user_reaction_type);
    const initials = (post.author?.name || '?')
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

    return (
        <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            {/* Header */}
            <div className="flex items-start gap-3 p-4 pb-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100">
                    <AuthorAvatar author={post.author} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-neutral-900">
                            {post.author?.name || 'Member'}
                        </span>
                        {post.author?.social_proof_type && (
                            <span className="text-[10px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                                ✓ verified
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-neutral-400">{timeAgo(post.created_at)}</p>
                </div>

                {/* Delete for author / admin */}
                {currentUserId === post.user_id && (
                    <button
                        onClick={handleDeletePost}
                        disabled={isPending}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-300 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Delete post"
                    >
                        <Trash2 size={13} />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
                <p className="text-sm leading-6 text-neutral-800 whitespace-pre-line">{post.content}</p>
            </div>

            {/* Image */}
            {post.image_url && (
                <div className="mx-4 mb-3 overflow-hidden rounded-xl">
                    <Image
                        src={post.image_url}
                        alt="Post image"
                        width={600}
                        height={400}
                        className="w-full object-cover"
                        unoptimized
                    />
                </div>
            )}

            {/* Action bar */}
            <div className="border-t border-neutral-100 px-4 py-2.5 flex items-center gap-1">
                {/* Reaction button */}
                <div className="relative">
                    <button
                        onClick={() => currentUserId
                            ? setShowReactionPicker((v) => !v)
                            : toast.error('Sign in to react')
                        }
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                            post.user_reacted
                                ? 'bg-primary-50 text-primary-700'
                                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                        }`}
                    >
                        <span>{currentReaction?.emoji ?? '👍'}</span>
                        <span>{post.reaction_count > 0 ? post.reaction_count : 'React'}</span>
                    </button>

                    {showReactionPicker && (
                        <div className="absolute bottom-full left-0 mb-2 flex gap-1 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl z-10">
                            {REACTIONS.map((r) => (
                                <button
                                    key={r.type}
                                    onClick={() => handleReact(r.type)}
                                    title={r.label}
                                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg transition-all hover:scale-125 ${
                                        post.user_reaction_type === r.type ? 'bg-primary-50 scale-110' : 'hover:bg-neutral-100'
                                    }`}
                                >
                                    {r.emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Comments toggle */}
                <button
                    onClick={() => setShowComments((v) => !v)}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                >
                    <MessageCircle size={14} />
                    <span>{post.comment_count > 0 ? post.comment_count : 'Comment'}</span>
                    {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
            </div>

            {/* Comments section */}
            {showComments && (
                <div className="border-t border-neutral-100 px-4 py-3 space-y-3">
                    {comments.length === 0 && (
                        <p className="text-xs text-neutral-400 text-center py-2">No comments yet. Be the first!</p>
                    )}
                    {comments.map((c) => (
                        <CommentRow
                            key={c.id}
                            comment={c}
                            currentUserId={currentUserId}
                            onDelete={handleDeleteComment}
                        />
                    ))}

                    {currentUserId ? (
                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleComment()}
                                placeholder="Write a comment…"
                                maxLength={2000}
                                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/15"
                            />
                            <button
                                onClick={handleComment}
                                disabled={!commentText.trim() || isPending}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 text-white transition hover:bg-primary-700 disabled:opacity-40"
                            >
                                <Send size={13} />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="block text-center text-xs font-medium text-primary-600 hover:text-primary-700 pt-1"
                        >
                            Sign in to comment →
                        </Link>
                    )}
                </div>
            )}
        </article>
    );
}
