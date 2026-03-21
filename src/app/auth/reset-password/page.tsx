'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [exchanging, setExchanging] = useState(true);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // Supabase sends the user to this page with ?code=xxx (PKCE flow)
        const code = searchParams.get('code');
        if (code) {
            supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
                if (error) {
                    toast.error('Reset link is invalid or has expired. Please request a new one.');
                    router.replace('/forgot-password');
                } else {
                    setReady(true);
                }
                setExchanging(false);
            });
        } else {
            // No code — might be an old-style hash link; just show the form if a session exists
            supabase.auth.getSession().then(({ data }) => {
                if (data.session) {
                    setReady(true);
                } else {
                    toast.error('Reset link is invalid or has expired.');
                    router.replace('/forgot-password');
                }
                setExchanging(false);
            });
        }
    }, [router, searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            toast.error('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Password updated! Signing you in…');
            router.replace('/dashboard');
        }
    };

    if (exchanging) {
        return (
            <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-neutral-50">
                <Loader2 size={28} className="animate-spin text-primary-600" />
            </div>
        );
    }

    if (!ready) return null;

    return (
        <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-neutral-50 px-4">
            <div className="w-full max-w-sm">
                <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100">
                        <KeyRound size={26} className="text-primary-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-neutral-900">Set a new password</h1>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                        Choose a strong password you haven&apos;t used before.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                                New password
                            </label>
                            <div className="relative mt-1.5">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    placeholder="Min. 6 characters"
                                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 pr-11 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirm" className="block text-sm font-medium text-neutral-700">
                                Confirm password
                            </label>
                            <input
                                id="confirm"
                                type={showPassword ? 'text' : 'password'}
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                                autoComplete="new-password"
                                placeholder="Repeat your password"
                                className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? <Loader2 size={16} className="mx-auto animate-spin" /> : 'Update password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    );
}
