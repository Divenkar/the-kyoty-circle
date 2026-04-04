import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUser = { id: 1, auth_id: 'user_123', name: 'Test', role: 'participant' };
vi.mock('@/lib/auth-server', () => ({
    getCurrentUser: vi.fn(),
}));

const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn().mockImplementation(() => ({
    select: mockSelect,
    update: mockUpdate,
}));

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve({ from: mockFrom })),
}));

vi.mock('@/lib/api-response', () => ({
    apiOk: vi.fn((data: any) => Response.json({ success: true, data })),
    apiError: vi.fn((msg: string, status: number) => Response.json({ success: false, error: msg }, { status })),
}));

describe('/api/notifications', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET', () => {
        it('returns 401 when not authenticated', async () => {
            const { getCurrentUser } = await import('@/lib/auth-server');
            (getCurrentUser as any).mockResolvedValue(null);

            const { GET } = await import('@/app/api/notifications/route');
            const res = await GET();
            expect(res.status).toBe(401);
        });

        it('returns notifications for authenticated user', async () => {
            const { getCurrentUser } = await import('@/lib/auth-server');
            (getCurrentUser as any).mockResolvedValue(mockUser);

            const notifications = [{ id: 1, message: 'test', is_read: false }];
            mockSelect.mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue({ data: notifications, error: null }),
                    }),
                }),
            });

            const { GET } = await import('@/app/api/notifications/route');
            const res = await GET();
            const json = await res.json();
            expect(json.success).toBe(true);
            expect(json.data).toEqual(notifications);
        });
    });

    describe('PUT', () => {
        it('returns 401 when not authenticated', async () => {
            const { getCurrentUser } = await import('@/lib/auth-server');
            (getCurrentUser as any).mockResolvedValue(null);

            const { PUT } = await import('@/app/api/notifications/route');
            const res = await PUT();
            expect(res.status).toBe(401);
        });

        it('marks notifications as read for authenticated user', async () => {
            const { getCurrentUser } = await import('@/lib/auth-server');
            (getCurrentUser as any).mockResolvedValue(mockUser);

            mockUpdate.mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null }),
                }),
            });

            const { PUT } = await import('@/app/api/notifications/route');
            const res = await PUT();
            const json = await res.json();
            expect(json.success).toBe(true);
        });
    });
});
