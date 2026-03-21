import { notFound, redirect } from 'next/navigation';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { getCurrentUser } from '@/lib/auth-server';
import { JoinApplicationForm } from './JoinApplicationForm';
import { ArrowLeft, Users } from 'lucide-react';
import NextImage from 'next/image';
import Link from 'next/link';

interface Props { params: Promise<{ slug: string }> }

export default async function JoinCommunityPage({ params }: Props) {
    const { slug } = await params;

    const community = isNaN(Number(slug))
        ? await CommunityRepository.findBySlug(slug)
        : await CommunityRepository.findById(Number(slug));

    if (!community) notFound();

    const currentUser = await getCurrentUser();
    if (!currentUser) redirect(`/login?next=/community/${slug}/join`);

    // Already a member or organizer — send them to the community page
    const isOrganizer = community.organizer_id === currentUser.id;
    if (isOrganizer) redirect(`/community/${slug}`);

    const existing = await CommunityMemberRepository.findExisting(community.id, currentUser.id);
    if (existing?.status === 'approved') redirect(`/community/${slug}`);

    const hasPendingRequest = existing?.status === 'pending';

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Cover strip */}
            <div className="relative h-40 bg-gradient-to-br from-primary-400 to-primary-600">
                {community.cover_image_url && (
                    <NextImage src={community.cover_image_url} alt={community.name} fill className="object-cover opacity-60" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Link
                    href={`/community/${slug}`}
                    className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30 transition"
                >
                    <ArrowLeft size={15} />
                    Back
                </Link>
                <div className="absolute bottom-4 left-5 right-5">
                    <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-0.5">Join community</p>
                    <h1 className="text-xl font-bold text-white drop-shadow">{community.name}</h1>
                </div>
            </div>

            <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
                {hasPendingRequest ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                            <Users size={22} className="text-amber-600" />
                        </div>
                        <h2 className="text-base font-semibold text-amber-900">Application under review</h2>
                        <p className="mt-2 text-sm text-amber-700">
                            You&apos;ve already applied to join <strong>{community.name}</strong>. The community manager will review your
                            request and get back to you soon.
                        </p>
                        <Link
                            href={`/community/${slug}`}
                            className="mt-5 inline-flex items-center justify-center rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition"
                        >
                            View community
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                        <div className="border-b border-neutral-100 bg-primary-50 px-6 py-5">
                            <h2 className="text-base font-semibold text-primary-900">Apply to join</h2>
                            <p className="mt-1 text-sm text-primary-700">
                                Tell the community manager a bit about yourself. Your request will be reviewed before you&apos;re added.
                            </p>
                        </div>
                        <JoinApplicationForm
                            communityId={community.id}
                            communitySlug={slug}
                            communityName={community.name}
                            userName={currentUser.name}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
