import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-server';
import { createClient } from '@/utils/supabase/server';
import { ReportsClient } from './ReportsClient';

export default async function AdminReportsPage() {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'kyoty_admin' && user.role !== 'admin')) redirect('/dashboard');

    const supabase = await createClient();
    const { data: reports, error } = await supabase
        .from('reports')
        .select('*, kyoty_users!reports_reporter_id_fkey(id, name, email)')
        .order('created_at', { ascending: false });

    if (error) console.error('[admin] reports fetch error:', error.message);

    return <ReportsClient reports={reports ?? []} />;
}
