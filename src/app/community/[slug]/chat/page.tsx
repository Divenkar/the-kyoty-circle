import { notFound, redirect } from 'next/navigation';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { CommunityRolesRepository } from '@/lib/repositories/community-roles-repo';
import { CommunityMessagesRepository } from '@/lib/repositories/community-messages-repo';
import { getCurrentUser } from '@/lib/auth-server';
import { ChatRoom } from './ChatRoom';
import { CommunityTabNav } from '@/components/CommunityTabNav';
import { Lock } from 'lucide-react';
import Link from 'next/link';

interface Props { params: Promise<{ slug: string }> }

export default async function ChatPage({ params }: Props) {
    const { slug } = await params;

    const community = isNaN(Number(slug))
        ? await CommunityRepository.findBySlug(slug)
        : await CommunityRepository.findById(Number(slug));

    if (!community) notFound();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <CommunityTabNav slug={slug} isMember={false} canManage={false} />
                <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 mb-4">
                        <Lock size={24} className="text-primary-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-neutral-900">Members only</h2>
                    <p className="mt-2 text-sm text-neutral-500">Sign in and join the community to access the chat.</p>
                    <Link href="/login" className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
                        Sign in
                    </Link>
                </div>
            </div>
        );
    }

    const isMember = await CommunityMemberRepository.isMember(community.id, currentUser.id);
    const isOrganizer = community.organizer_id === currentUser.id;
    const isPlatformAdmin = currentUser.role === 'admin' || currentUser.role === 'kyoty_admin';

    if (!isMember && !isOrganizer && !isPlatformAdmin) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <CommunityTabNav slug={slug} isMember={false} canManage={false} />
                <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 mb-4">
                        <Lock size={24} className="text-neutral-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-neutral-900">Join to chat</h2>
                    <p className="mt-2 text-sm text-neutral-500">You need to be a member to access the community chat.</p>
                    <Link href={`/community/${slug}`} className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
                        Request to join
                    </Link>
                </div>
            </div>
        );
    }

    const communityRole = await CommunityRolesRepository.getUserRole(community.id, currentUser.id);
    const canModerate = isPlatformAdmin || isOrganizer || communityRole === 'owner' || communityRole === 'admin' || communityRole === 'moderator';
    const canManage = isPlatformAdmin || isOrganizer || communityRole === 'owner' || communityRole === 'admin';

    const initialMessages = await CommunityMessagesRepository.findByCommunity(community.id, 50);

    return (
        <div className="flex h-screen flex-col bg-neutral-50">
            {/* Community header */}
            <div className="border-b border-neutral-200 bg-white px-4 py-3 sm:px-8">
                <h1 className="text-base font-bold text-neutral-900">{community.name}</h1>
                <p className="text-xs text-neutral-500">Community Chat</p>
            </div>

            <CommunityTabNav slug={slug} isMember={isMember || isOrganizer} canManage={canManage} />

            <div className="flex-1 overflow-hidden">
                <ChatRoom
                    communityId={community.id}
                    communitySlug={slug}
                    currentUserId={currentUser.id}
                    canModerate={canModerate}
                    initialMessages={initialMessages}
                />
            </div>
        </div>
    );
}
