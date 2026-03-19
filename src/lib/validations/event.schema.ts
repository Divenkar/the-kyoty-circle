import { z } from 'zod';

export const createEventSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(300),
    description: z.string().max(5000).optional(),
    community_id: z.number().int().positive('Community is required'),
    city: z.string().min(1, 'City is required').default('Noida'),
    location: z.string().max(500).optional(),
    event_date: z.string().min(1, 'Date is required'),
    event_time: z.string().optional(),
    capacity: z.number().int().min(1, 'Capacity must be at least 1').max(500),
    cost: z.number().min(0).default(0),
    image_url: z.string().url().optional(),
    category: z.string().default('All'),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
