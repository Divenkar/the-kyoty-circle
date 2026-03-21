import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { createClient } from '@/utils/supabase/server';
import type { User } from '@/types';
import { UserRoleSelect } from './UserRoleSelect';

const ROLE_COLOR: Record<string, string> = {
    participant: 'bg-neutral-100 text-neutral-600',
    community_admin: 'bg-blue-100 text-blue-700',
    admin: 'bg-violet-100 text-violet-700',
    kyoty_admin: 'bg-primary-100 text-primary-700',
};

export default async function AdminUsersPage() {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'kyoty_admin' && user.role !== 'admin')) redirect('/dashboard');

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('kyoty_users')
        .select('*')
        .order('created_at', { ascending: false });

    const users: User[] = error ? [] : (data as User[]);

    const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
        acc[u.role] = (acc[u.role] ?? 0) + 1;
        return acc;
    }, {});

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Users</h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                    {users.length} total &mdash;&nbsp;
                    {roleCounts.kyoty_admin ?? 0} kyoty admins,&nbsp;
                    {roleCounts.admin ?? 0} admins,&nbsp;
                    {roleCounts.community_admin ?? 0} community admins,&nbsp;
                    {roleCounts.participant ?? 0} participants
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                <th className="px-5 py-3">User</th>
                                <th className="px-5 py-3">Verification</th>
                                <th className="px-5 py-3">Social Proof</th>
                                <th className="px-5 py-3">Joined</th>
                                <th className="px-5 py-3">Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700 shrink-0">
                                                {u.name?.[0]?.toUpperCase() ?? '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-neutral-800 truncate">{u.name}</p>
                                                <p className="text-xs text-neutral-400 truncate">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                                            u.verification_status === 'verified'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-neutral-100 text-neutral-500'
                                        }`}>
                                            {u.verification_status ?? 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-neutral-500 capitalize text-xs">
                                        {u.social_proof_type
                                            ? (
                                                <a
                                                    href={u.social_proof_link ?? '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary-600 hover:underline"
                                                >
                                                    {u.social_proof_type}
                                                </a>
                                            )
                                            : '—'}
                                    </td>
                                    <td className="px-5 py-3.5 text-neutral-500 text-xs">
                                        {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <UserRoleSelect
                                            userId={u.id}
                                            currentRole={u.role}
                                            isSelf={u.id === user.id}
                                        />
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-sm text-neutral-400">
                                        No users found.
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
