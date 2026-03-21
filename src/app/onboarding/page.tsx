'use client';

import React, { useState } from 'react';
import { submitSocialProofAction, updateCityAction, completeOnboardingAction, updateInterestTagsAction } from '@/server/actions/onboarding.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MapPin, Shield, Users, ArrowRight, CheckCircle, Linkedin, Instagram, ChevronRight } from 'lucide-react';
import { INTEREST_TAG_OPTIONS, MAX_INTEREST_TAGS } from '@/lib/interest-options';

const CITIES = ['Noida', 'Delhi', 'Gurgaon', 'Bangalore'];

const CITY_MARKS: Record<string, string> = {
    Noida: 'N',
    Delhi: 'D',
    Gurgaon: 'G',
    Bangalore: 'B',
};

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleInterest = (interest: string) => {
        setSelectedInterests((current) => {
            if (current.includes(interest)) {
                return current.filter((item) => item !== interest);
            }

            if (current.length >= MAX_INTEREST_TAGS) {
                return current;
            }

            return [...current, interest];
        });
    };

    const saveInterestTags = async () => {
        if (selectedInterests.length === 0) return;

        try {
            await updateInterestTagsAction(selectedInterests);
        } catch {
            // Non-fatal. Interests are optional.
        }
    };

    // Step 1: City selection
    const handleCitySelect = async (city: string) => {
        setSelectedCity(city);
        setLoading(true);
        setError('');
        try {
            await updateCityAction(city);
        } catch {
            // Non-fatal - continue regardless.
        }
        setLoading(false);
        setStep(2);
    };

    // Step 2: Interests + social proof
    const handleSocialProof = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        await saveInterestTags();

        const formData = new FormData(e.currentTarget);
        const result = await submitSocialProofAction(formData);
        if (result.success) {
            setStep(3);
        } else {
            const msg = result.error || 'Failed to submit';
            setError(msg);
            toast.error(msg);
        }
        setLoading(false);
    };

    const handleSkipToDiscover = async () => {
        setLoading(true);
        await saveInterestTags();
        setLoading(false);
        setStep(3);
    };

    // Step 3: Navigate away - mark onboarding done first
    const handleFinish = async () => {
        await completeOnboardingAction();
        const cityParam = selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : '';
        router.push(`/communities${cityParam}`);
    };

    const handleCreateCommunity = async () => {
        await completeOnboardingAction();
        router.push('/create-community');
    };

    const handleGoToDashboard = async () => {
        await completeOnboardingAction();
        router.push('/dashboard');
    };

    const stepLabels = ['Your city', 'Your interests', 'Discover communities'];

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200 bg-white">
                <div className="mx-auto max-w-lg px-4 py-4">
                    <div className="flex items-center gap-3">
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                            step > s
                                                ? 'bg-green-500 text-white'
                                                : step === s
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-neutral-200 text-neutral-500'
                                        }`}
                                    >
                                        {step > s ? <CheckCircle size={14} /> : s}
                                    </div>
                                    <span className={`hidden text-xs font-medium sm:block ${step === s ? 'text-neutral-900' : 'text-neutral-400'}`}>
                                        {stepLabels[s - 1]}
                                    </span>
                                </div>
                                {s < 3 && (
                                    <div className={`h-px flex-1 transition-all ${step > s ? 'bg-green-400' : 'bg-neutral-200'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex min-h-screen items-center justify-center px-4 pt-20">
                <div className="w-full max-w-lg">
                    {step === 1 && (
                        <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100">
                                <MapPin size={26} className="text-primary-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-neutral-900">Where are you based?</h1>
                            <p className="mt-2 text-sm leading-6 text-neutral-500">
                                We&apos;ll show you communities and events in your city first.
                            </p>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                {CITIES.map((city) => (
                                    <button
                                        key={city}
                                        onClick={() => handleCitySelect(city)}
                                        disabled={loading}
                                        className="flex items-center gap-3 rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 py-4 text-left transition-all hover:border-primary-400 hover:bg-primary-50 disabled:opacity-50"
                                    >
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-primary-600">
                                            {CITY_MARKS[city]}
                                        </span>
                                        <span className="text-sm font-semibold text-neutral-800">{city}</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="mt-4 w-full text-center text-xs text-neutral-400 transition-colors hover:text-neutral-600"
                            >
                                Skip for now {'->'}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
                                <Shield size={26} className="text-amber-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-neutral-900">Verify your identity</h1>
                            <p className="mt-2 text-sm leading-6 text-neutral-500">
                                Kyoty is built on trust. A verified social profile helps organisers know you&apos;re a real person.
                            </p>

                            <div className="mt-6">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-sm font-semibold text-neutral-900">Pick your interests</h2>
                                    <span className="text-xs text-neutral-400">Optional, up to {MAX_INTEREST_TAGS}</span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {INTEREST_TAG_OPTIONS.map((interest) => {
                                        const selected = selectedInterests.includes(interest);
                                        const disabled = loading || (!selected && selectedInterests.length >= MAX_INTEREST_TAGS);

                                        return (
                                            <button
                                                key={interest}
                                                type="button"
                                                onClick={() => toggleInterest(interest)}
                                                disabled={disabled}
                                                className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                                                    selected
                                                        ? 'border-primary-600 bg-primary-600 text-white'
                                                        : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-primary-300 hover:text-primary-600'
                                                } disabled:cursor-not-allowed disabled:opacity-50`}
                                            >
                                                {interest}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-5 flex gap-3">
                                <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                                    <Linkedin size={14} className="text-blue-600" />
                                    <span className="text-xs font-medium text-blue-700">LinkedIn</span>
                                </div>
                                <div className="flex items-center gap-2 rounded-xl border border-pink-100 bg-pink-50 px-3 py-2">
                                    <Instagram size={14} className="text-pink-500" />
                                    <span className="text-xs font-medium text-pink-600">Instagram</span>
                                </div>
                            </div>

                            <form onSubmit={handleSocialProof} className="mt-6 space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                                        Platform <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="social_proof_type"
                                        required
                                        defaultValue=""
                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                                    >
                                        <option value="" disabled>
                                            Select platform
                                        </option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="instagram">Instagram</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                                        Profile link <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="social_proof_link"
                                        required
                                        placeholder="https://linkedin.com/in/yourname"
                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                                    />
                                </div>

                                {error && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? 'Saving...' : (
                                        <>
                                            Continue <ArrowRight size={15} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <button
                                onClick={handleSkipToDiscover}
                                disabled={loading}
                                className="mt-4 w-full text-center text-xs text-neutral-400 transition-colors hover:text-neutral-600"
                            >
                                Skip for now {'->'}
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
                                <Users size={26} className="text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-neutral-900">You&apos;re all set!</h1>
                            <p className="mt-2 text-sm leading-6 text-neutral-500">
                                {selectedCity
                                    ? `Let's find you communities in ${selectedCity} that match your interests.`
                                    : "Let's find communities that match your interests."}
                            </p>

                            <div className="mt-6 space-y-3">
                                <button
                                    onClick={handleFinish}
                                    className="flex w-full items-center justify-between rounded-2xl border-2 border-primary-600 bg-primary-600 px-5 py-4 text-left text-sm font-semibold text-white transition hover:bg-primary-700"
                                >
                                    <span className="flex items-center gap-3">
                                        <Users size={18} />
                                        Browse communities
                                        {selectedCity && <span className="text-primary-200">in {selectedCity}</span>}
                                    </span>
                                    <ChevronRight size={18} />
                                </button>

                                <button
                                    onClick={handleCreateCommunity}
                                    className="flex w-full items-center justify-between rounded-2xl border-2 border-neutral-200 px-5 py-4 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                                >
                                    <span>Start my own community</span>
                                    <ChevronRight size={18} />
                                </button>

                                <button
                                    onClick={handleGoToDashboard}
                                    className="block w-full py-3 text-center text-xs text-neutral-400 transition-colors hover:text-neutral-600"
                                >
                                    Go to dashboard {'->'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
