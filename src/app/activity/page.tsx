import { getCurrentUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { Bell, Clock, ArrowRight, Activity } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Activity | Kyoty',
};

export default async function ActivityPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="border-b border-neutral-200 bg-[radial-gradient(circle_at_top_right,_rgba(129,140,248,0.16),_transparent_25%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
                                <Activity size={15} />
                                Stay in the loop
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                                Activity
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                                Your notifications, updates, and recent activity across Kyoty communities.
                            </p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="hidden items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-primary-300 hover:text-primary-600 sm:inline-flex"
                        >
                            Dashboard
                            <ArrowRight size={15} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Notifications section */}
                    <section>
                        <div className="mb-5 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                                <Bell size={16} className="text-primary-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-neutral-900">
                                Notifications
                            </h2>
                        </div>
                        <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white px-6 py-12 text-center shadow-sm">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                                <Bell size={24} className="text-primary-400" />
                            </div>
                            <h3 className="text-base font-semibold text-neutral-900">
                                No notifications yet
                            </h3>
                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                                When communities you follow post updates, or events you registered for have changes, you&apos;ll see them here.
                            </p>
                        </div>
                    </section>

                    {/* Recent Activity section */}
                    <section>
                        <div className="mb-5 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                                <Clock size={16} className="text-primary-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-neutral-900">
                                Recent Activity
                            </h2>
                        </div>
                        <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white px-6 py-12 text-center shadow-sm">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                                <Clock size={24} className="text-primary-400" />
                            </div>
                            <h3 className="text-base font-semibold text-neutral-900">
                                Your activity feed is coming soon
                            </h3>
                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                                We&apos;re building a timeline of your interactions -- event RSVPs, community posts, comments, and more will show up here.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Full-width coming soon banner */}
                <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
                    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100">
                            <Activity size={22} className="text-primary-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base font-semibold text-neutral-900">
                                Activity feed in development
                            </h3>
                            <p className="mt-1 text-sm text-neutral-500">
                                Real-time notifications, digest emails, and a complete activity timeline are on the roadmap. In the meantime, explore communities and events to get started.
                            </p>
                        </div>
                        <Link
                            href="/explore"
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                        >
                            Explore events
                            <ArrowRight size={15} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
