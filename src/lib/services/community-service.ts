import { CommunityRepository } from '@/lib/repositories/community-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { AdminLogRepository } from '@/lib/repositories/admin-log-repo';
import type { Community, CommunityMemberWithUser } from '@/types';

export const CommunityService = {
    async createCommunity(data: {
        name: string;
        slug: string;
        description?: string;
        category: string;
        city_id: number;
        organizer_id: number;
        cover_image_url?: string;
    }): Promise<Community> {
        return CommunityRepository.create(data);
    },

    async approveCommunity(communityId: number, adminId: number): Promise<void> {
        await CommunityRepository.updateStatus(communityId, 'approved');
        await AdminLogRepository.create({
            admin_id: adminId,
            action: 'approve_community',
            target_type: 'community',
            target_id: communityId,
        });
    },

    async rejectCommunity(communityId: number, adminId: number): Promise<void> {
        await CommunityRepository.updateStatus(communityId, 'rejected');
        await AdminLogRepository.create({
            admin_id: adminId,
            action: 'reject_community',
            target_type: 'community',
            target_id: communityId,
        });
    },

    async requestToJoin(communityId: number, userId: number): Promise<void> {
        const existing = await CommunityMemberRepository.findExisting(communityId, userId);
        if (existing) {
            throw new Error('You have already applied to this community');
        }
        await CommunityMemberRepository.createJoinRequest(communityId, userId);
    },

    async approveMember(memberId: number, approvedBy: number): Promise<void> {
        await CommunityMemberRepository.approve(memberId, approvedBy);
        await AdminLogRepository.create({
            admin_id: approvedBy,
            action: 'approve_member',
            target_type: 'community_member',
            target_id: memberId,
        });
    },

    async rejectMember(memberId: number, adminId: number): Promise<void> {
        await CommunityMemberRepository.reject(memberId);
        await AdminLogRepository.create({
            admin_id: adminId,
            action: 'reject_member',
            target_type: 'community_member',
            target_id: memberId,
        });
    },

    async getPendingRequests(communityId: number): Promise<CommunityMemberWithUser[]> {
        return CommunityMemberRepository.listPending(communityId);
    },
};
