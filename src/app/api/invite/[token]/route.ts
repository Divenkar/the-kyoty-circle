import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { InviteTokenRepository } from '@/lib/repositories/invite-token-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { CommunityRepository } from '@/lib/repositories/community-repo';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    // Validate token exists
    const invite = await InviteTokenRepository.findByToken(token);
    if (!invite) {
        return NextResponse.redirect(`${appUrl}/explore?invite=invalid`);
    }

    // Check expiry
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        return NextResponse.redirect(`${appUrl}/explore?invite=expired`);
    }

    // Check usage cap
    if (invite.use_count >= invite.max_uses) {
        return NextResponse.redirect(`${appUrl}/explore?invite=full`);
    }

    // Require login
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.redirect(`${appUrl}/login?next=/api/invite/${token}`);
    }

    // Look up community slug for redirect
    const community = await CommunityRepository.findById(invite.community_id);
    if (!community) {
        return NextResponse.redirect(`${appUrl}/explore`);
    }

    // Check if already a member
    const existing = await CommunityMemberRepository.findExisting(invite.community_id, user.id);
    if (existing?.status === 'approved') {
        return NextResponse.redirect(`${appUrl}/community/${community.slug}?invite=already_member`);
    }

    // Auto-approve: upsert as approved member
    if (existing) {
        // Pending or rejected — upgrade to approved
        await CommunityMemberRepository.approve(existing.id, invite.created_by);
    } else {
        // New member
        const member = await CommunityMemberRepository.createJoinRequest(invite.community_id, user.id);
        await CommunityMemberRepository.approve(member.id, invite.created_by);
    }

    // Increment usage counter
    await InviteTokenRepository.incrementUseCount(token);

    return NextResponse.redirect(`${appUrl}/community/${community.slug}?invite=welcome`);
}
