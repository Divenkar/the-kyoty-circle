import { createClient } from '@/utils/supabase/server';
import type { AdminLog } from '@/types';

export const AdminLogRepository = {
    async create(data: {
        admin_id: number;
        action: string;
        target_type: string;
        target_id: number;
        metadata?: Record<string, unknown>;
    }): Promise<AdminLog> {
        const supabase = await createClient();
        const { data: log, error } = await supabase
            .from('admin_logs')
            .insert(data)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return log as AdminLog;
    },

    async findRecent(limit = 50): Promise<AdminLog[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('admin_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) throw new Error(error.message);
        return (data || []) as AdminLog[];
    },
};
