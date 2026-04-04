'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { CommunityRolesRepository } from '@/lib/repositories/community-roles-repo';
import { InviteTokenRepository } from '@/lib/repositories/invite-token-repo';
import type { InviteToken } from '@/lib/repositories/invite-token-repo';
import type { ActionResponse } from '@/types';

/**
 * Verify the current user is an organizer or admin for the given community.
 * Returns the user on success, or an error response on failure.
 */
async function verifyOrganizerOrAdmin(communityId: number) {
    const user = await getCurrentUser();
    if (!user) return { error: 'Authentication required' as const };

    const isPlatformAdmin = user.role === 'admin' || user.role === 'kyoty_admin';
    if (isPlatformAdmin) return { user };

    const community = await CommunityRepository.findById(communityId);
    if (!community) return { error: 'Community not found' as const };

    const isOrganizer = community.organizer_id === user.id;
    if (isOrganizer) return { user };

    const communityRole = await CommunityRolesRepository.getUserRole(communityId, user.id);
    if (communityRole === 'owner' || communityRole === 'admin') return { user };

    return { error: 'You do not have permission to manage invites for this community' as const };
}

export async function createInviteAction(
    communityId: number,
    maxUses?: number,
): Promise<ActionResponse<InviteToken>> {
    try {
        const result = await verifyOrganizerOrAdmin(communityId);
        if ('error' in result && !('user' in result)) {
            return { success: false, error: result.error };
        }
        const { user } = result as { user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>> };

        const invite = await InviteTokenRepository.create(communityId, user.id, maxUses ?? 50);
        return { success: true, data: invite };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to create invite',
        };
    }
}

export async function listInvitesAction(
    communityId: number,
): Promise<ActionResponse<InviteToken[]>> {
    try {
        const result = await verifyOrganizerOrAdmin(communityId);
        if ('error' in result && !('user' in result)) {
            return { success: false, error: result.error };
        }

        const invites = await InviteTokenRepository.listByCommunity(communityId);
        return { success: true, data: invites };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to list invites',
        };
    }
}

export async function deleteInviteAction(
    id: number,
    communityId: number,
): Promise<ActionResponse> {
    try {
        const result = await verifyOrganizerOrAdmin(communityId);
        if ('error' in result && !('user' in result)) {
            return { success: false, error: result.error };
        }

        await InviteTokenRepository.delete(id);
        return { success: true };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to delete invite',
        };
    }
}
