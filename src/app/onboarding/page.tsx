'use client';

import React, { Suspense, useMemo, useState } from 'react';
import {
    completeOnboardingAction,
    submitSocialProofAction,
    updateCityAction,
    updateInterestTagsAction,
} from '@/server/actions/onboarding.actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    ChevronRight,
    Flag,
    HeartHandshake,
    Instagram,
    Linkedin,
    MapPin,
    Shield,
    Sparkles,
    Users,
} from 'lucide-react';
import { INTEREST_TAG_OPTIONS, MAX_INTEREST_TAGS } from '@/lib/interest-options';

const CITIES = ['Noida', 'Delhi', 'Gurgaon', 'Bangalore'];

const STEP_LABELS = ['Welcome', 'City', 'Interests', 'Trust', 'Finish'];

type Step = 1 | 2 | 3 | 4 | 5;

function OnboardingPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rawNext = searchParams.get('next') ?? '';
    const next = rawNext.startsWith('/') ? rawNext : '';

    const [step, setStep] = useState<Step>(1);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [socialType, setSocialType] = useState<'linkedin' | 'instagram' | ''>('');
    const [socialLink, setSocialLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const selectedCountLabel = useMemo(
        () => `${selectedInterests.length}/${MAX_INTEREST_TAGS} selected`,
        [selectedInterests.length],
    );

    const toggleInterest = (interest: string) => {
        setSelectedInterests((current) => {
            if (current.includes(interest)) {
                return current.filter((item) => item !== interest);
            }

            if (current.length >= MAX_INTEREST_TAGS) return current;
            return [...current, interest];
        });
    };

    const saveInterests = async () => {
        const result = await updateInterestTagsAction(selectedInterests);
        if (!result.success) {
            toast.error(result.error || 'Could not save interests.');
        }
    };

    const handleContinueFromWelcome = () => setStep(2);

    const handleCityContinue = async () => {
        setLoading(true);
        setError('');

        if (selectedCity) {
            const result = await updateCityAction(selectedCity);
            if (!result.success) {
                toast.error(result.error || 'Could not save your city.');
            }
        }

        setLoading(false);
        setStep(3);
    };

    const handleInterestsContinue = async () => {
        setLoading(true);
        setError('');
        await saveInterests();
        setLoading(false);
        setStep(4);
    };

    const handleTrustContinue = async (skip = false) => {
        setLoading(true);
        setError('');

        if (!skip) {
            if (!socialType || !socialLink) {
                setError('Choose a platform and add your profile link, or skip this step for now.');
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('social_proof_type', socialType);
            formData.append('social_proof_link', socialLink);
            const result = await submitSocialProofAction(formData);

            if (!result.success) {
                setError(result.error || 'Could not save your profile link.');
                setLoading(false);
                return;
            }
        }

        setLoading(false);
        setStep(5);
    };

    const finishOnboarding = async (destination: string) => {
        setLoading(true);
        const result = await completeOnboardingAction();
        setLoading(false);

        if (!result.success) {
            toast.error(result.error || 'Could not finish onboarding.');
            return;
        }

        router.push(destination);
    };

    const primaryDestination = next || (selectedCity ? `/communities?city=${encodeURIComponent(selectedCity)}` : '/communities');

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f8f4ec_48%,#f5f7fb_100%)]">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                    <section className="rounded-[2rem] border border-[#e8dece] bg-[radial-gradient(circle_at_top_left,_rgba(234,179,8,0.16),_transparent_34%),linear-gradient(180deg,#ffffff_0%,#faf5ec_100%)] p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-600">Welcome to Kyoty</p>
                        <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-neutral-900">
                            Build a better starting point before your first event.
                        </h1>
                        <p className="mt-4 text-sm leading-7 text-neutral-600">
                            We only need a few details to shape your feed, explain how trust works, and help you land in the right community faster.
                        </p>

                        <div className="mt-8 space-y-3">
                            {[
                                {
                                    icon: Sparkles,
                                    title: 'Discover faster',
                                    body: 'Your city and interests help us show better communities and events first.',
                                },
                                {
                                    icon: HeartHandshake,
                                    title: 'Join with confidence',
                                    body: 'Social proof is optional, but it can help communities trust you sooner.',
                                },
                                {
                                    icon: Flag,
                                    title: 'Choose your next move',
                                    body: 'Finish by browsing communities, exploring events, or starting one of your own.',
                                },
                            ].map((item) => (
                                <div key={item.title} className="flex items-start gap-4 rounded-2xl bg-white/80 p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                                        <item.icon size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                                        <p className="mt-1 text-sm leading-6 text-neutral-600">{item.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex items-center gap-2">
                            {STEP_LABELS.map((label, index) => {
                                const stepNumber = index + 1;
                                const active = step === stepNumber;
                                const complete = step > stepNumber;

                                return (
                                    <React.Fragment key={label}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                                                    complete
                                                        ? 'bg-emerald-500 text-white'
                                                        : active
                                                            ? 'bg-primary-600 text-white'
                                                            : 'bg-neutral-200 text-neutral-500'
                                                }`}
                                            >
                                                {complete ? <CheckCircle2 size={16} /> : stepNumber}
                                            </div>
                                        </div>
                                        {stepNumber < STEP_LABELS.length && (
                                            <div className={`h-px flex-1 ${step > stepNumber ? 'bg-emerald-400' : 'bg-neutral-200'}`} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-neutral-400">{STEP_LABELS[step - 1]}</p>
                    </section>

                    <section className="rounded-[2rem] border border-[#e8dece] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8">
                        {step === 1 && (
                            <div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                                    <Sparkles size={26} />
                                </div>
                                <h2 className="mt-6 font-serif text-3xl font-semibold text-neutral-900">Let&apos;s make Kyoty feel personal.</h2>
                                <p className="mt-4 text-sm leading-7 text-neutral-600">
                                    Before we send you into the product, we&apos;ll tailor your city feed, collect a few interests, and explain how trust works here.
                                </p>

                                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                    {[
                                        'Choose your city',
                                        'Pick a few interests',
                                        'Add social proof now or later',
                                    ].map((item) => (
                                        <div key={item} className="rounded-2xl bg-[#faf5ee] p-4 text-sm font-medium text-neutral-700">
                                            {item}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleContinueFromWelcome}
                                    className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                                >
                                    Set up my profile
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
                                    <MapPin size={26} />
                                </div>
                                <h2 className="mt-6 font-serif text-3xl font-semibold text-neutral-900">Pick your city</h2>
                                <p className="mt-4 text-sm leading-7 text-neutral-600">
                                    We&apos;ll personalize communities and events around where you are most likely to show up.
                                </p>

                                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                    {CITIES.map((city) => {
                                        const selected = city === selectedCity;
                                        return (
                                            <button
                                                key={city}
                                                type="button"
                                                onClick={() => setSelectedCity(city)}
                                                className={`rounded-2xl border px-5 py-4 text-left transition ${
                                                    selected
                                                        ? 'border-primary-600 bg-primary-50 shadow-sm'
                                                        : 'border-neutral-200 bg-neutral-50 hover:border-primary-300 hover:bg-white'
                                                }`}
                                            >
                                                <p className="text-sm font-semibold text-neutral-900">{city}</p>
                                                <p className="mt-1 text-xs text-neutral-500">Show me nearby communities first</p>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCityContinue}
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                                    >
                                        Continue
                                        <ArrowRight size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className="rounded-2xl px-5 py-3.5 text-sm font-medium text-neutral-500 transition hover:text-neutral-800"
                                    >
                                        Skip for now
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                                    <Users size={26} />
                                </div>
                                <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                                    <div>
                                        <h2 className="font-serif text-3xl font-semibold text-neutral-900">What are you into?</h2>
                                        <p className="mt-3 text-sm leading-7 text-neutral-600">
                                            Choose a few interests so your feed feels closer to your taste from day one.
                                        </p>
                                    </div>
                                    <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">
                                        {selectedCountLabel}
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    {INTEREST_TAG_OPTIONS.map((interest) => {
                                        const selected = selectedInterests.includes(interest);
                                        const disabled = !selected && selectedInterests.length >= MAX_INTEREST_TAGS;

                                        return (
                                            <button
                                                key={interest}
                                                type="button"
                                                onClick={() => toggleInterest(interest)}
                                                disabled={disabled}
                                                className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                                                    selected
                                                        ? 'border-primary-600 bg-primary-600 text-white'
                                                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-primary-300 hover:bg-white'
                                                } disabled:cursor-not-allowed disabled:opacity-45`}
                                            >
                                                {interest}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={handleInterestsContinue}
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                                    >
                                        Continue
                                        <ArrowRight size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(4)}
                                        className="rounded-2xl px-5 py-3.5 text-sm font-medium text-neutral-500 transition hover:text-neutral-800"
                                    >
                                        Skip for now
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                    <Shield size={26} />
                                </div>
                                <h2 className="mt-6 font-serif text-3xl font-semibold text-neutral-900">Add a trust signal</h2>
                                <p className="mt-4 text-sm leading-7 text-neutral-600">
                                    This part is optional. Sharing LinkedIn or Instagram can help communities feel more confident approving you and helps people know you&apos;re real.
                                </p>

                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => setSocialType('linkedin')}
                                        className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                                            socialType === 'linkedin'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-neutral-200 bg-neutral-50 hover:border-blue-200'
                                        }`}
                                    >
                                        <Linkedin size={18} className="text-blue-600" />
                                        <div>
                                            <p className="text-sm font-semibold text-neutral-900">LinkedIn</p>
                                            <p className="text-xs text-neutral-500">Best for professional trust</p>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSocialType('instagram')}
                                        className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                                            socialType === 'instagram'
                                                ? 'border-pink-500 bg-pink-50'
                                                : 'border-neutral-200 bg-neutral-50 hover:border-pink-200'
                                        }`}
                                    >
                                        <Instagram size={18} className="text-pink-600" />
                                        <div>
                                            <p className="text-sm font-semibold text-neutral-900">Instagram</p>
                                            <p className="text-xs text-neutral-500">Best for creator and social identity</p>
                                        </div>
                                    </button>
                                </div>

                                <div className="mt-5">
                                    <label htmlFor="social-link" className="block text-sm font-medium text-neutral-700">
                                        Profile link
                                    </label>
                                    <input
                                        id="social-link"
                                        type="url"
                                        value={socialLink}
                                        onChange={(e) => setSocialLink(e.target.value)}
                                        placeholder="https://linkedin.com/in/yourname"
                                        className="mt-1.5 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3.5 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
                                    />
                                </div>

                                <div className="mt-5 rounded-2xl bg-[#f7f3ea] p-4 text-sm leading-6 text-neutral-600">
                                    You can skip this and still use Kyoty. The tradeoff is that some private communities may review your requests more carefully.
                                </div>

                                {error && (
                                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleTrustContinue(false)}
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                                    >
                                        Save and continue
                                        <ArrowRight size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTrustContinue(true)}
                                        disabled={loading}
                                        className="rounded-2xl px-5 py-3.5 text-sm font-medium text-neutral-500 transition hover:text-neutral-800 disabled:opacity-60"
                                    >
                                        Skip this for now
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                    <CheckCircle2 size={26} />
                                </div>
                                <h2 className="mt-6 font-serif text-3xl font-semibold text-neutral-900">You&apos;re ready to explore.</h2>
                                <p className="mt-4 text-sm leading-7 text-neutral-600">
                                    Pick the path that matches what you want to do next. You can still edit your profile and trust details later from settings.
                                </p>

                                <div className="mt-8 space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => finishOnboarding(primaryDestination)}
                                        disabled={loading}
                                        className="flex w-full items-center justify-between rounded-[1.5rem] border border-primary-600 bg-primary-600 px-5 py-4 text-left text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                                    >
                                        <span className="flex items-center gap-3">
                                            <Users size={18} />
                                            {next ? 'Continue where I left off' : 'Browse communities'}
                                        </span>
                                        <ChevronRight size={18} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => finishOnboarding(selectedCity ? `/explore?city=${encodeURIComponent(selectedCity)}` : '/explore')}
                                        disabled={loading}
                                        className="flex w-full items-center justify-between rounded-[1.5rem] border border-neutral-200 bg-white px-5 py-4 text-left text-sm font-semibold text-neutral-800 transition hover:border-primary-300 disabled:opacity-60"
                                    >
                                        <span className="flex items-center gap-3">
                                            <Sparkles size={18} />
                                            Explore events
                                        </span>
                                        <ChevronRight size={18} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => finishOnboarding('/create-community')}
                                        disabled={loading}
                                        className="flex w-full items-center justify-between rounded-[1.5rem] border border-neutral-200 bg-white px-5 py-4 text-left text-sm font-semibold text-neutral-800 transition hover:border-primary-300 disabled:opacity-60"
                                    >
                                        <span className="flex items-center gap-3">
                                            <Building2 size={18} />
                                            Start a community
                                        </span>
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

function OnboardingFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fffdf8_0%,#f8f4ec_48%,#f5f7fb_100%)]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<OnboardingFallback />}>
            <OnboardingPageContent />
        </Suspense>
    );
}
