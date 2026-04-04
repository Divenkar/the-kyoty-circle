import { CommunityRepository } from '@/lib/repositories/community-repo';
import { CommunityRolesRepository } from '@/lib/repositories/community-roles-repo';
import { getCurrentUser } from '@/lib/auth-server';
import { listInvitesAction } from '@/server/actions/invite.actions';
import { notFound, redirect } from 'next/navigation';
import { InviteManager } from './InviteManager';
import type { Metadata } from 'next';

interface InvitesPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Manage Invites | Kyoty',
    };
}

export default async function InvitesPage({ params }: InvitesPageProps) {
    const { slug } = await params;

    // Resolve community by slug or numeric ID (same pattern as the main community page)
    const community = isNaN(Number(slug))
        ? await CommunityRepository.findBySlug(slug)
        : await CommunityRepository.findById(Number(slug));

    if (!community) notFound();

    const currentUser = await getCurrentUser();
    if (!currentUser) redirect('/login');

    // Verify the user is organizer, community-role owner/admin, or platform admin
    const isPlatformAdmin =
        currentUser.role === 'admin' || currentUser.role === 'kyoty_admin';
    const isOrganizer = community.organizer_id === currentUser.id;
    const communityRole = await CommunityRolesRepository.getUserRole(
        community.id,
        currentUser.id,
    );
    const canManage =
        isPlatformAdmin ||
        isOrganizer ||
        communityRole === 'owner' ||
        communityRole === 'admin';

    if (!canManage) notFound();

    // Fetch existing invite tokens
    const invitesResult = await listInvitesAction(community.id);
    const invites = invitesResult.success && invitesResult.data ? invitesResult.data : [];

    return (
        <InviteManager
            communityId={community.id}
            communitySlug={slug}
            communityName={community.name}
            initialInvites={invites}
        />
    );
}
