import { getCurrentUser } from '@/lib/auth-server';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { CommunityRolesRepository } from '@/lib/repositories/community-roles-repo';
import { PostRepository } from '@/lib/repositories/post-repo';
import { EventRepository } from '@/lib/repositories/event-repo';
import { PostCard } from '@/components/PostCard';
import { PostComposer } from '@/components/PostComposer';
import { CommunityTabNav } from '@/components/CommunityTabNav';
import { CommunitySidebar } from '@/components/CommunitySidebar';
import { CommunityRightPanel } from '@/components/CommunityRightPanel';
import { notFound, redirect } from 'next/navigation';
import { Rss, Plus } from 'lucide-react';
import Link from 'next/link';

interface FeedPageProps {
    params: Promise<{ slug: string }>;
}

export default async function CommunityFeedPage({ params }: FeedPageProps) {
    const { slug } = await params;

    const community = isNaN(Number(slug))
        ? await CommunityRepository.findBySlug(slug)
        : await CommunityRepository.findById(Number(slug));

    if (!community) notFound();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
        redirect(`/login?next=/community/${slug}/feed`);
    }

    const isPlatformAdmin = currentUser.role === 'admin' || currentUser.role === 'kyoty_admin';
    const isOrganizer = community.organizer_id === currentUser.id;
    const isMember = isPlatformAdmin || isOrganizer
        ? true
        : await CommunityMemberRepository.isMember(community.id, currentUser.id);

    if (!isMember) {
        redirect(`/community/${slug}`);
    }

    const communityRole = await CommunityRolesRepository.getUserRole(community.id, currentUser.id);
    const canManage = isOrganizer || communityRole === 'owner' || communityRole === 'admin';

    const memberCount = community.member_count || await CommunityRepository.getMemberCount(community.id);

    // Fetch all data in parallel
    const [posts, allEvents, moderators, relatedCommunities] = await Promise.all([
        PostRepository.findByCommunity(community.id, 20),
        EventRepository.findByCommunity(community.id),
        CommunityRolesRepository.listByCommunity(community.id),
        CommunityRepository.search({ city: 'all', query: '', category: community.category }),
    ]);

    // Upcoming events only
    const now = new Date();
    const upcomingEvents = allEvents
        .filter((e) => ['approved', 'open'].includes(e.status) && new Date(e.date) >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Related communities (same category, not this one)
    const related = relatedCommunities
        .filter((c) => c.id !== community.id)
        .slice(0, 4);

    const postIds = posts.map((p) => p.id);
    const [reactionSummaryMap, commentCountMap] = await Promise.all([
        PostRepository.getReactionSummary(postIds, currentUser.id),
        PostRepository.getCommentCounts(postIds),
    ]);

    const enrichedPosts = posts.map((p) => {
        const rSummary = reactionSummaryMap.get(p.id) || { count: 0, userType: null };
        return {
            ...p,
            reaction_count: rSummary.count,
            comment_count: commentCountMap.get(p.id) || 0,
            user_reacted: rSummary.userType !== null,
            user_reaction_type: rSummary.userType,
        };
    });

    return (
        <div className="min-h-screen bg-neutral-50">
            <CommunityTabNav slug={slug} isMember={true} canManage={canManage} />

            {/* ── 3-column grid ──────────────────────────────────────── */}
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                <div className="grid gap-6 lg:grid-cols-[240px_1fr_260px]">

                    {/* ── LEFT SIDEBAR ─────────────────────────────── */}
                    <div className="hidden lg:block">
                        <CommunitySidebar
                            community={community}
                            memberCount={memberCount}
                            moderators={moderators}
                            isMember={isMember}
                            canManage={canManage}
                            communitySlug={slug}
                        />
                    </div>

                    {/* ── MAIN FEED ────────────────────────────────── */}
                    <main className="min-w-0">
                        {/* Composer */}
                        <div className="mb-5">
                            <PostComposer
                                communityId={community.id}
                                communityName={community.name}
                                currentUserName={currentUser.name}
                                currentUserAvatar={currentUser.avatar_url ?? null}
                            />
                        </div>

                        {/* Post type shortcuts */}
                        <div className="mb-5 flex gap-2 overflow-x-auto">
                            {[
                                { label: 'Discussion', href: `/post/create?community=${slug}&type=discussion` },
                                { label: 'Media', href: `/post/create?community=${slug}&type=media` },
                                { label: 'Event', href: '/create-event' },
                            ].map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm transition hover:border-primary-300 hover:text-primary-700"
                                >
                                    <Plus size={11} />
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Feed */}
                        {enrichedPosts.length > 0 ? (
                            <div className="space-y-4">
                                {enrichedPosts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        currentUserId={currentUser.id}
                                        currentUserName={currentUser.name}
                                        currentUserAvatar={currentUser.avatar_url}
                                        communitySlug={slug}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                                    <Rss size={26} className="text-primary-500" />
                                </div>
                                <h3 className="text-base font-semibold text-neutral-900">No posts yet</h3>
                                <p className="mt-2 text-sm text-neutral-500 max-w-xs mx-auto">
                                    Be the first to share something with {community.name}.
                                </p>
                                <Link
                                    href={`/post/create?community=${slug}`}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                                >
                                    <Plus size={15} />
                                    Write the first post
                                </Link>
                            </div>
                        )}

                        {enrichedPosts.length >= 20 && (
                            <p className="mt-6 text-center text-xs text-neutral-400">
                                Showing latest 20 posts.{' '}
                                <Link href={`/community/${slug}/chat`} className="text-primary-600 hover:underline">
                                    Open chat for real-time conversation →
                                </Link>
                            </p>
                        )}
                    </main>

                    {/* ── RIGHT PANEL ──────────────────────────────── */}
                    <div className="hidden xl:block">
                        <CommunityRightPanel
                            upcomingEvents={upcomingEvents as any[]}
                            relatedCommunities={related}
                            communitySlug={slug}
                            isMember={isMember}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
