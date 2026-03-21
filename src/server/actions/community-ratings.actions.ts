'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { CommunityRatingsRepository } from '@/lib/repositories/community-ratings-repo';
import type { ActionResponse } from '@/types';

export async function submitRatingAction(
    communityId: number,
    rating: number,
    review?: string
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const isMember = await CommunityMemberRepository.isMember(communityId, user.id);
        if (!isMember) return { success: false, error: 'You must be a member to rate this community' };

        if (rating < 1 || rating > 5) return { success: false, error: 'Rating must be between 1 and 5' };

        await CommunityRatingsRepository.upsert(communityId, user.id, rating, review);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to submit rating' };
    }
}
