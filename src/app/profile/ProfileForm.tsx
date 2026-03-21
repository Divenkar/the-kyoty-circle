'use client';

import Image from 'next/image';
import React, { useState, useRef } from 'react';
import { updateProfileAction, uploadAvatarAction } from '@/server/actions/profile.actions';
import { toast } from 'sonner';
import { Camera, Loader2, CheckCircle, Linkedin, Instagram, ShieldCheck } from 'lucide-react';
import type { User } from '@/types';

const CITIES = ['Noida', 'Delhi', 'Gurgaon', 'Bangalore'];

interface ProfileFormProps {
    user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        const fd = new FormData();
        fd.append('file', file);
        const result = await uploadAvatarAction(fd);
        if (result.success && result.data) {
            setAvatarUrl(result.data);
            toast.success('Avatar updated');
        } else {
            toast.error(result.error || 'Failed to upload avatar');
        }
        setUploadingAvatar(false);
        e.target.value = '';
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSaved(false);
        const result = await updateProfileAction(new FormData(e.currentTarget));
        if (result.success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            toast.success('Profile saved');
        } else {
            setError(result.error || 'Failed to save');
            toast.error(result.error || 'Failed to save profile');
        }
        setSaving(false);
    };

    const initials = user.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const isVerified = !!user.social_proof_type && !!user.social_proof_link;

    return (
        <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-5">
                <div className="relative">
                    <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-neutral-200 bg-primary-100">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={user.name}
                                width={80}
                                height={80}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary-600">
                                {initials}
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary-600 text-white shadow transition hover:bg-primary-700 disabled:opacity-60"
                    >
                        {uploadingAvatar
                            ? <Loader2 size={13} className="animate-spin" />
                            : <Camera size={13} />
                        }
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />
                </div>
                <div>
                    <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                    {isVerified && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 border border-green-200">
                            <ShieldCheck size={12} />
                            Verified via {user.social_proof_type === 'linkedin' ? 'LinkedIn' : 'Instagram'}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        defaultValue={user.name}
                        maxLength={80}
                        className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>

                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-neutral-700">City</label>
                    <select
                        id="city"
                        name="city"
                        defaultValue={(user as any).default_city || ''}
                        className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                    >
                        <option value="">Select city</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <CheckCircle size={15} /> : null}
                    {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
                </button>
            </form>

            {/* Verification status */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                <h3 className="text-sm font-semibold text-neutral-900">Identity Verification</h3>
                {isVerified ? (
                    <div className="mt-3 flex items-center gap-3">
                        {user.social_proof_type === 'linkedin'
                            ? <Linkedin size={18} className="text-blue-600" />
                            : <Instagram size={18} className="text-pink-500" />
                        }
                        <div>
                            <p className="text-sm font-medium text-neutral-800 capitalize">{user.social_proof_type} connected</p>
                            <a
                                href={user.social_proof_link!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary-600 hover:underline"
                            >
                                View profile →
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="mt-3">
                        <p className="text-sm text-neutral-500">Not verified yet. Add a LinkedIn or Instagram profile to get a verified badge.</p>
                        <a
                            href="/settings"
                            className="mt-2 inline-block text-sm font-medium text-primary-600 hover:underline"
                        >
                            Add verification →
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
