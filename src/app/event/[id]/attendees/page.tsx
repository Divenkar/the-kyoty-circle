import { getCurrentUser } from '@/lib/auth-server';
import { EventRepository } from '@/lib/repositories/event-repo';
import { getAttendeesAction } from '@/server/actions/organizer.actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, UserCheck, ShieldAlert } from 'lucide-react';
import { AttendeeManager } from './AttendeeManager';
import type { Metadata } from 'next';

interface AttendeePageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Manage Attendees | Kyoty',
    };
}

export default async function AttendeesPage({ params }: AttendeePageProps) {
    const { id } = await params;
    const eventId = Number(id);

    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const event = await EventRepository.findById(eventId);
    if (!event) redirect('/explore');

    // Only organizer or admin can access
    const isOrganizer =
        event.created_by === user.id ||
        user.role === 'admin' ||
        user.role === 'kyoty_admin';

    if (!isOrganizer) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert size={28} className="text-red-500" />
                    </div>
                    <h1 className="text-xl font-bold text-neutral-900 mb-2">Not Authorized</h1>
                    <p className="text-sm text-neutral-500 mb-6">
                        You do not have permission to manage attendees for this event. Only the event organizer can access this page.
                    </p>
                    <Link
                        href={`/event/${id}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Event
                    </Link>
                </div>
            </div>
        );
    }

    const result = await getAttendeesAction(eventId);
    const attendees = result.success ? (result.data ?? []) : [];

    const registeredCount = attendees.filter((a: any) => a.status === 'registered').length;
    const checkedInCount = attendees.filter((a: any) => a.checked_in_at).length;

    return (
        <div
            className="min-h-screen"
            style={{
                background:
                    'radial-gradient(circle at top right, rgba(108,71,255,0.1), transparent 25%), linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            }}
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                {/* Back link */}
                <Link
                    href={`/event/${id}/manage`}
                    className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Manage Event
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-neutral-900">Manage Attendees</h1>
                    <p className="text-neutral-500 mt-1 text-sm">{event.title}</p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 text-center">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-2">
                            <Users size={20} className="text-primary-600" />
                        </div>
                        <div className="text-2xl font-bold text-neutral-900">{attendees.length}</div>
                        <div className="text-xs text-neutral-500 mt-0.5">Total Attendees</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 text-center">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-2">
                            <UserCheck size={20} className="text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-green-600">{checkedInCount}</div>
                        <div className="text-xs text-neutral-500 mt-0.5">Checked In</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 text-center sm:col-span-1 col-span-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
                            <Users size={20} className="text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{registeredCount}</div>
                        <div className="text-xs text-neutral-500 mt-0.5">Registered</div>
                    </div>
                </div>

                {/* Client component for interactive attendee management */}
                <AttendeeManager eventId={eventId} initialAttendees={attendees} />
            </div>
        </div>
    );
}
