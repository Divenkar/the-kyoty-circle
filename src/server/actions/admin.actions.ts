'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { CommunityService } from '@/lib/services/community-service';
import { EventService } from '@/lib/services/event-service';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { EventRepository } from '@/lib/repositories/event-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { CommunityMediaRepository } from '@/lib/repositories/community-media-repo';
import { AdminLogRepository } from '@/lib/repositories/admin-log-repo';
import { createClient } from '@/utils/supabase/server';
import type { ActionResponse } from '@/types';
import { revalidatePath } from 'next/cache';

// ─── Auth helpers ─────────────────────────────────────────────────────────────

type UserRole = string;

/** Returns true when the user holds any platform-level admin role. */
function isPlatformAdmin(role: UserRole): boolean {
    return role === 'kyoty_admin' || role === 'admin';
}

/** Returns true when the user can manage community members (own platform admin or community admin). */
function canManageMembers(role: UserRole): boolean {
    return isPlatformAdmin(role) || role === 'community_admin';
}

export async function approveCommunityAction(communityId: number): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user || !isPlatformAdmin(user.role)) {
            return { success: false, error: 'Admin access required' };
        }
        await CommunityService.approveCommunity(communityId, user.id);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to approve community' };
    }
}

export async function rejectCommunityAction(communityId: number): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user || !isPlatformAdmin(user.role)) {
            return { success: false, error: 'Admin access required' };
        }
        await CommunityService.rejectCommunity(communityId, user.id);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to reject community' };
    }
}

export async function approveEventAction(eventId: number): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user || !isPlatformAdmin(user.role)) {
            return { success: false, error: 'Admin access required' };
        }
        await EventService.approveEvent(eventId, user.id);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to approve event' };
    }
}

export async function rejectEventAction(eventId: number): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user || !isPlatformAdmin(user.role)) {
            return { success: false, error: 'Admin access required' };
        }
        await EventService.rejectEvent(eventId, user.id);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to reject event' };
    }
}

export async function approveMemberAction(memberId: number): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user || !canManageMembers(user.role)) {
            return { success: false, error: 'Admin access required' };
        }

        // Community admins may only act on their own communities.
        if (!isPlatformAdmin(user.role)) {
            const supabase = await createClient();
            const { data: member } = await supabase
                .from('community_members')
                .select('community_id')
                .eq('id', memberId)
                .single();

            if (!member) return { success: false, error: 'Member record not found' };

            const { data: community } = await supabase
                .from('communities')
                .select('organizer_id')
                .eq('id', member.community_id)
                .single();

            if (community?.organizer_id !== user.id) {
                return { success: false, error: 'You can only manage members of your own communities' };
            }
        }

        await CommunityService.approveMember(memberId, user.id);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to approve member' };
    }
}

export async function rejectMemberAction(memberId: number): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user || !canManageMembers(user.role)) {
            return { success: false, error: 'Admin access required' };
        }

        // Community admins may only act on their own communities.
        if (!isPlatformAdmin(user.role)) {
            const supabase = await createClient();
            const { data: member } = await supabase
                .from('community_members')
                .select('community_id')
                .eq('id', memberId)
                .single();

            if (!member) return { success: false, error: 'Member record not found' };

            const { data: community } = await supabase
                .from('communities')
                .select('organizer_id')
                .eq('id', member.community_id)
                .single();

            if (community?.organizer_id !== user.id) {
                return { success: false, error: 'You can only manage members of your own communities' };
            }
        }

        await CommunityService.rejectMember(memberId, user.id);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to reject member' };
    }
}

export async function getPendingCommunitiesAction() {
    try {
        const user = await getCurrentUser();
        if (!user || !isPlatformAdmin(user.role)) {
            return { success: false, error: 'Admin access required' };
        }
        const data = await CommunityRepository.findPending();
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch' };
    }
}

export async function getPendingEventsAction() {
    try {
        const user = await getCurrentUser();
        if (!user || !isPlatformAdmin(user.role)) {
            return { success: false, error: 'Admin access required' };
        }
        const data = await EventRepository.findPending();
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch' };
    }
}

export async function getPendingMembersAction() {
    try {
        const user = await getCurrentUser();
        if (!user || !canManageMembers(user.role)) {
            return { success: false, error: 'Admin access required' };
        }
        const data = await CommunityMemberRepository.listAllPending();
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch' };
    }
}

/* ─────────────────────────────────────────────
   Community management actions
───────────────────────────────────────────── */

