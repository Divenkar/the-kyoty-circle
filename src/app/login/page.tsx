'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Shield, Sparkles, Users } from 'lucide-react';

const VALUE_PROPS = [
    {
        icon: Shield,
        title: 'Verified hosts only',
        desc: 'Every organizer is backed by LinkedIn or Instagram — you always know who is running the event.',
    },
    {
        icon: Users,
        title: 'Real communities',
        desc: 'Join members-only circles built around shared interests, not just random event listings.',
    },
    {
        icon: Sparkles,
        title: 'Curated experiences',
        desc: 'Admin-reviewed events mean higher quality, safer meetups you can actually look forward to.',
    },
];

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                router.replace('/dashboard');
            } else {
                setChecking(false);
            }
        });
    }, [router]);

    if (checking) {
        return (
            <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-neutral-50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            </div>
        );
    }

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (signUpError) throw signUpError;
                toast.success('Check your email for the confirmation link to activate your account.', { duration: 6000 });
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-72px)] bg-neutral-50">
            {/* Left panel — visible on large screens */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.2),_transparent_40%),linear-gradient(135deg,#1e1b4b_0%,#312e81_55%,#4338ca_100%)] px-10 py-12 text-white shrink-0">
                <div>
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-primary-200 transition-colors hover:text-white">
                        <ArrowLeft size={16} />
                        Back to Kyoty
                    </Link>
                </div>

                <div>
                    <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                        <span className="text-2xl font-extrabold">K</span>
                    </div>
                    <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
                        {isSignUp ? 'Join a community of real people.' : 'Welcome back to Kyoty.'}
                    </h2>
                    <p className="mt-4 text-base leading-7 text-primary-100/80">
                        {isSignUp
                            ? 'Create your account and start discovering verified communities and events in your city.'
                            : 'Sign in to access your communities, upcoming events, and dashboard.'}
                    </p>

                    <div className="mt-10 space-y-6">
                        {VALUE_PROPS.map((prop) => (
                            <div key={prop.title} className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                                    <prop.icon size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{prop.title}</p>
                                    <p className="mt-1 text-sm leading-6 text-primary-100/75">{prop.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-4">
                    <CheckCircle size={18} className="shrink-0 text-green-300" />
                    <p className="text-sm text-primary-100/80">
                        All organizers are manually verified before their communities go live.
                    </p>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
                {/* Mobile back link */}
                <div className="mb-6 w-full max-w-sm lg:hidden">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900">
                        <ArrowLeft size={16} />
                        Back to home
                    </Link>
                </div>

                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="mb-8 text-center lg:hidden">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg">
                            <span className="text-xl font-extrabold text-white">K</span>
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900">Welcome to Kyoty</h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            {isSignUp ? 'Create your account to get started' : 'Sign in to your account'}
                        </p>
                    </div>

                    {/* Desktop heading */}
                    <div className="mb-8 hidden lg:block">
                        <h1 className="text-2xl font-bold text-neutral-900">
                            {isSignUp ? 'Create your account' : 'Sign in to your account'}
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            {isSignUp
                                ? 'Already have an account?'
                                : "Don't have an account?"}{' '}
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="font-medium text-primary-600 hover:text-primary-700"
                            >
                                {isSignUp ? 'Sign in' : 'Create one'}
                            </button>
                        </p>
                    </div>

                    {/* Google OAuth */}
                    <button
                        type="button"
                        onClick={() => supabase.auth.signInWithOAuth({
                            provider: 'google',
                            options: { redirectTo: `${window.location.origin}/auth/callback` },
                        })}
                        className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>

                    <div className="relative mb-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-neutral-200" />
                        <span className="text-xs text-neutral-400">or</span>
                        <div className="h-px flex-1 bg-neutral-200" />
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                placeholder="name@example.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                                    Password
                                </label>
                                {!isSignUp && (
                                    <Link href="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 hover:underline">
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <div className="relative mt-1.5">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 pr-11 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                    placeholder="••••••••"
                                    required
                                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? (isSignUp ? 'Creating account...' : 'Signing in...')
                                : (isSignUp ? 'Create account' : 'Sign in')}
                        </button>
                    </form>

                    {/* Mobile toggle */}
                    <div className="mt-6 text-center lg:hidden">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm text-neutral-500"
                        >
                            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                            <span className="font-medium text-primary-600 hover:text-primary-700">
                                {isSignUp ? 'Sign in' : 'Sign up'}
                            </span>
                        </button>
                    </div>

                    <p className="mt-8 text-center text-xs text-neutral-400">
                        By continuing, you agree to Kyoty&apos;s terms of service and privacy policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
