'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { sanitizeInterestTags } from '@/lib/interest-tags';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { createServiceClient } from '@/utils/supabase/server';
import type { Community } from '@/types';

// Allowed hostname patterns per proof type.
const SOCIAL_PROOF_HOSTS: Record<string, RegExp> = {
    linkedin: /^(www\.)?linkedin\.com$/i,
    instagram: /^(www\.)?instagram\.com$/i,
};

function validateSocialProofUrl(type: string, link: string): string | null {
    let url: URL;
    try {
        url = new URL(link.trim());
    } catch {
        return 'Please enter a valid URL (e.g. https://linkedin.com/in/yourname)';
    }

    if (url.protocol !== 'https:') {
        return 'URL must use HTTPS';
    }

    const allowedHost = SOCIAL_PROOF_HOSTS[type];
    if (!allowedHost) {
        return `Unsupported social proof type: ${type}`;
    }

    if (!allowedHost.test(url.hostname)) {
        const expected = type === 'linkedin' ? 'linkedin.com' : 'instagram.com';
        return `URL must be from ${expected}`;
    }

    return null; // valid
}

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

        const validationError = validateSocialProofUrl(type, link);
        if (validationError) {
            return { success: false, error: validationError };
        }

        // Use service client to bypass RLS — user identity already verified via Clerk
        const supabase = createServiceClient();
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

        // Use service client to bypass RLS — user identity already verified via Clerk
        const supabase = createServiceClient();
        const { error } = await supabase
            .from('kyoty_users')
            .update({ onboarding_completed: true })
            .eq('id', user.id);
        if (error) throw new Error(error.message);

        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to complete onboarding' };
    }
}

export async function updateInterestTagsAction(interestTags: string[]) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const sanitizedTags = sanitizeInterestTags(interestTags);
        if (sanitizedTags.length === 0) {
            return { success: true };
        }

        // Use service client to bypass RLS — user identity already verified via Clerk
        const supabase = createServiceClient();
        const { error } = await supabase
            .from('kyoty_users')
            .update({ interest_tags: sanitizedTags })
            .eq('id', user.id);
        if (error) throw new Error(error.message);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update interests' };
    }
}

/** Fetch up to 3 communities matching the user's interest tags for Step 5 */
export async function getSuggestedCommunitiesAction(
    interestTags: string[],
    city?: string,
): Promise<{ success: boolean; data?: Pick<Community, 'id' | 'name' | 'slug' | 'category' | 'member_count' | 'city_name'>[]; error?: string }> {
    try {
        if (interestTags.length === 0) return { success: true, data: [] };

        const allCommunities = await CommunityRepository.search({
            city: city || 'all',
            query: '',
            category: 'all',
        });

        const lowerTags = interestTags.map((t) => t.toLowerCase());
        const matched = allCommunities
            .filter((c) => lowerTags.some((t) => c.category?.toLowerCase().includes(t)))
            .slice(0, 3)
            .map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                category: c.category,
                member_count: c.member_count,
                city_name: c.city_name,
            }));

        return { success: true, data: matched };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch suggestions' };
    }
}

export async function updateCityAction(cityName: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        // Use service client to bypass RLS — user identity already verified via Clerk
        const supabase = createServiceClient();

        // Look up city id by name.
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
