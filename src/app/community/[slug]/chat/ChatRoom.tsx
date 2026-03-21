'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { CommunityMessage } from '@/types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { getMessagesAction } from '@/server/actions/community-chat.actions';
import { Loader2 } from 'lucide-react';

interface ChatRoomProps {
    communityId: number;
    communitySlug: string;
    currentUserId: number;
    canModerate: boolean;
    initialMessages: CommunityMessage[];
}

export function ChatRoom({
    communityId,
    currentUserId,
    canModerate,
    initialMessages,
}: ChatRoomProps) {
    const [messages, setMessages] = useState<CommunityMessage[]>(initialMessages);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(initialMessages.length === 50);
    const [replyTo, setReplyTo] = useState<CommunityMessage | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const topRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Scroll to bottom on mount & new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    // Supabase Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel(`community-chat-${communityId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'community_messages',
                    filter: `community_id=eq.${communityId}`,
                },
                async (payload) => {
                    const newMsg = payload.new as CommunityMessage;
                    // Fetch full message with user join
                    const result = await getMessagesAction(communityId);
                    if (result.success && result.data) {
                        const found = result.data.find(m => m.id === newMsg.id);
                        if (found) {
                            setMessages(prev => {
                                if (prev.find(m => m.id === found.id)) return prev;
                                return [...prev, found];
                            });
                        }
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'community_messages',
                    filter: `community_id=eq.${communityId}`,
                },
                (payload) => {
                    const updated = payload.new as CommunityMessage;
                    setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m));
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [communityId]);

    const loadOlder = useCallback(async () => {
        if (loadingOlder || !hasMore || messages.length === 0) return;
        setLoadingOlder(true);
        const oldest = messages[0]?.created_at;
        const result = await getMessagesAction(communityId, oldest);
        setLoadingOlder(false);
        if (result.success && result.data) {
            setHasMore(result.data.length === 50);
            setMessages(prev => [...result.data!, ...prev]);
        }
    }, [communityId, loadingOlder, hasMore, messages]);

    const handleOptimisticDelete = (id: number) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, is_deleted: true } : m));
    };

    const handleSent = (msg: CommunityMessage) => {
        setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg];
        });
    };

    return (
        <div className="flex h-full flex-col">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto py-2" onScroll={e => {
                if ((e.currentTarget as HTMLDivElement).scrollTop < 80) loadOlder();
            }}>
                {loadingOlder && (
                    <div className="flex justify-center py-2">
                        <Loader2 size={16} className="animate-spin text-neutral-400" />
                    </div>
                )}
                <div ref={topRef} />

                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-sm font-medium text-neutral-500">No messages yet</p>
                        <p className="mt-1 text-xs text-neutral-400">Be the first to say something!</p>
                    </div>
                )}

                {messages.map(msg => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        currentUserId={currentUserId}
                        communityId={communityId}
                        canModerate={canModerate}
                        onReply={setReplyTo}
                        onOptimisticDelete={handleOptimisticDelete}
                    />
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <MessageInput
                communityId={communityId}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
                onSent={handleSent}
            />
        </div>
    );
}
