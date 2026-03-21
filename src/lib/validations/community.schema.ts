import { z } from 'zod';

export const createCommunitySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(200),
    description: z.string().max(2000).optional(),
    city: z.string().min(1, 'City is required'),
    cover_image: z.string().url().optional(),
    visibility: z.enum(['public', 'private']).default('public'),
});

export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
