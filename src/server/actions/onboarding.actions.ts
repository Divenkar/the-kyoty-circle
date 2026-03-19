'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { createClient } from '@/utils/supabase/server';

export async function submitSocialProofAction(formData: FormData) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Authentication required' };
        }

        const type = formData.get('social_proof_type') as string;
        const link = formData.get('social_proof_link') as string;

        if (!type || !link) {
            return { success: false, error: 'Type and Link are required' };
        }

        const supabase = await createClient();
        const { error } = await supabase
            .from('kyoty_users')
            .update({
                social_proof_type: type,
                social_proof_link: link,
            })
            .eq('id', user.id);

        if (error) {
            throw new Error(error.message);
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update social proof' };
    }
}
