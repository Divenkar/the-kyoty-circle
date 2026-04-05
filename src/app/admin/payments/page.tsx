import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { IndianRupee, TrendingUp, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
    captured: 'bg-green-100 text-green-700',
    refunded: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-600',
};

export default async function AdminPaymentsPage() {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'kyoty_admin' && user.role !== 'admin')) redirect('/dashboard');

    const supabase = await createClient();
    const { data: payments, error } = await supabase
        .from('payments')
        .select('*, kyoty_users(id, name, email), events(id, title)')
        .order('created_at', { ascending: false });

    if (error) console.error('[admin] payments fetch error:', error.message);

    const allPayments = payments ?? [];

    const statusCounts = allPayments.reduce<Record<string, number>>((acc, p: any) => {
        acc[p.status] = (acc[p.status] ?? 0) + 1;
        return acc;
    }, {});

    const totalCaptured = allPayments
        .filter((p: any) => p.status === 'captured')
        .reduce((sum: number, p: any) => sum + (p.amount_paise || 0), 0);

    const totalRefunded = allPayments
        .filter((p: any) => p.status === 'refunded')
        .reduce((sum: number, p: any) => sum + (p.amount_paise || 0), 0);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                    <IndianRupee size={20} className="text-green-600" />
                    Payments
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                    {allPayments.length} total transactions
                </p>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-green-50 rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 text-green-600 mb-2">
                        <TrendingUp size={14} />
                    </div>
                    <p className="text-2xl font-bold text-green-700">₹{(totalCaptured / 100).toLocaleString()}</p>
                    <p className="text-xs text-green-600/70 mt-0.5">Total Revenue</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 text-amber-600 mb-2">
                        <RefreshCw size={14} />
                    </div>
                    <p className="text-2xl font-bold text-amber-700">₹{(totalRefunded / 100).toLocaleString()}</p>
                    <p className="text-xs text-amber-600/70 mt-0.5">Total Refunded</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 text-blue-600 mb-2">
                        <CheckCircle size={14} />
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{statusCounts.captured ?? 0}</p>
                    <p className="text-xs text-blue-600/70 mt-0.5">Successful</p>
                </div>
                <div className="bg-red-50 rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 text-red-600 mb-2">
                        <AlertCircle size={14} />
                    </div>
                    <p className="text-2xl font-bold text-red-700">{statusCounts.failed ?? 0}</p>
                    <p className="text-xs text-red-600/70 mt-0.5">Failed</p>
                </div>
            </div>

            {/* Payments Table */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                <th className="px-5 py-3">Payment ID</th>
                                <th className="px-5 py-3">User</th>
                                <th className="px-5 py-3">Event</th>
                                <th className="px-5 py-3">Amount</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {allPayments.map((p: any) => (
                                <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-mono text-neutral-600">{p.razorpay_payment_id}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {p.kyoty_users ? (
                                            <Link href={`/admin/user/${p.kyoty_users.id}`} className="hover:text-primary-600 transition-colors">
                                                <p className="font-medium text-neutral-800 text-xs">{p.kyoty_users.name}</p>
                                                <p className="text-xs text-neutral-400">{p.kyoty_users.email}</p>
                                            </Link>
                                        ) : (
                                            <span className="text-neutral-400 text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {p.events ? (
                                            <Link href={`/admin/event/${p.events.id}`} className="text-primary-600 hover:underline text-xs">
                                                {p.events.title}
                                            </Link>
                                        ) : (
                                            <span className="text-neutral-400 text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 font-medium text-neutral-800">
                                        ₹{((p.amount_paise || 0) / 100).toLocaleString()}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLOR[p.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-neutral-500 text-xs whitespace-nowrap">
                                        {new Date(p.created_at).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: '2-digit',
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </td>
                                </tr>
                            ))}
                            {allPayments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-sm text-neutral-400">
                                        No payments recorded yet.
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
