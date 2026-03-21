import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { CommunityMediaRepository } from '@/lib/repositories/community-media-repo';
import { CommunityAdminClient } from './CommunityAdminClient';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdminCommunityDetailPage({ params }: Props) {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'kyoty_admin' && user.role !== 'admin')) redirect('/dashboard');

    const { id } = await params;
    const communityId = parseInt(id, 10);
    if (isNaN(communityId)) notFound();

    const [community, members, media] = await Promise.all([
        CommunityRepository.findById(communityId),
        CommunityMemberRepository.listApproved(communityId),
        CommunityMediaRepository.findByCommunity(communityId),
    ]);

    if (!community) notFound();

    return <CommunityAdminClient community={community} members={members} media={media} />;
}