export async function deleteCommunityAction(communityId: number): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user || !isPlatformAdmin(user.role)) {
            return { success: false, error: 'Admin access required' };
        }
        const supabase = await createClient();
        const { error } = await supabase.from('communities').delete().eq('id', communityId);
        if (error) throw new Error(error.message);
        await AdminLogRepository.create({
            admin_id: user.id,
            action: 'delete_community',
            target_type: 'community',
            target_id: communityId,
        });
        revalidatePath('/admin/communities');
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to delete community' };
    }
}

export async function toggleCommunityStatusAction(
    communityId: number,
    newStatus: 'active' | 'disabled'
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user || !isPlatformAdmin(user.role)) {
            return { success: false, error: 'Admin access required' };
        }
        await CommunityRepository.updateStatus(communityId, newStatus);
        await AdminLogRepository.create({
            admin_id: user.id,
            action: newStatus === 'disabled' ? 'disable_community' : 'enable_community',
            target_type: 'community',
            target_id: communityId,
        });
        revalidatePath('/admin/communities');
        revalidatePath(`/admin/community/${communityId}`);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update community status' };
    }
}

export async function updateCommunityInfoAction(
    communityId: number,
    data: { name?: string; description?: string; cover_image_url?: string; category?: string }
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user || !isPlatformAdmin(user.role)) {
            return { success: false, error: 'Admin access required' };
        }
        await CommunityRepository.update(communityId, data);
        await AdminLogRepository.create({
            admin_id: user.id,
            action: 'update_community',
            target_type: 'community',
            target_id: communityId,
            metadata: { fields: Object.keys(data) },
        });
        revalidatePath(`/admin/community/${communityId}`);
        revalidatePath('/admin/communities');
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update community' };
    }
}

/* ─────────────────────────────────────────────
   Member management actions
───────────────────────────────────────────── */

export async function removeMemberAction(memberId: number): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user || !isPlatformAdmin(user.role)) {
            return { success: false, error: 'Admin access required' };
        }
        const supabase = await createClient();
        const { data: member } = await supabase
            .from('community_members')
            .select('community_id')
            .eq('id', memberId)
            .single();
        const { error } = await supabase.from('community_members').delete().eq('id', memberId);
        if (error) throw new Error(error.message);
        if (member?.community_id) {
            await AdminLogRepository.create({
                admin_id: user.id,
                action: 'remove_member',
                target_type: 'community_member',
                target_id: memberId,
                metadata: { community_id: member.community_id },
            });
            revalidatePath(`/admin/community/${member.community_id}`);
        }
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to remove member' };
    }
}

/* ─────────────────────────────────────────────
   Media management actions
───────────────────────────────────────────── */

export async function deleteMediaAction(mediaId: number): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user || !isPlatformAdmin(user.role)) {
            return { success: false, error: 'Admin access required' };
        }
        const media = await CommunityMediaRepository.findById(mediaId);
        await CommunityMediaRepository.delete(mediaId);
        if (media) {
            await AdminLogRepository.create({
                admin_id: user.id,
                action: 'delete_media',
                target_type: 'community_media',
                target_id: mediaId,
                metadata: { community_id: media.community_id },
            });
            revalidatePath(`/admin/community/${media.community_id}`);
        }
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to delete media' };
    }
}

/* ─────────────────────────────────────────────
   Event management actions
───────────────────────────────────────────── */

export async function updateEventStatusAction(
    eventId: number,
    status: string
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user || !isPlatformAdmin(user.role)) {
            return { success: false, error: 'Admin access required' };
        }
        await EventRepository.updateStatus(eventId, status);
        await AdminLogRepository.create({
            admin_id: user.id,
            action: `set_event_status_${status}`,
            target_type: 'event',
            target_id: eventId,
        });
        revalidatePath('/admin/events');
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update event status' };
    }
}

/* ─────────────────────────────────────────────
   User management actions
───────────────────────────────────────────── */

export async function updateUserRoleAction(
    targetUserId: number,
    role: string
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user || !isPlatformAdmin(user.role)) {
            return { success: false, error: 'Admin access required' };
        }
        const supabase = await createClient();
        const { error } = await supabase.from('kyoty_users').update({ role }).eq('id', targetUserId);
        if (error) throw new Error(error.message);
        await AdminLogRepository.create({
            admin_id: user.id,
            action: 'update_user_role',
            target_type: 'user',
            target_id: targetUserId,
            metadata: { new_role: role },
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update user role' };
    }
}
