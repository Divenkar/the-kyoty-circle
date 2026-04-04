import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAuth = vi.fn();
const mockCurrentUser = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
    auth: (...args: any[]) => mockAuth(...args),
    currentUser: (...args: any[]) => mockCurrentUser(...args),
}));

const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };
vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(mockSupabase)),
    createServiceClient: vi.fn(() => mockSupabase),
}));

describe('auth-server', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getCurrentUserId', () => {
        it('returns userId when authenticated', async () => {
            mockAuth.mockResolvedValue({ userId: 'user_123' });
            const { getCurrentUserId } = await import('@/lib/auth-server');
            const id = await getCurrentUserId();
            expect(id).toBe('user_123');
        });

        it('returns null when not authenticated', async () => {
            mockAuth.mockResolvedValue({ userId: null });
            const { getCurrentUserId } = await import('@/lib/auth-server');
            const id = await getCurrentUserId();
            expect(id).toBeNull();
        });

        it('returns null when auth throws', async () => {
            mockAuth.mockRejectedValue(new Error('No request context'));
            const { getCurrentUserId } = await import('@/lib/auth-server');
            const id = await getCurrentUserId();
            expect(id).toBeNull();
        });
    });

    describe('getCurrentUser', () => {
        it('returns user from database when exists', async () => {
            const dbUser = { id: 1, auth_id: 'user_123', name: 'Test', role: 'participant' };
            mockAuth.mockResolvedValue({ userId: 'user_123' });
            mockFrom.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: dbUser }),
                    }),
                }),
            });

            const { getCurrentUser } = await import('@/lib/auth-server');
            const user = await getCurrentUser();
            expect(user).toEqual(dbUser);
        });

        it('returns null when not authenticated', async () => {
            mockAuth.mockResolvedValue({ userId: null });
            const { getCurrentUser } = await import('@/lib/auth-server');
            const user = await getCurrentUser();
            expect(user).toBeNull();
        });
    });

    describe('requireRole', () => {
        it('throws when not authenticated', async () => {
            mockAuth.mockResolvedValue({ userId: null });
            const { requireRole } = await import('@/lib/auth-server');
            await expect(requireRole('admin')).rejects.toThrow('Authentication required');
        });
    });

    describe('ensureUser', () => {
        it('returns existing user without inserting', async () => {
            const existing = { id: 1, auth_id: 'user_123', name: 'Test' };
            mockFrom.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: existing }),
                    }),
                }),
            });

            const { ensureUser } = await import('@/lib/auth-server');
            const user = await ensureUser({
                authId: 'user_123',
                email: 'test@test.com',
                name: 'Test',
            }, mockSupabase as any);
            expect(user).toEqual(existing);
        });

        it('creates new user when not found', async () => {
            const newUser = { id: 2, auth_id: 'user_456', name: 'New User' };
            const mockInsert = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: newUser, error: null }),
                }),
            });
            mockFrom.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: null }),
                    }),
                }),
                insert: mockInsert,
            });

            const { ensureUser } = await import('@/lib/auth-server');
            const user = await ensureUser({
                authId: 'user_456',
                email: 'new@test.com',
                name: 'New User',
            }, mockSupabase as any);
            expect(user).toEqual(newUser);
        });

        it('accepts an explicit client parameter (for webhooks)', async () => {
            const customClient = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: 1 } }),
                        }),
                    }),
                }),
            };

            const { ensureUser } = await import('@/lib/auth-server');
            await ensureUser(
                { authId: 'user_789', email: 'x@x.com', name: 'X' },
                customClient as any,
            );
            // Should use the custom client, not the default
            expect(customClient.from).toHaveBeenCalledWith('kyoty_users');
        });
    });
});
