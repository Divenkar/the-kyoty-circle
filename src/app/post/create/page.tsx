import { getCurrentUser } from '@/lib/auth-server';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { redirect } from 'next/navigation';
import { PostCreateForm } from './PostCreateForm';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Create Post | Kyoty',
};

interface PostCreatePageProps {
    searchParams: Promise<{ community?: string; type?: string }>;
}

export default async function PostCreatePage({ searchParams }: PostCreatePageProps) {
    const { community: communitySlug } = await searchParams;

    const currentUser = await getCurrentUser();
    if (!currentUser) {
        redirect(`/login?next=/post/create${communitySlug ? `?community=${communitySlug}` : ''}`);
    }

    const memberships = await CommunityMemberRepository.listByUser(currentUser.id);

    const communities = memberships
        .filter((m) => m.communities?.status === 'approved')
        .map((m) => ({
            id: m.communities.id as number,
            name: m.communities.name as string,
            slug: m.communities.slug as string | null,
        }));

    return (
        <div className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6">
            <Suspense>
                <PostCreateForm
                    communities={communities}
                    defaultCommunitySlug={communitySlug ?? null}
                />
            </Suspense>
        </div>
    );
}
