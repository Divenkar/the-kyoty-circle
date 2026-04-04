'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, KeyRound } from 'lucide-react';
import { useSignIn, useSignUp } from '@clerk/nextjs/legacy';
import { useUser } from '@clerk/nextjs';

type AuthStep = 'auth' | 'verify-email' | 'forgot' | 'reset';

function LoginPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const isSignUpMode = searchParams.get('mode') === 'signup';
    const rawNext = searchParams.get('next') ?? '';
    const errorParam = searchParams.get('error');
    const next = rawNext.startsWith('/') ? rawNext : '';

    const [isSignUp, setIsSignUp] = useState(isSignUpMode);
    const [step, setStep] = useState<AuthStep>('auth');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Verification state
    const [verificationCode, setVerificationCode] = useState('');

    // Reset password state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetCode, setResetCode] = useState('');

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
            <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-neutral-50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            </div>
        );
    }

    // ── Handlers ──────────────────────────────────────────────

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
                    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
                    setStep('verify-email');
                    toast.success('Check your email for a verification code.');
                }
                return;
            }

            const result = await signIn.create({ identifier: email, password });
            if (result.status === 'complete') {
                await setSignInActive({ session: result.createdSessionId });
                router.push(next || '/dashboard');
                router.refresh();
            }
        } catch (err: any) {
            const code = err.errors?.[0]?.code;
            if (code === 'form_password_incorrect') {
                toast.error("Wrong password. Try again or reset it.");
            } else if (code === 'form_identifier_not_found') {
                toast.error('No account with that email. Try signing up instead.');
                setIsSignUp(true);
            } else if (code === 'too_many_requests') {
                toast.error('Too many attempts. Wait a minute and try again.');
            } else {
                toast.error(err.errors?.[0]?.message || 'Something went wrong.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signUpLoaded) return;
        setLoading(true);
        try {
            const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });
            if (result.status === 'complete') {
                await setSignUpActive({ session: result.createdSessionId });
                router.push(next || '/onboarding');
                router.refresh();
            } else {
                toast.error('Verification incomplete. Please try again.');
            }
        } catch (err: any) {
            const code = err.errors?.[0]?.code;
            if (code === 'form_code_incorrect') {
                toast.error('Wrong code. Check your email and try again.');
            } else if (code === 'verification_expired') {
                toast.error('Code expired. Click "Resend" below.');
            } else {
                toast.error(err.errors?.[0]?.message || 'Verification failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!signUpLoaded) return;
        try {
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            toast.success('New code sent.');
        } catch (err: any) {
            toast.error(err.errors?.[0]?.message || 'Could not resend code.');
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signInLoaded) return;
        setLoading(true);
        try {
            await signIn.create({
                strategy: 'reset_password_email_code',
                identifier: email,
            });
            setStep('reset');
            toast.success('Reset code sent to your email.');
        } catch (err: any) {
            toast.error(err.errors?.[0]?.message || 'Could not send reset email.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signInLoaded) return;
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters.');
            return;
        }
        setLoading(true);
        try {
            const result = await signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code: resetCode,
                password: newPassword,
            });
            if (result.status === 'complete') {
                await setSignInActive({ session: result.createdSessionId });
                toast.success('Password updated!');
                router.replace(next || '/dashboard');
            }
        } catch (err: any) {
            toast.error(err.errors?.[0]?.message || 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        setStep('auth');
        setVerificationCode('');
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
    };

    // ── Render ────────────────────────────────────────────────

    return (
        <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_rgba(108,71,255,0.08),_transparent_50%)] px-4 py-8">
            <div className="w-full max-w-md">
                {/* Back to home */}
                <Link
                    href="/"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-900"
                >
                    <ArrowLeft size={16} />
                    Back to home
                </Link>

                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg shadow-neutral-900/5 sm:p-8">

                    {/* ── Step: Email verification ────────────────────── */}
                    {step === 'verify-email' && (
                        <div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                                <CheckCircle2 size={22} className="text-emerald-600" />
                            </div>
                            <h1 className="mt-4 text-xl font-bold text-neutral-900">Check your email</h1>
                            <p className="mt-2 text-sm text-neutral-500">
                                We sent a 6-digit code to <span className="font-medium text-neutral-900">{email}</span>
                            </p>

                            <form onSubmit={handleVerifyCode} className="mt-6 space-y-4">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
                                    placeholder="······"
                                    autoComplete="one-time-code"
                                    autoFocus
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading || verificationCode.length < 6}
                                    className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                                >
                                    {loading ? 'Verifying...' : 'Verify & continue'}
                                </button>
                            </form>

                            <div className="mt-4 flex items-center gap-3 text-sm">
                                <button onClick={handleResendCode} className="font-medium text-primary-600 hover:text-primary-700">
                                    Resend code
                                </button>
                                <span className="text-neutral-300">·</span>
                                <button onClick={goBack} className="text-neutral-500 hover:text-neutral-700">
                                    Use different email
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step: Forgot password (enter email) ─────────── */}
                    {step === 'forgot' && (
                        <div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                                <KeyRound size={22} className="text-primary-600" />
                            </div>
                            <h1 className="mt-4 text-xl font-bold text-neutral-900">Reset your password</h1>
                            <p className="mt-2 text-sm text-neutral-500">
                                Enter your email and we&apos;ll send a reset code.
                            </p>

                            <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                                >
                                    {loading ? 'Sending...' : 'Send reset code'}
                                </button>
                            </form>

                            <button
                                onClick={goBack}
                                className="mt-4 text-sm font-medium text-neutral-500 hover:text-neutral-700"
                            >
                                ← Back to sign in
                            </button>
                        </div>
                    )}

                    {/* ── Step: Reset password (enter code + new password) ── */}
                    {step === 'reset' && (
                        <div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                                <KeyRound size={22} className="text-primary-600" />
                            </div>
                            <h1 className="mt-4 text-xl font-bold text-neutral-900">Set new password</h1>
                            <p className="mt-2 text-sm text-neutral-500">
                                Enter the code from your email and choose a new password.
                            </p>

                            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                                <div>
                                    <label htmlFor="reset-code" className="block text-sm font-medium text-neutral-700">
                                        Reset code
                                    </label>
                                    <input
                                        id="reset-code"
                                        type="text"
                                        inputMode="numeric"
                                        value={resetCode}
                                        onChange={(e) => setResetCode(e.target.value)}
                                        required
                                        autoComplete="one-time-code"
                                        placeholder="6-digit code"
                                        className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="new-pw" className="block text-sm font-medium text-neutral-700">
                                        New password
                                    </label>
                                    <input
                                        id="new-pw"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        autoComplete="new-password"
                                        placeholder="At least 8 characters"
                                        className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirm-pw" className="block text-sm font-medium text-neutral-700">
                                        Confirm password
                                    </label>
                                    <input
                                        id="confirm-pw"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        autoComplete="new-password"
                                        placeholder="Repeat password"
                                        className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                                >
                                    {loading ? 'Updating...' : 'Update password'}
                                </button>
                            </form>

                            <button
                                onClick={goBack}
                                className="mt-4 text-sm font-medium text-neutral-500 hover:text-neutral-700"
                            >
                                ← Back to sign in
                            </button>
                        </div>
                    )}

                    {/* ── Step: Main sign in / sign up ────────────────── */}
                    {step === 'auth' && (
                        <>
                            <div className="text-center">
                                <h1 className="text-xl font-bold text-neutral-900">
                                    {isSignUp ? 'Create your account' : 'Welcome back'}
                                </h1>
                                <p className="mt-1.5 text-sm text-neutral-500">
                                    {isSignUp
                                        ? 'Join Kyoty to discover communities and events near you.'
                                        : 'Sign in to your Kyoty account.'}
                                </p>
                            </div>

                            {/* Google OAuth */}
                            <button
                                type="button"
                                onClick={handleOAuth}
                                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </button>

                            {/* Divider */}
                            <div className="my-5 flex items-center gap-3">
                                <div className="h-px flex-1 bg-neutral-200" />
                                <span className="text-xs text-neutral-400">or</span>
                                <div className="h-px flex-1 bg-neutral-200" />
                            </div>

                            {/* Email form */}
                            <form onSubmit={handleAuth} className="space-y-3">
                                {isSignUp && (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Full name"
                                        autoComplete="name"
                                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
                                    />
                                )}

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email address"
                                    required
                                    autoComplete="email"
                                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
                                />

                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={isSignUp ? 'Password (min. 8 characters)' : 'Password'}
                                        required
                                        minLength={8}
                                        autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 pr-11 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {!isSignUp && (
                                    <div className="text-right">
                                        <button
                                            type="button"
                                            onClick={() => setStep('forgot')}
                                            className="text-xs font-medium text-primary-600 hover:text-primary-700"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                                >
                                    {loading
                                        ? (isSignUp ? 'Creating account...' : 'Signing in...')
                                        : (isSignUp ? 'Create account' : 'Sign in')}
                                </button>
                            </form>

                            {/* Toggle mode */}
                            <p className="mt-5 text-center text-sm text-neutral-500">
                                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsSignUp(!isSignUp)}
                                    className="font-semibold text-primary-600 hover:text-primary-700"
                                >
                                    {isSignUp ? 'Sign in' : 'Sign up'}
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-neutral-50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    );
}
