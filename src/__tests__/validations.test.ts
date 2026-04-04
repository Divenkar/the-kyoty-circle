import { describe, it, expect } from 'vitest';
import { createCommunitySchema } from '@/lib/validations/community.schema';
import { createEventSchema } from '@/lib/validations/event.schema';

describe('createCommunitySchema', () => {
    it('accepts valid community input', () => {
        const result = createCommunitySchema.safeParse({
            name: 'Running Club',
            description: 'A club for runners',
            category: 'Sports',
            city: 'Noida',
            visibility: 'public',
        });
        expect(result.success).toBe(true);
    });

    it('rejects name shorter than 2 characters', () => {
        const result = createCommunitySchema.safeParse({
            name: 'A',
            category: 'Sports',
            city: 'Noida',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('at least 2');
        }
    });

    it('rejects empty category', () => {
        const result = createCommunitySchema.safeParse({
            name: 'Running Club',
            category: '',
            city: 'Noida',
        });
        expect(result.success).toBe(false);
    });

    it('rejects empty city', () => {
        const result = createCommunitySchema.safeParse({
            name: 'Running Club',
            category: 'Sports',
            city: '',
        });
        expect(result.success).toBe(false);
    });

    it('rejects invalid cover_image_url', () => {
        const result = createCommunitySchema.safeParse({
            name: 'Running Club',
            category: 'Sports',
            city: 'Noida',
            cover_image_url: 'not-a-url',
        });
        expect(result.success).toBe(false);
    });

    it('accepts valid cover_image_url', () => {
        const result = createCommunitySchema.safeParse({
            name: 'Running Club',
            category: 'Sports',
            city: 'Noida',
            cover_image_url: 'https://example.com/image.jpg',
        });
        expect(result.success).toBe(true);
    });

    it('defaults visibility to public', () => {
        const result = createCommunitySchema.safeParse({
            name: 'Running Club',
            category: 'Sports',
            city: 'Noida',
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.visibility).toBe('public');
        }
    });

    it('rejects invalid visibility value', () => {
        const result = createCommunitySchema.safeParse({
            name: 'Running Club',
            category: 'Sports',
            city: 'Noida',
            visibility: 'secret',
        });
        expect(result.success).toBe(false);
    });
});

describe('createEventSchema', () => {
    const validEvent = {
        title: 'Morning Run',
        community_id: 1,
        city: 'Noida',
        event_date: '2026-05-01',
        capacity: 20,
    };

    it('accepts valid event input', () => {
        const result = createEventSchema.safeParse(validEvent);
        expect(result.success).toBe(true);
    });

    it('rejects title shorter than 2 characters', () => {
        const result = createEventSchema.safeParse({ ...validEvent, title: 'A' });
        expect(result.success).toBe(false);
    });

    it('rejects capacity of 0', () => {
        const result = createEventSchema.safeParse({ ...validEvent, capacity: 0 });
        expect(result.success).toBe(false);
    });

    it('rejects negative community_id', () => {
        const result = createEventSchema.safeParse({ ...validEvent, community_id: -1 });
        expect(result.success).toBe(false);
    });

    it('rejects cost over 100000', () => {
        const result = createEventSchema.safeParse({ ...validEvent, cost: 200000 });
        expect(result.success).toBe(false);
    });

    it('defaults cost to 0', () => {
        const result = createEventSchema.safeParse(validEvent);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.cost).toBe(0);
        }
    });

    it('rejects invalid visibility', () => {
        const result = createEventSchema.safeParse({ ...validEvent, visibility: 'invite_only' });
        expect(result.success).toBe(false);
    });
});
