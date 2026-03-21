import { getCurrentUser } from '@/lib/auth-server';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { NotificationsList } from './NotificationsList';
import { Bell } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Notifications | Kyoty',
};

export default async function NotificationsPage() {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const supabase = await createClient();
    const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

    return (
        <div className="min-h-[calc(100vh-72px)] bg-neutral-50">
            <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100">
                        <Bell size={22} className="text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
                        <p className="text-sm text-neutral-500">Stay up to date with your communities and events</p>
                    </div>
                </div>

                <NotificationsList initialNotifications={(notifications || []) as any[]} />
            </div>
        </div>
    );
}
