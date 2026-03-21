import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { Users } from 'lucide-react';
import { CommunityRowActions } from './CommunityRowActions';

const STATUS_COLOR: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
    disabled: 'bg-neutral-100 text-neutral-500',
};

export default async function AdminCommunitiesPage() {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'kyoty_admin' && user.role !== 'admin')) redirect('/dashboard');

    const communities = await CommunityRepository.findAllForAdmin();

    const counts = communities.reduce<Record<string, number>>((acc, c) => {
        acc[c.status] = (acc[c.status] ?? 0) + 1;
        return acc;
    }, {});

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Communities</h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                    {communities.length} total &mdash;&nbsp;
                    {counts.active ?? 0} active,&nbsp;
                    {counts.pending ?? 0} pending,&nbsp;
                    {counts.disabled ?? 0} disabled
                </p>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                <th className="px-5 py-3">Community</th>
                                <th className="px-5 py-3">Category</th>
                                <th className="px-5 py-3">City</th>
                                <th className="px-5 py-3">Members</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Created</th>
                                <th className="px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {communities.map(c => (
                                <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div>
                                            <p className="font-medium text-neutral-800">{c.name}</p>
                                            <p className="text-xs text-neutral-400">{c.slug}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-neutral-600">{c.category}</td>
                                    <td className="px-5 py-3.5 text-neutral-600">{c.city_name ?? '—'}</td>
                                    <td className="px-5 py-3.5">
                                        <span className="flex items-center gap-1 text-neutral-600">
                                            <Users size={13} />
                                            {c.member_count}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLOR[c.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-neutral-500">
                                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <CommunityRowActions
                                            communityId={c.id}
                                            slug={c.slug}
                                            status={c.status}
                                        />
                                    </td>
                                </tr>
                            ))}
                            {communities.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-sm text-neutral-400">
                                        No communities found.
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
