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

export async function completeOnboardingAction() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        // Only set the placeholder if they skipped social proof — users who
        // already provided a real link should keep it as-is.
        if (!user.social_proof_link) {
            const supabase = await createClient();
            const { error } = await supabase
                .from('kyoty_users')
                .update({ social_proof_link: 'skipped' })
                .eq('id', user.id);
            if (error) throw new Error(error.message);
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to complete onboarding' };
    }
}

export async function updateCityAction(cityName: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const supabase = await createClient();

        // Look up city id by name
        const { data: city } = await supabase
            .from('cities')
            .select('id')
            .ilike('name', cityName)
            .single();

        const update: Record<string, unknown> = { default_city: cityName };
        if (city?.id) update.default_city_id = city.id;

        const { error } = await supabase
            .from('kyoty_users')
            .update(update)
            .eq('id', user.id);

        if (error) throw new Error(error.message);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update city' };
    }
}
