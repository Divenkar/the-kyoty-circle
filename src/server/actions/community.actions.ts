'use server';

import { getCurrentUser } from '@/lib/auth-server';
import { CommunityService } from '@/lib/services/community-service';
import { CommunityRepository } from '@/lib/repositories/community-repo';
import { CommunityRolesRepository } from '@/lib/repositories/community-roles-repo';
import { CityRepository } from '@/lib/repositories/city-repo';
import { createCommunitySchema } from '@/lib/validations/community.schema';
import type { ActionResponse, Community } from '@/types';

export async function createCommunityAction(
    formData: FormData
): Promise<ActionResponse<Community>> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const raw = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            category: (formData.get('category') as string) || 'Sports',
            city: formData.get('city') as string,
            cover_image_url: formData.get('cover_image_url') as string || undefined,
            visibility: (formData.get('visibility') as string) || 'public',
        };

        const parsed = createCommunitySchema.safeParse(raw);
        if (!parsed.success) {
            return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input' };
        }

        const baseSlug = raw.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        // ── Resolve a unique slug ─────────────────────────────────────────────
        // If "my-community" is taken, try "my-community-2", "my-community-3", etc.
        const { createClient } = await import('@/utils/supabase/server');
        const supabase = await createClient();

        let slug = baseSlug || 'community';
        let attempt = 1;
        const MAX_SLUG_ATTEMPTS = 50;
        while (true) {
            const { data: existing } = await supabase
                .from('communities')
                .select('id')
                .eq('slug', slug)
                .maybeSingle();

            if (!existing) break; // slug is available

            attempt += 1;
            if (attempt > MAX_SLUG_ATTEMPTS) {
                return { success: false, error: 'Could not generate a unique URL slug. Try a different name.' };
            }
            slug = `${baseSlug}-${attempt}`;
        }
        // ─────────────────────────────────────────────────────────────────────

        const city = await CityRepository.getByName(raw.city);
        if (!city) return { success: false, error: `City "${raw.city}" not found` };

        const community = await CommunityService.createCommunity({
            name: parsed.data.name,
            description: parsed.data.description,
            slug,
            category: raw.category,
            city_id: city.id,
            organizer_id: user.id,
            cover_image_url: raw.cover_image_url,
            visibility: raw.visibility,
        });

        // Auto-assign owner role to the creator
        await CommunityRolesRepository.upsert({
            community_id: community.id,
            user_id: user.id,
            role: 'owner',
            assigned_by: user.id,
        });

        return { success: true, data: community };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to create community' };
    }
}

export async function joinCommunityAction(
    communityId: number,
    opts?: { joinReason?: string; socialProofLink?: string }
): Promise<ActionResponse<{ memberStatus: 'approved' | 'pending' }>> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const result = await CommunityService.requestToJoin(communityId, user.id, opts);
        return { success: true, data: { memberStatus: result.status } };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to join community' };
    }
}

export async function getMyCommunitiesAction(): Promise<ActionResponse<Community[]>> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        // Return communities where user is the organizer OR has a community-level role (owner/admin)
        const [organizedCommunities, communityRoles] = await Promise.all([
            CommunityRepository.findByCreator(user.id),
            CommunityRolesRepository.listByUser(user.id),
        ]);

        // Merge: start with organizer communities, add role-based ones if not already included
        const seen = new Set(organizedCommunities.map((c) => c.id));
        const roleBasedCommunityIds = communityRoles
            .filter((r) => r.role === 'owner' || r.role === 'admin')
            .map((r) => r.community_id)
            .filter((id) => !seen.has(id));

        const roleBasedCommunities = roleBasedCommunityIds.length > 0
            ? await Promise.all(roleBasedCommunityIds.map((id) => CommunityRepository.findById(id)))
            : [];

        const merged = [
            ...organizedCommunities,
            ...(roleBasedCommunities.filter(Boolean) as Community[]),
        ];

        return { success: true, data: merged };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch communities' };
    }
}
