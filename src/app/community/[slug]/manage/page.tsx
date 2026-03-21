import { notFound, redirect } from 'next/navigation';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { CommunityRolesRepository } from '@/lib/repositories/community-roles-repo';
import { getCurrentUser } from '@/lib/auth-server';
import { CommunityTabNav } from '@/components/CommunityTabNav';
import { ManageClient } from './ManageClient';

interface Props { params: Promise<{ slug: string }> }

export default async function ManagePage({ params }: Props) {
    const { slug } = await params;

    const community = isNaN(Number(slug))
        ? await CommunityRepository.findBySlug(slug)
        : await CommunityRepository.findById(Number(slug));

    if (!community) notFound();

    const currentUser = await getCurrentUser();
    if (!currentUser) redirect('/login');

    const isPlatformAdmin = currentUser.role === 'admin' || currentUser.role === 'kyoty_admin';
    const isOrganizer = community.organizer_id === currentUser.id;
    const communityRole = await CommunityRolesRepository.getUserRole(community.id, currentUser.id);
    const canManage = isPlatformAdmin || isOrganizer || communityRole === 'owner' || communityRole === 'admin';

    if (!canManage) redirect(`/community/${slug}`);

    const isOwner = isOrganizer || communityRole === 'owner' || isPlatformAdmin;
    const isMember = await CommunityMemberRepository.isMember(community.id, currentUser.id);

    const [members, pendingMembers, roles] = await Promise.all([
        CommunityMemberRepository.listApproved(community.id),
        CommunityMemberRepository.listPending(community.id),
        CommunityRolesRepository.listByCommunity(community.id),
    ]);

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="border-b border-neutral-200 bg-white px-4 py-3 sm:px-8">
                <h1 className="text-base font-bold text-neutral-900">{community.name}</h1>
                <p className="text-xs text-neutral-500">Community Management</p>
            </div>
            <CommunityTabNav slug={slug} isMember={isMember || isOrganizer} canManage={canManage} />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                <ManageClient
                    community={community}
                    members={members}
                    pendingMembers={pendingMembers}
                    roles={roles}
                    currentUserId={currentUser.id}
                    isOwner={isOwner}
                />
            </div>
        </div>
    );
}
