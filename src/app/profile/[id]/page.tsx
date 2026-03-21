import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { UserRepository } from '@/lib/repositories/user-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { getCurrentUser } from '@/lib/auth-server';
import { ShieldCheck, Calendar, Users, MapPin, Pencil } from 'lucide-react';

interface Props { params: Promise<{ id: string }> }

export default async function PublicProfilePage({ params }: Props) {
    const { id } = await params;
    const numId = Number(id);
    if (isNaN(numId)) notFound();

    const [profileUser, currentUser] = await Promise.all([
        UserRepository.findById(numId),
        getCurrentUser(),
    ]);

    if (!profileUser) notFound();

    const isOwnProfile = currentUser?.id === profileUser.id;
    const isVerified = !!profileUser.social_proof_type && !!profileUser.social_proof_link;

    const communities = await CommunityMemberRepository.listByUser(profileUser.id);

    const initials = profileUser.name
        ? profileUser.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">

                {/* Profile card */}
                <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
                    <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-neutral-200 bg-primary-100">
                            {profileUser.avatar_url ? (
                                <Image
                                    src={profileUser.avatar_url}
                                    alt={profileUser.name}
                                    width={80}
                                    height={80}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary-600">
                                    {initials}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h1 className="text-xl font-bold text-neutral-900">{profileUser.name}</h1>
                                    {isVerified && (
                                        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 border border-green-200">
                                            <ShieldCheck size={12} />
                                            Verified via {profileUser.social_proof_type === 'linkedin' ? 'LinkedIn' : 'Instagram'}
                                        </div>
                                    )}
                                </div>
                                {isOwnProfile && (
                                    <Link
                                        href="/profile"
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 shrink-0"
                                    >
                                        <Pencil size={12} /> Edit Profile
                                    </Link>
                                )}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-500">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    Member since {new Date(profileUser.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users size={14} />
                                    {communities.length} {communities.length === 1 ? 'community' : 'communities'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Communities */}
                {communities.length > 0 && (
                    <div className="mt-6">
                        <h2 className="mb-3 text-sm font-semibold text-neutral-500 uppercase tracking-wide px-1">Communities</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {communities.map((m: any) => {
                                const c = m.communities;
                                if (!c) return null;
                                return (
                                    <Link
                                        key={m.id}
                                        href={`/community/${c.slug}`}
                                        className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-primary-300 hover:shadow-sm"
                                    >
                                        {c.cover_image_url ? (
                                            <Image
                                                src={c.cover_image_url}
                                                alt={c.name}
                                                width={40}
                                                height={40}
                                                className="h-10 w-10 shrink-0 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                                                <Users size={16} className="text-primary-600" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-neutral-800 truncate">{c.name}</p>
                                            <p className="text-xs text-neutral-400 capitalize">{c.category}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {communities.length === 0 && (
                    <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-400">
                        Not a member of any communities yet.
                    </div>
                )}
            </div>
        </div>
    );
}
