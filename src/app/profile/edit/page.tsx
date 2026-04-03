import { getCurrentUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { ProfileForm } from '../ProfileForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edit Profile | Kyoty',
};

export default async function EditProfilePage() {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
                <div className="mb-6">
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-800 transition-colors"
                    >
                        <ArrowLeft size={15} />
                        Back to profile
                    </Link>
                    <h1 className="mt-3 text-2xl font-bold text-neutral-900">Edit Profile</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Update your name, city, and identity verification.
                    </p>
                </div>

                <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                    <ProfileForm user={user} />
                </div>
            </div>
        </div>
    );
}
