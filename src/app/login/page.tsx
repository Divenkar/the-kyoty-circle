'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    ArrowLeft,
    CalendarRange,
    CheckCircle2,
    Eye,
    EyeOff,
    MessageSquare,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import { useSignIn, useSignUp } from '@clerk/nextjs/legacy';
import { useUser } from '@clerk/nextjs';

type AuthMode = 'signin' | 'signup';

const DEFAULT_INTENT = {
    eyebrow: 'Join trusted communities',
    title: 'Your next real-world circle starts here.',
    body: 'Create an account to RSVP, save events, chat with members, and build your offline social life around shared interests.',
    badge: 'Verified hosts, curated events, real communities',
};

const INTENT_COPY: Record<string, typeof DEFAULT_INTENT> = {
    rsvp: {
        eyebrow: 'Complete your RSVP',
        title: 'Sign in to lock in your spot.',
        body: 'Create an account to RSVP, see updates, and return to this event right after you sign in.',
        badge: 'Event access unlocks after sign in',
    },
    save: {
        eyebrow: 'Save this for later',
        title: 'Keep the best events on your radar.',
        body: 'Create an account to bookmark events, compare plans, and come back when you are ready to join.',
        badge: 'Saved events live in your dashboard',
    },
    join: {
        eyebrow: 'Join a community',
        title: 'Start with communities that fit you.',
        body: 'Create an account to apply, introduce yourself, and build trust before your first meetup.',
        badge: 'Community approvals work better with a complete profile',
    },
    chat: {
        eyebrow: 'Enter the conversation',
        title: 'Sign in to join community chat.',
        body: 'Create an account to message members, follow updates, and stay in sync with upcoming plans.',
        badge: 'Chat opens after sign in',
    },
    host: {
        eyebrow: 'Start something meaningful',
        title: 'Create a community people trust.',
        body: 'Set up your account to launch a community, host events, and build a stronger local circle.',
        badge: 'Hosts stand out with social proof and a complete profile',
    },
};

const VALUE_CARDS = [
    {
        icon: ShieldCheck,
        title: 'Know who is hosting',
        desc: 'Kyoty is built around verified people and community reputation, not anonymous listings.',
    },
    {
        icon: Users,
        title: 'Belong somewhere real',
        desc: 'Join recurring circles with shared interests instead of one-off events that go nowhere.',
    },
    {
        icon: CalendarRange,
        title: 'See what happens next',
        desc: 'Save plans, RSVP quickly, and keep your communities, chats, and events in one place.',
    },
];

const PREVIEW_ITEMS = [
    { icon: Sparkles, label: 'Curated communities', value: 'Apply to thoughtful circles in your city' },
    { icon: MessageSquare, label: 'Member chat', value: 'Stay close to plans, updates, and people' },
    { icon: CheckCircle2, label: 'Trusted discovery', value: 'Browse events with more context before you go' },
];

function LoginPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mode, setMode] = useState<AuthMode>(searchParams.get('mode') === 'signup' ? 'signup' : 'signin');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmationEmail, setConfirmationEmail] = useState('');

    const rawNext = searchParams.get('next') ?? '';
    const intent = searchParams.get('intent') ?? '';
    const errorParam = searchParams.get('error');
    const next = rawNext.startsWith('/') ? rawNext : '';
    const copy = useMemo(() => INTENT_COPY[intent] ?? DEFAULT_INTENT, [intent]);

    const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
    const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
    const { isSignedIn, isLoaded: userLoaded } = useUser();

    useEffect(() => {
        if (errorParam) toast.error(errorParam);
    }, [errorParam]);

    // Redirect already signed-in users
    useEffect(() => {
        if (userLoaded && isSignedIn) {
            router.replace(next || '/dashboard');
        }
    }, [userLoaded, isSignedIn, next, router]);

    if (!userLoaded || isSignedIn) {
        return (
            <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f5f1ea]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            </div>
        );
    }

    const isSignUp = mode === 'signup';

    const handleOAuth = async () => {
        if (!signInLoaded) return;
        try {
            await signIn.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/sso-callback',
                redirectUrlComplete: next || '/dashboard',
            });
        } catch (err: any) {
            toast.error(err.errors?.[0]?.message || 'Google sign-in failed.');
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signInLoaded || !signUpLoaded) return;
        setLoading(true);

        try {
            if (isSignUp) {
                const result = await signUp.create({
                    emailAddress: email,
                    password,
                    firstName: name.trim().split(' ')[0] || undefined,
                    lastName: name.trim().split(' ').slice(1).join(' ') || undefined,
                });

                if (result.status === 'complete') {
                    await setSignUpActive({ session: result.createdSessionId });
                    router.push(next || '/onboarding');
                    router.refresh();
                } else {
                    // Email verification required
                    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
                    setConfirmationEmail(email);
                    toast.success('Check your email for a verification code.');
                }
                return;
            }

            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === 'complete') {
                await setSignInActive({ session: result.createdSessionId });
                router.push(next || '/dashboard');
                router.refresh();
            }
        } catch (err: any) {
            toast.error(err.errors?.[0]?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-72px)] bg-[linear-gradient(180deg,#f5f1ea_0%,#fbf8f3_46%,#ffffff_100%)]">
            <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-12">
                <section className="relative overflow-hidden rounded-[2rem] border border-[#e7dbc8] bg-[radial-gradient(circle_at_top_left,_rgba(216,119,6,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(29,78,216,0.14),_transparent_28%),linear-gradient(135deg,#1f2937_0%,#25314a_54%,#60411f_100%)] p-8 text-white shadow-[0_30px_80px_rgba(31,41,55,0.18)] sm:p-10">
                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/75 transition hover:text-white">
                            <ArrowLeft size={16} />
                            Back to home
                        </Link>

                        <div className="mt-10 max-w-xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">{copy.eyebrow}</p>
                            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">{copy.title}</h1>
                            <p className="mt-5 text-base leading-8 text-white/80 sm:text-lg">{copy.body}</p>
                        </div>

                        <div className="mt-8 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur">
                            {copy.badge}
                        </div>

                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            {PREVIEW_ITEMS.map((item) => (
                                <div key={item.label} className="rounded-[1.5rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                                    <item.icon size={18} className="text-amber-200" />
                                    <p className="mt-4 text-sm font-semibold">{item.label}</p>
                                    <p className="mt-2 text-sm leading-6 text-white/75">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 rounded-[1.5rem] border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-white">What changes after you join</p>
                                    <p className="mt-1 text-sm text-white/70">You can save events, chat with members, and keep your city feed personalized.</p>
                                </div>
                                <div className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                                    Trust-first
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-lg">
                    <div className="rounded-[2rem] border border-[#eadfce] bg-white/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                        {confirmationEmail ? (
                            <div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                    <CheckCircle2 size={26} />
                                </div>
                                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Check your inbox</p>
                                <h2 className="mt-3 font-serif text-3xl font-semibold text-neutral-900">Confirm your account to continue.</h2>
                                <p className="mt-4 text-sm leading-7 text-neutral-600">
                                    We sent a confirmation link to <span className="font-semibold text-neutral-900">{confirmationEmail}</span>.
                                    Once you confirm, we will guide you through a short welcome setup and bring you back to Kyoty.
                                </p>
                                <div className="mt-8 rounded-2xl bg-[#f7f2ea] p-4 text-sm text-neutral-700">
                                    After confirmation you will choose your city, pick interests, and decide whether to add social proof now or later.
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setConfirmationEmail('')}
                                    className="mt-6 text-sm font-medium text-primary-600 transition hover:text-primary-700"
                                >
                                    Use a different email
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-600">
                                            {isSignUp ? 'Create account' : 'Welcome back'}
                                        </p>
                                        <h2 className="mt-3 font-serif text-3xl font-semibold text-neutral-900">
                                            {isSignUp ? 'Join Kyoty in under a minute.' : 'Pick up where you left off.'}
                                        </h2>
                                        <p className="mt-3 text-sm leading-7 text-neutral-600">
                                            {isSignUp
                                                ? 'Set up your account now. You will personalize the experience right after this step.'
                                                : 'Sign in to access your communities, RSVPs, saved events, and conversations.'}
                                        </p>
                                    </div>

                                    <div className="rounded-full bg-neutral-100 p-1">
                                        <button
                                            type="button"
                                            onClick={() => setMode('signin')}
                                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${!isSignUp ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}`}
                                        >
                                            Sign in
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMode('signup')}
                                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${isSignUp ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}`}
                                        >
                                            Sign up
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleOAuth}
                                    className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-neutral-300 bg-white px-4 py-3.5 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-50"
                                >
                                    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </button>

                                <div className="my-6 flex items-center gap-3">
                                    <div className="h-px flex-1 bg-neutral-200" />
                                    <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">or with email</span>
                                    <div className="h-px flex-1 bg-neutral-200" />
                                </div>

                                <form onSubmit={handleAuth} className="space-y-4">
                                    {isSignUp && (
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                                                Full name
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="mt-1.5 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3.5 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
                                                placeholder="Your name"
                                                autoComplete="name"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                                            Email address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="mt-1.5 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3.5 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
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
                                                <Link href="/forgot-password" className="text-xs font-medium text-primary-600 hover:text-primary-700">
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
                                                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3.5 pr-12 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
                                                placeholder={isSignUp ? 'At least 8 characters' : 'Enter your password'}
                                                required
                                                minLength={8}
                                                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((current) => !current)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-600"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full rounded-2xl bg-primary-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loading
                                            ? (isSignUp ? 'Creating account...' : 'Signing in...')
                                            : (isSignUp ? 'Create account' : 'Sign in')}
                                    </button>
                                </form>

                                <div className="mt-8 grid gap-3">
                                    {VALUE_CARDS.map((item) => (
                                        <div key={item.title} className="flex items-start gap-4 rounded-2xl bg-[#faf5ee] p-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-sm">
                                                <item.icon size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                                                <p className="mt-1 text-sm leading-6 text-neutral-600">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

function LoginPageFallback() {
    return (
        <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f5f1ea]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginPageFallback />}>
            <LoginPageContent />
        </Suspense>
    );
}
