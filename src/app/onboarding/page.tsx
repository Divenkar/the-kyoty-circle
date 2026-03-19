'use client';

import React from 'react';
import { submitSocialProofAction } from '@/server/actions/onboarding.actions';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await submitSocialProofAction(formData);

        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error || 'Failed to submit details');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                    <Shield className="text-primary-600" size={28} />
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Almost there!</h1>
                <p className="text-sm text-neutral-500 mb-6">
                    To maintain a trusted community, Kyoty requires a valid social media profile to join events.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Social Proof Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="social_proof_type"
                            required
                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                        >
                            <option value="">Select Platform</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="instagram">Instagram</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Profile Link <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="url"
                            name="social_proof_link"
                            required
                            placeholder="https://linkedin.com/in/..."
                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Complete Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}
