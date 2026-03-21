import { getCurrentUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { CreateCommunityForm } from './CreateCommunityForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Start a Community | Kyoty',
    description: 'Create a verified community on Kyoty and start hosting events for your city.',
};

export default async function CreateCommunityPage() {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    return <CreateCommunityForm />;
}
