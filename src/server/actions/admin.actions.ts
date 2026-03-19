'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { CommunityService } from '@/lib/services/community-service';
import { EventService } from '@/lib/services/event-service';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { EventRepository } from '@/lib/repositories/event-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import type { ActionResponse } from '@/types';

export async function approveCommunityAction(communityId: number): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'kyoty_admin' && user.role !== 'admin')) {
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
        if (!user || (user.role !== 'kyoty_admin' && user.role !== 'admin')) {
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
        if (!user || (user.role !== 'kyoty_admin' && user.role !== 'admin')) {
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
        if (!user || (user.role !== 'kyoty_admin' && user.role !== 'admin')) {
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
        if (!user || (user.role !== 'community_admin' && (user.role !== 'kyoty_admin' && user.role !== 'admin'))) {
            return { success: false, error: 'Admin access required' };
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
        if (!user || (user.role !== 'community_admin' && (user.role !== 'kyoty_admin' && user.role !== 'admin'))) {
            return { success: false, error: 'Admin access required' };
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
        if (!user || (user.role !== 'kyoty_admin' && user.role !== 'admin')) {
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
        if (!user || (user.role !== 'kyoty_admin' && user.role !== 'admin')) {
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
        if (!user || (user.role !== 'community_admin' && (user.role !== 'kyoty_admin' && user.role !== 'admin'))) {
            return { success: false, error: 'Admin access required' };
        }
        const data = await CommunityMemberRepository.listAllPending();
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch' };
    }
}
