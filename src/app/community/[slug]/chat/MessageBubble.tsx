'use client';

import { useState } from 'react';
import type { CommunityMessage } from '@/types';
import { Trash2, Edit2, CornerUpLeft, SmilePlus, Check } from 'lucide-react';
import { deleteMessageAction, editMessageAction, addReactionAction, removeReactionAction } from '@/server/actions/community-chat.actions';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

interface MessageBubbleProps {
    message: CommunityMessage;
    currentUserId: number;
    communityId: number;
    canModerate: boolean;
    onReply: (msg: CommunityMessage) => void;
    onOptimisticDelete: (id: number) => void;
}

export function MessageBubble({
    message,
    currentUserId,
    communityId,
    canModerate,
    onReply,
    onOptimisticDelete,
}: MessageBubbleProps) {
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(message.content);
    const [showEmoji, setShowEmoji] = useState(false);
    const [saving, setSaving] = useState(false);

    const isOwn = message.user_id === currentUserId;
    const canDelete = isOwn || canModerate;
    const canEdit = isOwn;

    const handleDelete = async () => {
        onOptimisticDelete(message.id);
        await deleteMessageAction(communityId, message.id);
    };

    const handleEdit = async () => {
        if (!editText.trim() || editText === message.content) { setEditing(false); return; }
        setSaving(true);
        await editMessageAction(message.id, editText);
        setSaving(false);
        setEditing(false);
    };

    const handleReaction = async (emoji: string) => {
        setShowEmoji(false);
        const existing = message.reactions?.find(r => r.user_id === currentUserId && r.emoji === emoji);
        if (existing) {
            await removeReactionAction(communityId, message.id, emoji);
        } else {
            await addReactionAction(communityId, message.id, emoji);
        }
    };

    // Group reactions by emoji
    const reactionGroups = (message.reactions || []).reduce<Record<string, number>>((acc, r) => {
        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
        return acc;
    }, {});

    if (message.is_deleted) {
        return (
            <div className="flex items-center gap-2 py-1 px-3">
                <span className="text-xs italic text-neutral-400">[message deleted]</span>
            </div>
        );
    }

    const avatar = message.kyoty_users;
    const initials = avatar?.name?.slice(0, 2).toUpperCase() || '??';

    return (
        <div className={`group flex gap-2.5 px-4 py-1.5 hover:bg-neutral-50 ${isOwn ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className="shrink-0 mt-0.5">
                {avatar?.avatar_url ? (
                    <img src={avatar.avatar_url} alt={avatar.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                        {initials}
                    </div>
                )}
            </div>

            <div className={`flex max-w-[75%] flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                {/* Name + time */}
                <div className={`mb-0.5 flex items-baseline gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs font-semibold text-neutral-700">{avatar?.name || 'Unknown'}</span>
                    <span className="text-[10px] text-neutral-400">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.edited_at && <span className="text-[10px] text-neutral-400 italic">(edited)</span>}
                </div>

                {/* Reply preview */}
                {message.reply_to && (
                    <div className="mb-1 rounded-lg border-l-2 border-primary-400 bg-primary-50 px-2 py-1">
                        <p className="text-[11px] text-primary-700 line-clamp-1">{message.reply_to.content}</p>
                    </div>
                )}

                {/* Bubble */}
                {editing ? (
                    <div className="flex w-full gap-2">
                        <input
                            autoFocus
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit(); } if (e.key === 'Escape') setEditing(false); }}
                            className="flex-1 rounded-xl border border-primary-300 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-400"
                        />
                        <button onClick={handleEdit} disabled={saving} className="rounded-lg bg-primary-600 px-2 py-1 text-white disabled:opacity-50">
                            <Check size={14} />
                        </button>
                    </div>
                ) : (
                    <div className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${isOwn ? 'bg-primary-600 text-white' : 'bg-white text-neutral-800 shadow-sm border border-neutral-200'}`}>
                        {message.content}
                    </div>
                )}

                {/* Reactions */}
                {Object.keys(reactionGroups).length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(reactionGroups).map(([emoji, count]) => {
                            const myReaction = message.reactions?.some(r => r.user_id === currentUserId && r.emoji === emoji);
                            return (
                                <button
                                    key={emoji}
                                    onClick={() => handleReaction(emoji)}
                                    className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition ${myReaction ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'}`}
                                >
                                    {emoji} <span>{count}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Actions (show on hover) */}
            <div className={`flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <div className="relative">
                    <button onClick={() => setShowEmoji(!showEmoji)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
                        <SmilePlus size={13} />
                    </button>
                    {showEmoji && (
                        <div className={`absolute bottom-8 z-10 flex gap-1 rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg ${isOwn ? 'right-0' : 'left-0'}`}>
                            {QUICK_EMOJIS.map(e => (
                                <button key={e} onClick={() => handleReaction(e)} className="rounded-lg p-1 text-lg hover:bg-neutral-100 transition">
                                    {e}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button onClick={() => onReply(message)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
                    <CornerUpLeft size={13} />
                </button>
                {canEdit && (
                    <button onClick={() => { setEditing(true); setEditText(message.content); }} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
                        <Edit2 size={13} />
                    </button>
                )}
                {canDelete && (
                    <button onClick={handleDelete} className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500">
                        <Trash2 size={13} />
                    </button>
                )}
            </div>
        </div>
    );
}
