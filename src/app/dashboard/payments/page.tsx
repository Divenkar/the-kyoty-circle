import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import {
    IndianRupee, ChevronRight, Calendar, Ticket,
    CheckCircle, RefreshCw, AlertCircle,
} from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
    captured: 'bg-green-100 text-green-700',
    refunded: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-600',
};

export default async function DashboardPaymentsPage() {
    const user = await getCurrentUser();
    if (!user) redirect('/login');
    if (!user.onboarding_completed) redirect('/onboarding');

    const supabase = await createClient();
    const { data: payments, error } = await supabase
        .from('payments')
        .select('*, events(id, title, date)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) console.error('[dashboard] payments fetch error:', error.message);

    const allPayments = payments ?? [];

    const totalSpent = allPayments
        .filter((p: any) => p.status === 'captured')
        .reduce((sum: number, p: any) => sum + (p.amount_paise || 0), 0);

    const totalRefunded = allPayments
        .filter((p: any) => p.status === 'refunded')
        .reduce((sum: number, p: any) => sum + (p.amount_paise || 0), 0);

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
                            Dashboard
                        </Link>
                        <ChevronRight size={13} className="text-neutral-300" />
                        <span className="text-sm font-medium text-neutral-900">Payments</span>
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <IndianRupee size={20} className="text-green-600" />
                        Payment History
                    </h1>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 text-green-600 mb-1"><CheckCircle size={14} /></div>
                        <p className="text-xl font-bold text-green-700">₹{(totalSpent / 100).toLocaleString()}</p>
                        <p className="text-xs text-green-600/70 mt-0.5">Total Spent</p>
                    </div>
                    <div className="bg-amber-50 rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 text-amber-600 mb-1"><RefreshCw size={14} /></div>
                        <p className="text-xl font-bold text-amber-700">₹{(totalRefunded / 100).toLocaleString()}</p>
                        <p className="text-xs text-amber-600/70 mt-0.5">Total Refunded</p>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 text-blue-600 mb-1"><Ticket size={14} /></div>
                        <p className="text-xl font-bold text-blue-700">{allPayments.filter((p: any) => p.status === 'captured').length}</p>
                        <p className="text-xs text-blue-600/70 mt-0.5">Tickets Purchased</p>
                    </div>
                </div>

                {/* Payments List */}
                {allPayments.length > 0 ? (
                    <div className="space-y-3">
                        {allPayments.map((p: any) => {
                            const event = p.events;
                            return (
                                <div key={p.id} className="bg-white border border-neutral-200 rounded-2xl p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                p.status === 'captured' ? 'bg-green-50 text-green-600'
                                                : p.status === 'refunded' ? 'bg-amber-50 text-amber-600'
                                                : 'bg-red-50 text-red-600'
                                            }`}>
                                                {p.status === 'captured' ? <CheckCircle size={18} />
                                                : p.status === 'refunded' ? <RefreshCw size={18} />
                                                : <AlertCircle size={18} />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-neutral-800">
                                                        ₹{((p.amount_paise || 0) / 100).toLocaleString()}
                                                    </p>
                                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_COLOR[p.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                                                        {p.status}
                                                    </span>
                                                </div>
                                                {event && (
                                                    <Link href={`/event/${event.id}`} className="text-xs text-primary-600 hover:underline truncate block">
                                                        {event.title}
                                                    </Link>
                                                )}
                                                <p className="text-xs text-neutral-400 mt-0.5">
                                                    {new Date(p.created_at).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        {event && (
                                            <Link
                                                href={`/event/${event.id}/ticket`}
                                                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors"
                                            >
                                                <Ticket size={13} /> View ticket
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white border border-dashed border-neutral-300 rounded-2xl py-12 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100">
                            <IndianRupee size={22} className="text-neutral-400" />
                        </div>
                        <p className="text-sm font-medium text-neutral-600">No payment history</p>
                        <p className="mt-1 text-xs text-neutral-400">
                            Payments for event tickets will appear here.
                        </p>
                        <Link
                            href="/explore"
                            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-primary-300"
                        >
                            <Calendar size={14} />
                            Explore events
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
