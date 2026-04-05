import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { UserRepository } from '@/lib/repositories/user-repo';
import { CommunityMemberRepository } from '@/lib/repositories/community-member-repo';
import { EventParticipantRepository } from '@/lib/repositories/event-participant-repo';
import { createClient } from '@/utils/supabase/server';
import { UserAdminClient } from './UserAdminClient';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: Props) {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== 'kyoty_admin' && currentUser.role !== 'admin')) redirect('/dashboard');

    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) notFound();

    const targetUser = await UserRepository.findById(userId);
    if (!targetUser) notFound();

    const supabase = await createClient();

    const [memberships, eventParticipations, communitiesCreated, eventsCreated, paymentsResult] = await Promise.all([
        CommunityMemberRepository.listByUser(userId),
        EventParticipantRepository.listByUser(userId),
        supabase.from('communities').select('id, name, slug, status, created_at').eq('organizer_id', userId).order('created_at', { ascending: false }),
        supabase.from('events').select('id, title, status, date, created_at').eq('created_by', userId).order('created_at', { ascending: false }),
        supabase.from('payments').select('id, amount_paise, status, created_at, event_id').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);

    return (
        <UserAdminClient
            targetUser={targetUser}
            currentUserId={currentUser.id}
            memberships={memberships}
            eventParticipations={eventParticipations}
            communitiesCreated={communitiesCreated.data ?? []}
            eventsCreated={eventsCreated.data ?? []}
            payments={paymentsResult.data ?? []}
        />
    );
}
