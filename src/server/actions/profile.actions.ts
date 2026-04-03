'use server';

import { getCurrentUser, getCurrentUserId } from '@/lib/auth-server';
import { createClient } from '@/utils/supabase/server';
import { clerkClient } from '@clerk/nextjs/server';
import type { ActionResponse } from '@/types';

export async function updateProfileAction(formData: FormData): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const name = (formData.get('name') as string)?.trim();
        const city = (formData.get('city') as string)?.trim();
        const bio = (formData.get('bio') as string)?.trim();

        if (!name) return { success: false, error: 'Name is required' };

        const updates: Record<string, unknown> = { name };
        if (city !== undefined) updates.default_city = city || null;
        if (bio !== undefined) updates.bio = bio || null;

        const supabase = await createClient();
        const { error } = await supabase
            .from('kyoty_users')
            .update(updates)
            .eq('id', user.id);

        if (error) throw new Error(error.message);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update profile' };
    }
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResponse<string>> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const file = formData.get('file') as File;
        if (!file) return { success: false, error: 'No file provided' };

        const maxSize = 3 * 1024 * 1024; // 3 MB
        if (file.size > maxSize) return { success: false, error: 'File too large (max 3 MB)' };

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: 'Only JPEG, PNG, and WebP are allowed' };
        }

        const ext = file.name.split('.').pop();
        const fileName = `avatars/${user.id}-${Date.now()}.${ext}`;

        const supabase = await createClient();
        const { data: upload, error: uploadError } = await supabase.storage
            .from('community-media')
            .upload(fileName, file, { contentType: file.type, upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = supabase.storage
            .from('community-media')
            .getPublicUrl(upload.path);

        // Save avatar URL to user record
        await supabase
            .from('kyoty_users')
            .update({ avatar_url: urlData.publicUrl })
            .eq('id', user.id);

        return { success: true, data: urlData.publicUrl };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Upload failed' };
    }
}

export async function updateSocialProofAction(formData: FormData): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Authentication required' };

        const type = formData.get('social_proof_type') as string;
        const link = (formData.get('social_proof_link') as string)?.trim();

        const supabase = await createClient();
        const { error } = await supabase
            .from('kyoty_users')
            .update({ social_proof_type: type || null, social_proof_link: link || null })
            .eq('id', user.id);

        if (error) throw new Error(error.message);
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update' };
    }
}

export async function changePasswordAction(formData: FormData): Promise<ActionResponse> {
    try {
        const userId = await getCurrentUserId();
        if (!userId) return { success: false, error: 'Authentication required' };

        const newPassword = formData.get('new_password') as string;
        if (!newPassword || newPassword.length < 8) {
            return { success: false, error: 'Password must be at least 8 characters' };
        }

        const client = await clerkClient();
        await client.users.updateUser(userId, { password: newPassword });
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to change password' };
    }
}
