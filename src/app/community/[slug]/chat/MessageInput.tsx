'use client';

import { useState, useRef } from 'react';
import { Send, X, CornerUpLeft } from 'lucide-react';
import type { CommunityMessage } from '@/types';
import { sendMessageAction } from '@/server/actions/community-chat.actions';

interface MessageInputProps {
    communityId: number;
    replyTo: CommunityMessage | null;
    onCancelReply: () => void;
    onSent: (msg: CommunityMessage) => void;
}

export function MessageInput({ communityId, replyTo, onCancelReply, onSent }: MessageInputProps) {
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const send = async () => {
        if (!text.trim() || sending) return;
        setSending(true);
        const result = await sendMessageAction(communityId, text.trim(), replyTo?.id);
        setSending(false);
        if (result.success && result.data) {
            setText('');
            onCancelReply();
            onSent(result.data);
            textareaRef.current?.focus();
        }
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className="border-t border-neutral-200 bg-white px-4 py-3">
            {/* Reply preview */}
            {replyTo && (
                <div className="mb-2 flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-1.5">
                    <CornerUpLeft size={13} className="shrink-0 text-primary-500" />
                    <p className="flex-1 text-xs text-primary-700 line-clamp-1">
                        {replyTo.kyoty_users?.name}: {replyTo.content}
                    </p>
                    <button onClick={onCancelReply} className="text-neutral-400 hover:text-neutral-600">
                        <X size={13} />
                    </button>
                </div>
            )}

            <div className="flex items-end gap-2">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Send a message… (Enter to send, Shift+Enter for newline)"
                    rows={1}
                    className="flex-1 resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
                    style={{ maxHeight: 120 }}
                    onInput={e => {
                        const el = e.currentTarget;
                        el.style.height = 'auto';
                        el.style.height = `${el.scrollHeight}px`;
                    }}
                />
                <button
                    onClick={send}
                    disabled={!text.trim() || sending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white transition hover:bg-primary-700 disabled:opacity-40"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
}
