import { CommunityRepository } from '@/lib/repositories/community-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { AdminLogRepository } from '@/lib/repositories/admin-log-repo';
import { UserRepository } from '@/lib/repositories/user-repo';
import { NotificationService } from '@/lib/services/notification-service';
import { sendEmail, memberApprovedEmail, memberRejectedEmail } from '@/lib/email';
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
        visibility?: string;
    }): Promise<Community> {
        return CommunityRepository.create(data);
    },

    async approveCommunity(communityId: number, adminId: number): Promise<void> {
        const community = await CommunityRepository.findById(communityId);
        await CommunityRepository.updateStatus(communityId, 'approved');
        await AdminLogRepository.create({
            admin_id: adminId,
            action: 'approve_community',
            target_type: 'community',
            target_id: communityId,
        });
        // In-app notification to organizer
        if (community?.organizer_id) {
            NotificationService.communityApproved(community.organizer_id, community.name, community.slug);
        }
    },

    async rejectCommunity(communityId: number, adminId: number): Promise<void> {
        const community = await CommunityRepository.findById(communityId);
        await CommunityRepository.updateStatus(communityId, 'rejected');
        await AdminLogRepository.create({
            admin_id: adminId,
            action: 'reject_community',
            target_type: 'community',
            target_id: communityId,
        });
        // In-app notification to organizer
        if (community?.organizer_id) {
            NotificationService.communityRejected(community.organizer_id, community.name);
        }
    },

    async requestToJoin(
        communityId: number,
        userId: number,
        opts?: { joinReason?: string; socialProofLink?: string }
    ): Promise<{ status: 'approved' | 'pending' }> {
        const existing = await CommunityMemberRepository.findExisting(communityId, userId);
        if (existing) {
            if (existing.status === 'approved') return { status: 'approved' };
            throw new Error('You have already applied to this community');
        }

        const community = await CommunityRepository.findById(communityId);
        if (!community) throw new Error('Community not found');

        // Public communities: auto-approve so users can access immediately
        // Private communities: keep pending for organizer review
        if (community.visibility !== 'private') {
            await CommunityMemberRepository.createAndApprove(communityId, userId, opts);
            return { status: 'approved' };
        }

        await CommunityMemberRepository.createJoinRequest(communityId, userId, opts);
        // Notify community organizer of pending join request
        if (community.organizer_id) {
            const user = await UserRepository.findById(userId);
            if (user) {
                NotificationService.joinRequest(community.organizer_id, user.name, community.name, community.slug);
            }
        }
        return { status: 'pending' };
    },

    async approveMember(memberId: number, approvedBy: number): Promise<void> {
        // Fetch member before updating to get user_id + community_id for email
        const member = await CommunityMemberRepository.findById(memberId);
        await CommunityMemberRepository.approve(memberId, approvedBy);
        await AdminLogRepository.create({
            admin_id: approvedBy,
            action: 'approve_member',
            target_type: 'community_member',
            target_id: memberId,
        });
        // Send approval email + in-app notification (non-blocking)
        if (member) {
            const [user, community] = await Promise.all([
                UserRepository.findById(member.user_id),
                CommunityRepository.findById(member.community_id),
            ]);
            if (user && community) {
                sendEmail({
                    to: user.email,
                    subject: `You're in! Welcome to ${community.name}`,
                    html: memberApprovedEmail(user.name, community.name, community.slug),
                });
                NotificationService.memberApproved(member.user_id, community.name, community.slug);
            }
        }
    },

    async rejectMember(memberId: number, adminId: number): Promise<void> {
        const member = await CommunityMemberRepository.findById(memberId);
        await CommunityMemberRepository.reject(memberId);
        await AdminLogRepository.create({
            admin_id: adminId,
            action: 'reject_member',
            target_type: 'community_member',
            target_id: memberId,
        });
        // Send rejection email + in-app notification (non-blocking)
        if (member) {
            const [user, community] = await Promise.all([
                UserRepository.findById(member.user_id),
                CommunityRepository.findById(member.community_id),
            ]);
            if (user && community) {
                sendEmail({
                    to: user.email,
                    subject: `Update on your ${community.name} application`,
                    html: memberRejectedEmail(user.name, community.name),
                });
                NotificationService.memberRejected(member.user_id, community.name);
            }
        }
    },

    async getPendingRequests(communityId: number): Promise<CommunityMemberWithUser[]> {
        return CommunityMemberRepository.listPending(communityId);
    },
};
