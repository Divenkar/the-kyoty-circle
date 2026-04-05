import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { getCurrentUser } from '@/lib/auth-server';
import { CommunityTabNav } from '@/components/CommunityTabNav';
import { CommunityRolesRepository } from '@/lib/repositories/community-roles-repo';
import { Users, Lock } from 'lucide-react';
import Link from 'next/link';

interface Props { params: Promise<{ slug: string }> }

export default async function MembersPage({ params }: Props) {
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
                    <p className="mt-1.5 text-sm text-neutral-500">Sign in to view members</p>
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

    if (!isMember && !isOrganizer && !isPlatformAdmin) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <CommunityTabNav slug={slug} isMember={false} canManage={false} />
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 mb-3">
                        <Lock size={20} className="text-neutral-500" />
                    </div>
                    <h2 className="font-display text-lg text-neutral-900">Join to view</h2>
                    <p className="mt-1.5 text-sm text-neutral-500">Become a member to see the member list.</p>
                </div>
            </div>
        );
    }

    const [members, roles] = await Promise.all([
        CommunityMemberRepository.listApproved(community.id),
        CommunityRolesRepository.listByCommunity(community.id),
    ]);

    const roleMap = new Map(roles.map(r => [r.user_id, r.role]));

    const ROLE_BADGE: Record<string, string> = {
        owner: 'bg-amber-100 text-amber-700',
        admin: 'bg-blue-100 text-blue-700',
        moderator: 'bg-green-100 text-green-700',
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="border-b border-neutral-200 bg-white px-4 py-3 sm:px-8">
                <h1 className="font-display text-base text-neutral-900">{community.name}</h1>
            </div>
            <CommunityTabNav slug={slug} isMember={isMember || isOrganizer} canManage={canManage} />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                <div className="mb-5 flex items-center gap-2">
                    <h2 className="font-display text-lg text-neutral-900">Members</h2>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">{members.length}</span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    {members.map((member, i) => {
                        const user = member.kyoty_users;
                        const role = roleMap.get(member.user_id);
                        const initials = user?.name?.slice(0, 2).toUpperCase() || '??';

                        return (
                            <div key={member.id} className={`flex items-center gap-3 px-5 py-4 ${i > 0 ? 'border-t border-neutral-100' : ''}`}>
                                <Link href={`/profile/${member.user_id}`} className="shrink-0">
                                    {user?.avatar_url ? (
                                        <Image
                                            src={user.avatar_url}
                                            alt={user.name}
                                            width={40}
                                            height={40}
                                            className="h-10 w-10 rounded-full object-cover transition hover:opacity-80"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 hover:opacity-80 transition">
                                            {initials}
                                        </div>
                                    )}
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/profile/${member.user_id}`} className="text-sm font-semibold text-neutral-800 truncate hover:text-primary-600 transition-colors">
                                        {user?.name || 'Unknown'}
                                    </Link>
                                    <p className="text-xs text-neutral-400">
                                        Joined {new Date(member.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                {role && (
                                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLE_BADGE[role] || 'bg-neutral-100 text-neutral-600'}`}>
                                        {role}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                    {members.length === 0 && (
                        <div className="py-12 text-center text-sm text-neutral-400">No members yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
