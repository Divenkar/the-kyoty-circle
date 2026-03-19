'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import type { ActionResponse } from '@/types';

export async function updateCommunityAction(
    communityId: number,
    data: {
        name?: string;
        description?: string;
        cover_image_url?: string;
    }
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        // Verify the user is the organizer of this community
        const community = await CommunityRepository.findById(communityId);
        if (!community) return { success: false, error: 'Community not found' };

        // Check by organizer_id OR by email match for admin users
        const isOrganizer = community.organizer_id === user.id;
        const isAdmin = user.role === 'admin' || user.role === 'kyoty_admin';

        if (!isOrganizer && !isAdmin) {
            return { success: false, error: 'You do not have permission to edit this community' };
        }

        // Filter to only allowed fields
        const updateData: Record<string, string | undefined> = {};
        if (data.name) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.cover_image_url !== undefined) updateData.cover_image_url = data.cover_image_url;

        await CommunityRepository.update(communityId, updateData);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update community' };
    }
}
