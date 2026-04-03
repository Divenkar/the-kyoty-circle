'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { CommunityRolesRepository } from '@/lib/repositories/community-roles-repo';
import { CommunityMediaRepository } from '@/lib/repositories/community-media-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { InviteTokenRepository, type InviteToken } from '@/lib/repositories/invite-token-repo';
import { CommunityService } from '@/lib/services/community-service';
import { createClient } from '@/utils/supabase/server';
import type { ActionResponse, CommunityMedia } from '@/types';

/** Check if user can manage this community (owner, admin, platform admin) */
async function canManage(communityId: number): Promise<{ ok: boolean; userId?: number; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Authentication required' };

    const isPlatformAdmin = user.role === 'admin' || user.role === 'kyoty_admin';
    if (isPlatformAdmin) return { ok: true, userId: user.id };

    const community = await CommunityRepository.findById(communityId);
    if (!community) return { ok: false, error: 'Community not found' };
    if (community.organizer_id === user.id) return { ok: true, userId: user.id };

    const role = await CommunityRolesRepository.getUserRole(communityId, user.id);
    if (role === 'owner' || role === 'admin') return { ok: true, userId: user.id };

    return { ok: false, error: 'You do not have permission to manage this community' };
}

export async function updateCommunitySettingsAction(
    communityId: number,
    data: { name?: string; description?: string; cover_image_url?: string | null }
): Promise<ActionResponse> {
    try {
        const check = await canManage(communityId);
        if (!check.ok) return { success: false, error: check.error };

        const update: Record<string, unknown> = {};
        if (data.name !== undefined) update.name = data.name;
        if (data.description !== undefined) update.description = data.description;
        if (data.cover_image_url !== undefined) update.cover_image_url = data.cover_image_url;

        await CommunityRepository.update(communityId, update as Record<string, string>);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update community' };
    }
}

export async function removeMemberAction(
    communityId: number,
    memberId: number
): Promise<ActionResponse> {
    try {
        const check = await canManage(communityId);
        if (!check.ok) return { success: false, error: check.error };

        await CommunityMemberRepository.reject(memberId);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to remove member' };
    }
}

export async function approveMemberAction(
    communityId: number,
    memberId: number
): Promise<ActionResponse> {
    try {
        const check = await canManage(communityId);
        if (!check.ok) return { success: false, error: check.error };

        await CommunityService.approveMember(memberId, check.userId!);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to approve member' };
    }
}

export async function rejectMemberAction(
    communityId: number,
    memberId: number
): Promise<ActionResponse> {
    try {
        const check = await canManage(communityId);
        if (!check.ok) return { success: false, error: check.error };

        await CommunityService.rejectMember(memberId, check.userId!);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to reject member' };
    }
}

export async function bulkApproveMembersAction(
    communityId: number,
    memberIds: number[]
): Promise<ActionResponse<{ count: number }>> {
    try {
        const check = await canManage(communityId);
        if (!check.ok) return { success: false, error: check.error };
        if (!memberIds.length) return { success: false, error: 'No members selected' };

        await CommunityMemberRepository.bulkApprove(memberIds, check.userId!);
        return { success: true, data: { count: memberIds.length } };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to approve members' };
    }
}

export async function uploadCoverImageAction(
    formData: FormData
): Promise<ActionResponse<string>> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const file = formData.get('file') as File;
        if (!file) return { success: false, error: 'No file provided' };

        const maxSize = 5 * 1024 * 1024; // 5 MB
        if (file.size > maxSize) return { success: false, error: 'File too large (max 5 MB)' };

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: 'Only JPEG, PNG, and WebP are allowed' };
        }

        const ext = file.name.split('.').pop();
        const fileName = `covers/${user.id}-${Date.now()}.${ext}`;

        const supabase = await createClient();
        const { data: upload, error: uploadError } = await supabase.storage
            .from('community-media')
            .upload(fileName, file, { contentType: file.type, upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = supabase.storage
            .from('community-media')
            .getPublicUrl(upload.path);

        return { success: true, data: urlData.publicUrl };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Upload failed' };
    }
}

export async function uploadMediaAction(
    communityId: number,
    formData: FormData
): Promise<ActionResponse<CommunityMedia>> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        // Any member can upload media
        const isMember = await CommunityMemberRepository.isMember(communityId, user.id);
        const community = await CommunityRepository.findById(communityId);
        const isOrganizer = community?.organizer_id === user.id;
        const isPlatformAdmin = user.role === 'admin' || user.role === 'kyoty_admin';

        if (!isMember && !isOrganizer && !isPlatformAdmin) {
            return { success: false, error: 'You must be a member to upload media' };
        }

        const file = formData.get('file') as File;
        if (!file) return { success: false, error: 'No file provided' };

        const maxSize = 10 * 1024 * 1024; // 10 MB
        if (file.size > maxSize) return { success: false, error: 'File too large (max 10 MB)' };

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: 'Only JPEG, PNG, WebP, and GIF are allowed' };
        }

        const ext = file.name.split('.').pop();
        const fileName = `community-${communityId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const supabase = await createClient();
        const { data: upload, error: uploadError } = await supabase.storage
            .from('community-media')
            .upload(fileName, file, { contentType: file.type, upsert: false });

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = supabase.storage.from('community-media').getPublicUrl(upload.path);

        const caption = formData.get('caption') as string | null;
        const media = await CommunityMediaRepository.create({
            community_id: communityId,
            uploaded_by: user.id,
            url: urlData.publicUrl,
            caption: caption || undefined,
        });

        return { success: true, data: media };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Upload failed' };
    }
}

export async function generateInviteTokenAction(
    communityId: number
): Promise<ActionResponse<InviteToken>> {
    try {
        const check = await canManage(communityId);
        if (!check.ok) return { success: false, error: check.error };

        const token = await InviteTokenRepository.create(communityId, check.userId!);
        return { success: true, data: token };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to generate invite link' };
    }
}

export async function listInviteTokensAction(
    communityId: number
): Promise<ActionResponse<InviteToken[]>> {
    try {
        const check = await canManage(communityId);
        if (!check.ok) return { success: false, error: check.error };

        const tokens = await InviteTokenRepository.listByCommunity(communityId);
        return { success: true, data: tokens };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch invite links' };
    }
}

export async function deleteInviteTokenAction(
    communityId: number,
    tokenId: number
): Promise<ActionResponse> {
    try {
        const check = await canManage(communityId);
        if (!check.ok) return { success: false, error: check.error };

        await InviteTokenRepository.delete(tokenId);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to revoke invite link' };
    }
}

export async function deleteMediaAction(
    communityId: number,
    mediaId: number
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const media = await CommunityMediaRepository.findById(mediaId);
        if (!media) return { success: false, error: 'Media not found' };

        // Uploader can delete their own; managers can delete any
        if (media.uploaded_by !== user.id) {
            const check = await canManage(communityId);
            if (!check.ok) return { success: false, error: 'You can only delete your own uploads' };
        }

        // Delete from storage
        const supabase = await createClient();
        const path = media.url.split('/community-media/')[1];
        if (path) {
            await supabase.storage.from('community-media').remove([path]);
        }

        await CommunityMediaRepository.delete(mediaId);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to delete media' };
    }
}
