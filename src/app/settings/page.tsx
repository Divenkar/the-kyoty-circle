import { getCurrentUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { SettingsForm } from './SettingsForm';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Settings | Kyoty',
};

export default async function SettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    return (
        <div className="min-h-[calc(100vh-72px)] bg-neutral-50">
            <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-200">
                        <Settings size={22} className="text-neutral-700" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
                        <p className="text-sm text-neutral-500">
                            Manage your account · <Link href="/profile" className="text-primary-600 hover:underline">Edit profile</Link>
                        </p>
                    </div>
                </div>

                <SettingsForm user={user} />
            </div>
        </div>
    );
}
