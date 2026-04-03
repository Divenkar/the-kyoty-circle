'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { PostRepository } from '@/lib/repositories/post-repo';
import { PostCommentRepository } from '@/lib/repositories/post-comment-repo';
import { PostReactionRepository, type ReactionType } from '@/lib/repositories/post-reaction-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { revalidatePath } from 'next/cache';
import type { ActionResponse } from '@/types';

// ─── Auth helpers ────────────────────────────────────────────────────────────

async function canPostInCommunity(
    communityId: number,
): Promise<{ ok: boolean; userId?: number; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Authentication required' };

    const isPlatformAdmin = user.role === 'admin' || user.role === 'kyoty_admin';
    if (isPlatformAdmin) return { ok: true, userId: user.id };

    const community = await CommunityRepository.findById(communityId);
    if (!community) return { ok: false, error: 'Community not found' };
    if (community.organizer_id === user.id) return { ok: true, userId: user.id };

    const isMember = await CommunityMemberRepository.isMember(communityId, user.id);
    if (isMember) return { ok: true, userId: user.id };

    return { ok: false, error: 'You must be a member to post' };
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export async function createPostAction(
    communityId: number,
    content: string,
    imageUrl?: string | null,
): Promise<ActionResponse<{ id: number }>> {
    try {
        const trimmed = content.trim();
        if (!trimmed) return { success: false, error: 'Post content cannot be empty' };
        if (trimmed.length > 5000) return { success: false, error: 'Post is too long (max 5000 chars)' };

        const check = await canPostInCommunity(communityId);
        if (!check.ok) return { success: false, error: check.error };

        const post = await PostRepository.create({
            community_id: communityId,
            user_id: check.userId!,
            content: trimmed,
            image_url: imageUrl ?? null,
        });

        revalidatePath(`/community/[slug]/feed`, 'page');
        return { success: true, data: { id: post.id } };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to create post' };
    }
}

export async function deletePostAction(postId: number): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const post = await PostRepository.findById(postId);
        if (!post) return { success: false, error: 'Post not found' };

        const isPlatformAdmin = user.role === 'admin' || user.role === 'kyoty_admin';
        const isAuthor = post.user_id === user.id;
        const community = await CommunityRepository.findById(post.community_id);
        const isOrganizer = community?.organizer_id === user.id;

        if (!isAuthor && !isPlatformAdmin && !isOrganizer) {
            return { success: false, error: 'You can only delete your own posts' };
        }

        await PostRepository.softDelete(postId);
        revalidatePath(`/community/[slug]/feed`, 'page');
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to delete post' };
    }
}

// ─── Reactions ───────────────────────────────────────────────────────────────

export async function toggleReactionAction(
    postId: number,
    type: ReactionType,
): Promise<ActionResponse<{ action: 'added' | 'removed' }>> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const post = await PostRepository.findById(postId);
        if (!post) return { success: false, error: 'Post not found' };

        const check = await canPostInCommunity(post.community_id);
        if (!check.ok) return { success: false, error: check.error };

        const action = await PostReactionRepository.toggle(postId, user.id, type);
        return { success: true, data: { action } };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to react' };
    }
}

// ─── Comments ────────────────────────────────────────────────────────────────

export async function addCommentAction(
    postId: number,
    content: string,
): Promise<ActionResponse<{ id: number }>> {
    try {
        const trimmed = content.trim();
        if (!trimmed) return { success: false, error: 'Comment cannot be empty' };
        if (trimmed.length > 2000) return { success: false, error: 'Comment too long (max 2000 chars)' };

        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const post = await PostRepository.findById(postId);
        if (!post) return { success: false, error: 'Post not found' };

        const check = await canPostInCommunity(post.community_id);
        if (!check.ok) return { success: false, error: check.error };

        const comment = await PostCommentRepository.create({
            post_id: postId,
            user_id: user.id,
            content: trimmed,
        });

        revalidatePath(`/community/[slug]/feed`, 'page');
        return { success: true, data: { id: comment.id } };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to add comment' };
    }
}

export async function deleteCommentAction(commentId: number): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const comment = await PostCommentRepository.findById(commentId);
        if (!comment) return { success: false, error: 'Comment not found' };

        const isPlatformAdmin = user.role === 'admin' || user.role === 'kyoty_admin';
        if (comment.user_id !== user.id && !isPlatformAdmin) {
            return { success: false, error: 'You can only delete your own comments' };
        }

        await PostCommentRepository.softDelete(commentId);
        revalidatePath(`/community/[slug]/feed`, 'page');
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to delete comment' };
    }
}
