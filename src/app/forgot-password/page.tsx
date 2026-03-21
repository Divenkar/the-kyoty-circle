'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        setLoading(false);
        if (error) {
            toast.error(error.message);
        } else {
            setSent(true);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-neutral-50 px-4">
            <div className="w-full max-w-sm">
                <Link
                    href="/login"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                >
                    <ArrowLeft size={16} />
                    Back to sign in
                </Link>

                <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100">
                        <Mail size={26} className="text-primary-600" />
                    </div>

                    {sent ? (
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900">Check your email</h1>
                            <p className="mt-3 text-sm leading-6 text-neutral-500">
                                We sent a password reset link to <span className="font-medium text-neutral-700">{email}</span>.
                                Check your inbox and follow the link to set a new password.
                            </p>
                            <p className="mt-4 text-xs text-neutral-400">
                                Didn&apos;t receive it? Check your spam folder or{' '}
                                <button
                                    type="button"
                                    onClick={() => setSent(false)}
                                    className="font-medium text-primary-600 hover:underline"
                                >
                                    try again
                                </button>
                                .
                            </p>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-neutral-900">Forgot your password?</h1>
                            <p className="mt-2 text-sm leading-6 text-neutral-500">
                                Enter your email and we&apos;ll send you a link to reset your password.
                            </p>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        placeholder="name@example.com"
                                        className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? 'Sending…' : 'Send reset link'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
