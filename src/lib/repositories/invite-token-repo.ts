import { createClient } from '@/utils/supabase/server';
import { randomBytes } from 'crypto';

export interface InviteToken {
    id: number;
    community_id: number;
    token: string;
    created_by: number;
    max_uses: number;
    use_count: number;
    expires_at: string | null;
    created_at: string;
}

export const InviteTokenRepository = {
    async create(communityId: number, createdBy: number, maxUses = 50): Promise<InviteToken> {
        const supabase = await createClient();
        const token = randomBytes(12).toString('base64url'); // ~16 char URL-safe token
        const { data, error } = await supabase
            .from('community_invite_tokens')
            .insert({ community_id: communityId, token, created_by: createdBy, max_uses: maxUses })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as InviteToken;
    },

    async findByToken(token: string): Promise<InviteToken | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('community_invite_tokens')
            .select('*')
            .eq('token', token)
            .single();
        if (error) return null;
        return data as InviteToken;
    },

    async listByCommunity(communityId: number): Promise<InviteToken[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('community_invite_tokens')
            .select('*')
            .eq('community_id', communityId)
            .order('created_at', { ascending: false });
        if (error) return [];
        return (data || []) as InviteToken[];
    },

    async incrementUseCount(token: string): Promise<void> {
        const supabase = await createClient();
        // Use RPC to increment atomically; fall back to a plain update if RPC not available
        const { error } = await supabase.rpc('increment_invite_token_use', { p_token: token });
        if (error) {
            // Fallback: read + write (not perfectly atomic but acceptable for low-traffic)
            const record = await InviteTokenRepository.findByToken(token);
            if (!record) return;
            await supabase
                .from('community_invite_tokens')
                .update({ use_count: record.use_count + 1 })
                .eq('token', token);
        }
    },

    async delete(id: number): Promise<void> {
        const supabase = await createClient();
        await supabase.from('community_invite_tokens').delete().eq('id', id);
    },
};
