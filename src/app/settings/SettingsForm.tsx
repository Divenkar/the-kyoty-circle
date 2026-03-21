'use client';

import React, { useState } from 'react';
import {
    updateSocialProofAction,
    changePasswordAction,
} from '@/server/actions/profile.actions';
import { CheckCircle, Loader2, Linkedin, Instagram, Lock, ShieldCheck } from 'lucide-react';
import type { User } from '@/types';

interface SettingsFormProps {
    user: User;
}

function SaveButton({ saving, saved }: { saving: boolean; saved: boolean }) {
    return (
        <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : null}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
        </button>
    );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 border-b border-neutral-100 pb-4">
                <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
                {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
            </div>
            {children}
        </div>
    );
}

export function SettingsForm({ user }: SettingsFormProps) {
    const [socialSaving, setSocialSaving] = useState(false);
    const [socialSaved, setSocialSaved] = useState(false);
    const [socialError, setSocialError] = useState('');

    const [pwSaving, setPwSaving] = useState(false);
    const [pwSaved, setPwSaved] = useState(false);
    const [pwError, setPwError] = useState('');

    const isVerified = !!user.social_proof_type && !!user.social_proof_link;

    const handleSocial = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSocialSaving(true);
        setSocialError('');
        setSocialSaved(false);
        const result = await updateSocialProofAction(new FormData(e.currentTarget));
        if (result.success) {
            setSocialSaved(true);
            setTimeout(() => setSocialSaved(false), 3000);
        } else {
            setSocialError(result.error || 'Failed to save');
        }
        setSocialSaving(false);
    };

    const handlePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const newPw = (form.elements.namedItem('new_password') as HTMLInputElement).value;
        const confirmPw = (form.elements.namedItem('confirm_password') as HTMLInputElement).value;
        if (newPw !== confirmPw) {
            setPwError('Passwords do not match');
            return;
        }
        setPwSaving(true);
        setPwError('');
        setPwSaved(false);
        const result = await changePasswordAction(new FormData(form));
        if (result.success) {
            setPwSaved(true);
            form.reset();
            setTimeout(() => setPwSaved(false), 3000);
        } else {
            setPwError(result.error || 'Failed to change password');
        }
        setPwSaving(false);
    };

    return (
        <div className="space-y-6">
            {/* Identity Verification */}
            <Section
                title="Identity Verification"
                description="Connect a social profile to get a verified badge and build trust with community members."
            >
                {isVerified && (
                    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
                        <ShieldCheck size={18} className="text-green-600 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-green-800">Verified</p>
                            <a
                                href={user.social_proof_link!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-green-700 hover:underline"
                            >
                                {user.social_proof_link}
                            </a>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSocial} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700">Platform</label>
                        <div className="mt-1.5 flex gap-3">
                            {(['linkedin', 'instagram'] as const).map(platform => (
                                <label key={platform} className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 transition has-[:checked]:border-primary-400 has-[:checked]:bg-primary-50">
                                    <input
                                        type="radio"
                                        name="social_proof_type"
                                        value={platform}
                                        defaultChecked={user.social_proof_type === platform}
                                        className="accent-primary-600"
                                    />
                                    {platform === 'linkedin'
                                        ? <Linkedin size={16} className="text-blue-600" />
                                        : <Instagram size={16} className="text-pink-500" />
                                    }
                                    <span className="text-sm font-medium capitalize text-neutral-800">{platform}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700">Profile URL</label>
                        <input
                            type="url"
                            name="social_proof_link"
                            defaultValue={user.social_proof_link || ''}
                            placeholder="https://linkedin.com/in/yourname"
                            className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                        />
                    </div>

                    {socialError && (
                        <p className="text-sm text-red-600">{socialError}</p>
                    )}
                    <SaveButton saving={socialSaving} saved={socialSaved} />
                </form>
            </Section>

            {/* Change Password */}
            <Section
                title="Change Password"
                description="Update your account password. You'll need to sign in again after changing it."
            >
                <form onSubmit={handlePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700">New Password</label>
                        <div className="relative mt-1.5">
                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="password"
                                name="new_password"
                                required
                                minLength={8}
                                placeholder="At least 8 characters"
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700">Confirm Password</label>
                        <div className="relative mt-1.5">
                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="password"
                                name="confirm_password"
                                required
                                placeholder="Repeat new password"
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                    </div>

                    {pwError && <p className="text-sm text-red-600">{pwError}</p>}
                    <SaveButton saving={pwSaving} saved={pwSaved} />
                </form>
            </Section>

            {/* Account info (read-only) */}
            <Section title="Account Information">
                <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-neutral-500">Email</dt>
                        <dd className="font-medium text-neutral-900">{user.email}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-neutral-500">Account type</dt>
                        <dd className="font-medium text-neutral-900 capitalize">{user.role.replace('_', ' ')}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-neutral-500">Member since</dt>
                        <dd className="font-medium text-neutral-900">
                            {new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </dd>
                    </div>
                </dl>
            </Section>
        </div>
    );
}
