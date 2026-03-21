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
                <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                    <Lock size={28} className="mb-3 text-neutral-400" />
                    <p className="text-sm font-medium text-neutral-600">Sign in to view the photo gallery</p>
                    <Link href="/login" className="mt-4 inline-flex rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700">Sign in</Link>
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
                <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                    <Lock size={28} className="mb-3 text-neutral-400" />
                    <p className="text-sm font-medium text-neutral-600">Join to view the gallery</p>
                    <Link href={`/community/${slug}`} className="mt-4 inline-flex rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700">Request to join</Link>
                </div>
            </div>
        );
    }

    const media = await CommunityMediaRepository.findByCommunity(community.id);

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="border-b border-neutral-200 bg-white px-4 py-3 sm:px-8">
                <h1 className="text-base font-bold text-neutral-900">{community.name}</h1>
            </div>
            <CommunityTabNav slug={slug} isMember={isMember || isOrganizer} canManage={canManage} />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
                <h2 className="mb-5 text-lg font-semibold text-neutral-900">Photo Gallery</h2>
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
