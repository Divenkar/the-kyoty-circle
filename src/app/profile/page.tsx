import { getCurrentUser } from '@/lib/auth-server';
import { EventParticipantRepository } from '@/lib/repositories/event-participant-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { redirect } from 'next/navigation';
import { ProfileForm } from './ProfileForm';
import { Calendar, Users, Star } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Profile | Kyoty',
};

export default async function ProfilePage() {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const [upcomingEvents, communities] = await Promise.all([
        EventParticipantRepository.listUpcomingByUser(user.id),
        CommunityMemberRepository.listByUser(user.id),
    ]);

    const approvedCommunities = communities.filter((m: any) => m.status === 'approved');
    const memberSince = new Date(user.created_at).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="min-h-[calc(100vh-72px)] bg-neutral-50">
            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">My Profile</h1>
                    <p className="mt-1 text-sm text-neutral-500">Member since {memberSince}</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                    {/* Main: edit form */}
                    <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="mb-6 text-base font-semibold text-neutral-900">Profile Details</h2>
                        <ProfileForm user={user} />
                    </div>

                    {/* Sidebar: stats */}
                    <div className="space-y-4">
                        {/* Stats */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                            <h3 className="mb-4 text-sm font-semibold text-neutral-900">Activity</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <Calendar size={15} className="text-primary-500" />
                                        Upcoming events
                                    </div>
                                    <span className="text-sm font-bold text-neutral-900">{upcomingEvents.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <Users size={15} className="text-primary-500" />
                                        Communities joined
                                    </div>
                                    <span className="text-sm font-bold text-neutral-900">{approvedCommunities.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick links */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                            <h3 className="mb-4 text-sm font-semibold text-neutral-900">Quick Links</h3>
                            <div className="space-y-2">
                                {[
                                    { href: '/dashboard', label: 'Dashboard' },
                                    { href: '/settings', label: 'Account Settings' },
                                    { href: '/communities', label: 'Browse Communities' },
                                    { href: '/explore', label: 'Explore Events' },
                                ].map(({ href, label }) => (
                                    <a
                                        key={href}
                                        href={href}
                                        className="block rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
                                    >
                                        {label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
