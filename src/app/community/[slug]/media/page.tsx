import { notFound } from 'next/navigation';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { CommunityRolesRepository } from '@/lib/repositories/community-roles-repo';
import { CommunityMediaRepository } from '@/lib/repositories/community-media-repo';
import { getCurrentUser } from '@/lib/auth-server';
import { CommunityTabNav } from '@/components/CommunityTabNav';
import { MediaGallery } from './MediaGallery';
import { Lock } from 'lucide-react';
import Link from 'next/link';

interface Props { params: Promise<{ slug: string }> }

export default async function MediaPage({ params }: Props) {
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
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 mb-3">
                        <Lock size={20} className="text-neutral-500" />
                    </div>
                    <h2 className="font-display text-lg text-neutral-900">Members only</h2>
                    <p className="mt-1.5 text-sm text-neutral-500">Sign in to view the photo gallery</p>
                    <Link href="/login" className="mt-4 inline-flex rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Sign in</Link>
                </div>
            </div>
        );
    }

    const isMember = await CommunityMemberRepository.isMember(community.id, currentUser.id);
    const isOrganizer = community.organizer_id === currentUser.id;
    const isPlatformAdmin = currentUser.role === 'admin' || currentUser.role === 'kyoty_admin';
    const communityRole = await CommunityRolesRepository.getUserRole(community.id, currentUser.id);
    const canManage = isPlatformAdmin || isOrganizer || communityRole === 'owner' || communityRole === 'admin';
    const canAccess = isMember || isOrganizer || isPlatformAdmin;

    if (!canAccess) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <CommunityTabNav slug={slug} isMember={false} canManage={false} />
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 mb-3">
                        <Lock size={20} className="text-neutral-500" />
                    </div>
                    <h2 className="font-display text-lg text-neutral-900">Join to view</h2>
                    <p className="mt-1.5 text-sm text-neutral-500">Become a member to access the photo gallery.</p>
                    <Link href={`/community/${slug}`} className="mt-4 inline-flex rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Request to join</Link>
                </div>
            </div>
        );
    }

    const media = await CommunityMediaRepository.findByCommunity(community.id);

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="border-b border-neutral-200 bg-white px-4 py-3 sm:px-8">
                <h1 className="font-display text-base text-neutral-900">{community.name}</h1>
            </div>
            <CommunityTabNav slug={slug} isMember={isMember || isOrganizer} canManage={canManage} />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
                <h2 className="mb-5 font-display text-lg text-neutral-900">Photo Gallery</h2>
                <MediaGallery
                    communityId={community.id}
                    initialMedia={media}
                    currentUserId={currentUser.id}
                    canManage={canManage}
                    isMember={canAccess}
                />
            </div>
        </div>
    );
}
