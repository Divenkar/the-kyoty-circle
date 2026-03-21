'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { CommunityMessagesRepository } from '@/lib/repositories/community-messages-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { CommunityRolesRepository } from '@/lib/repositories/community-roles-repo';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import type { ActionResponse, CommunityMessage } from '@/types';

/** Check if a user is allowed to post in a community chat */
async function canChat(communityId: number): Promise<{ ok: boolean; userId?: number; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Authentication required' };

    const isPlatformAdmin = user.role === 'admin' || user.role === 'kyoty_admin';
    if (isPlatformAdmin) return { ok: true, userId: user.id };

    const isMember = await CommunityMemberRepository.isMember(communityId, user.id);
    if (isMember) return { ok: true, userId: user.id };

    const community = await CommunityRepository.findById(communityId);
    if (community?.organizer_id === user.id) return { ok: true, userId: user.id };

    return { ok: false, error: 'You must be a member to chat' };
}

/** Check if a user can moderate messages (delete/edit others) */
async function canModerate(communityId: number): Promise<{ ok: boolean; userId?: number; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Authentication required' };

    const isPlatformAdmin = user.role === 'admin' || user.role === 'kyoty_admin';
    if (isPlatformAdmin) return { ok: true, userId: user.id };

    const community = await CommunityRepository.findById(communityId);
    if (community?.organizer_id === user.id) return { ok: true, userId: user.id };

    const role = await CommunityRolesRepository.getUserRole(communityId, user.id);
    if (role === 'owner' || role === 'admin' || role === 'moderator') return { ok: true, userId: user.id };

    return { ok: false, error: 'Insufficient permissions' };
}

export async function sendMessageAction(
    communityId: number,
    content: string,
    replyToId?: number
): Promise<ActionResponse<CommunityMessage>> {
    try {
        if (!content.trim()) return { success: false, error: 'Message cannot be empty' };
        if (content.length > 4000) return { success: false, error: 'Message too long (max 4000 chars)' };

        const check = await canChat(communityId);
        if (!check.ok) return { success: false, error: check.error };

        const msg = await CommunityMessagesRepository.create({
            community_id: communityId,
            user_id: check.userId!,
            content: content.trim(),
            type: 'text',
            reply_to_id: replyToId,
        });
        return { success: true, data: msg };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to send message' };
    }
}

export async function deleteMessageAction(
    communityId: number,
    messageId: number
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const message = await CommunityMessagesRepository.findById(messageId);
        if (!message) return { success: false, error: 'Message not found' };

        // Owner of message can always delete their own
        if (message.user_id === user.id) {
            await CommunityMessagesRepository.softDelete(messageId);
            return { success: true };
        }

        // Moderators can delete others' messages
        const modCheck = await canModerate(communityId);
        if (!modCheck.ok) return { success: false, error: 'You can only delete your own messages' };

        await CommunityMessagesRepository.softDelete(messageId);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to delete message' };
    }
}

export async function editMessageAction(
    messageId: number,
    content: string
): Promise<ActionResponse> {
    try {
        if (!content.trim()) return { success: false, error: 'Message cannot be empty' };
        if (content.length > 4000) return { success: false, error: 'Message too long' };

        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const message = await CommunityMessagesRepository.findById(messageId);
        if (!message) return { success: false, error: 'Message not found' };
        if (message.user_id !== user.id) return { success: false, error: 'You can only edit your own messages' };

        await CommunityMessagesRepository.edit(messageId, content.trim());
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to edit message' };
    }
}

export async function addReactionAction(
    communityId: number,
    messageId: number,
    emoji: string
): Promise<ActionResponse> {
    try {
        const check = await canChat(communityId);
        if (!check.ok) return { success: false, error: check.error };

        await CommunityMessagesRepository.addReaction(messageId, check.userId!, emoji);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to add reaction' };
    }
}

export async function removeReactionAction(
    communityId: number,
    messageId: number,
    emoji: string
): Promise<ActionResponse> {
    try {
        const check = await canChat(communityId);
        if (!check.ok) return { success: false, error: check.error };

        await CommunityMessagesRepository.removeReaction(messageId, check.userId!, emoji);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to remove reaction' };
    }
}

export async function getMessagesAction(
    communityId: number,
    before?: string
): Promise<ActionResponse<CommunityMessage[]>> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const messages = await CommunityMessagesRepository.findByCommunity(communityId, 50, before);

        // Attach reactions
        const ids = messages.map(m => m.id);
        const reactions = await CommunityMessagesRepository.getReactionsForMessages(ids);
        const reactionMap = new Map<number, typeof reactions>();
        for (const r of reactions) {
            if (!reactionMap.has(r.message_id)) reactionMap.set(r.message_id, []);
            reactionMap.get(r.message_id)!.push(r);
        }

        const messagesWithReactions = messages.map(m => ({
            ...m,
            reactions: reactionMap.get(m.id) || [],
        }));

        return { success: true, data: messagesWithReactions };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch messages' };
    }
}
