import { getCurrentUser } from '@/lib/auth-server';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { EventRepository } from '@/lib/repositories/event-repo';
import { AdminActions } from './AdminActions';
import { redirect } from 'next/navigation';
import { Shield, Users, Calendar, AlertTriangle } from 'lucide-react';

export default async function AdminPage() {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'kyoty_admin' && user.role !== 'admin')) redirect('/dashboard');

    const pendingCommunities = await CommunityRepository.findPending();
    const pendingEvents = await EventRepository.findPending();

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 flex items-center gap-3">
                        <Shield size={28} className="text-primary-600" />
                        Admin Panel
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Manage platform approvals
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
                    <div className="p-5 bg-white border border-neutral-200 rounded-2xl">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
                            <AlertTriangle size={18} className="text-amber-600" />
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">{pendingCommunities.length + pendingEvents.length}</p>
                        <p className="text-xs text-neutral-500">Pending Approvals</p>
                    </div>
                    <div className="p-5 bg-white border border-neutral-200 rounded-2xl">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mb-3">
                            <Users size={18} className="text-primary-600" />
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">{pendingCommunities.length}</p>
                        <p className="text-xs text-neutral-500">Communities Pending</p>
                    </div>
                    <div className="p-5 bg-white border border-neutral-200 rounded-2xl">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mb-3">
                            <Calendar size={18} className="text-primary-600" />
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">{pendingEvents.length}</p>
                        <p className="text-xs text-neutral-500">Events Pending</p>
                    </div>
                </div>

                {/* Admin Actions (Client Component) */}
                <AdminActions
                    pendingCommunities={pendingCommunities}
                    pendingEvents={pendingEvents}
                />
            </div>
        </div>
    );
}
