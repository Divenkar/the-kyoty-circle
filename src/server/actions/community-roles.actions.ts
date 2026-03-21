'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { CommunityRolesRepository } from '@/lib/repositories/community-roles-repo';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import type { ActionResponse, CommunityRole, CommunityRoleLevel } from '@/types';

/** Helper: check if current user can manage roles in a community */
async function canManageRoles(communityId: number): Promise<{ ok: boolean; userId?: number; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Authentication required' };

    const isPlatformAdmin = user.role === 'admin' || user.role === 'kyoty_admin';
    if (isPlatformAdmin) return { ok: true, userId: user.id };

    const community = await CommunityRepository.findById(communityId);
    if (!community) return { ok: false, error: 'Community not found' };

    const isOrganizer = community.organizer_id === user.id;
    if (isOrganizer) return { ok: true, userId: user.id };

    const role = await CommunityRolesRepository.getUserRole(communityId, user.id);
    if (role === 'owner' || role === 'admin') return { ok: true, userId: user.id };

    return { ok: false, error: 'You do not have permission to manage roles' };
}

export async function assignRoleAction(
    communityId: number,
    targetUserId: number,
    role: CommunityRoleLevel
): Promise<ActionResponse<CommunityRole>> {
    try {
        const check = await canManageRoles(communityId);
        if (!check.ok) return { success: false, error: check.error };

        const row = await CommunityRolesRepository.upsert({
            community_id: communityId,
            user_id: targetUserId,
            role,
            assigned_by: check.userId,
        });
        return { success: true, data: row };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to assign role' };
    }
}

export async function removeRoleAction(
    communityId: number,
    targetUserId: number
): Promise<ActionResponse> {
    try {
        const check = await canManageRoles(communityId);
        if (!check.ok) return { success: false, error: check.error };

        await CommunityRolesRepository.remove(communityId, targetUserId);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to remove role' };
    }
}

export async function listRolesAction(
    communityId: number
): Promise<ActionResponse<CommunityRole[]>> {
    try {
        const rows = await CommunityRolesRepository.listByCommunity(communityId);
        return { success: true, data: rows };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch roles' };
    }
}
