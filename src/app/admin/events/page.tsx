import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { createClient } from '@/utils/supabase/server';
import { ExternalLink, Users } from 'lucide-react';
import Link from 'next/link';
import { EventStatusSelect } from './EventStatusSelect';
import type { KyotyEvent } from '@/types';

const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    open: 'bg-blue-100 text-blue-700',
    full: 'bg-violet-100 text-violet-700',
    completed: 'bg-neutral-100 text-neutral-600',
    cancelled: 'bg-red-100 text-red-600',
    rejected: 'bg-red-100 text-red-600',
    draft: 'bg-neutral-100 text-neutral-500',
};

export default async function AdminEventsPage() {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'kyoty_admin' && user.role !== 'admin')) redirect('/dashboard');

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('events')
        .select('*, communities(id, name, slug)')
        .order('created_at', { ascending: false });

    const events: (KyotyEvent & { communities?: { id: number; name: string; slug: string } | null })[] =
        error ? [] : (data as any[]);

    const statusCounts = events.reduce<Record<string, number>>((acc, e) => {
        acc[e.status] = (acc[e.status] ?? 0) + 1;
        return acc;
    }, {});

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Events</h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                    {events.length} total &mdash;&nbsp;
                    {statusCounts.pending ?? 0} pending,&nbsp;
                    {statusCounts.open ?? 0} open,&nbsp;
                    {statusCounts.completed ?? 0} completed
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                <th className="px-5 py-3">Event</th>
                                <th className="px-5 py-3">Community</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Capacity</th>
                                <th className="px-5 py-3">Pricing</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {events.map(e => (
                                <tr key={e.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <p className="font-medium text-neutral-800 truncate max-w-[200px]">{e.title}</p>
                                        <p className="text-xs text-neutral-400">{e.location_text}</p>
                                    </td>
                                    <td className="px-5 py-3.5 text-neutral-600">
                                        {e.communities ? (
                                            <Link
                                                href={`/community/${e.communities.slug}`}
                                                className="hover:text-primary-600 transition-colors"
                                            >
                                                {e.communities.name}
                                            </Link>
                                        ) : '—'}
                                    </td>
                                    <td className="px-5 py-3.5 text-neutral-600 text-xs whitespace-nowrap">
                                        {new Date(e.date).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: '2-digit',
                                        })}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="flex items-center gap-1 text-neutral-600 text-xs">
                                            <Users size={12} />
                                            {e.registered_count}/{e.max_participants}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-neutral-600 capitalize text-xs">
                                        {e.is_paid
                                            ? `₹${e.price_per_person ?? e.per_person_estimate ?? 0}`
                                            : 'Free'}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_COLOR[e.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                                                {e.status}
                                            </span>
                                            <EventStatusSelect eventId={e.id} currentStatus={e.status} />
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <Link
                                            href={`/event/${e.id}`}
                                            className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors inline-flex"
                                            title="View event"
                                        >
                                            <ExternalLink size={13} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {events.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-sm text-neutral-400">
                                        No events found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
