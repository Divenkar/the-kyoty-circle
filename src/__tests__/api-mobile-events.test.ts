import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUser = { id: 1, auth_id: 'user_123', name: 'Test', role: 'participant' };
vi.mock('@/lib/auth-server', () => ({
    getCurrentUser: vi.fn(),
}));

const mockSelect = vi.fn();
const mockFrom = vi.fn().mockImplementation(() => ({
    select: mockSelect,
}));

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve({ from: mockFrom })),
}));

vi.mock('@/lib/api-response', () => ({
    apiOk: vi.fn((data: any) => Response.json({ success: true, data })),
    apiError: vi.fn((msg: string, status: number) => Response.json({ success: false, error: msg }, { status })),
}));

describe('GET /api/mobile/events', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 when not authenticated', async () => {
        const { getCurrentUser } = await import('@/lib/auth-server');
        (getCurrentUser as any).mockResolvedValue(null);

        const { GET } = await import('@/app/api/mobile/events/route');
        const req = new Request('http://localhost/api/mobile/events');
        const res = await GET(req as any);
        expect(res.status).toBe(401);
    });

    it('returns events for authenticated user', async () => {
        const { getCurrentUser } = await import('@/lib/auth-server');
        (getCurrentUser as any).mockResolvedValue(mockUser);

        const events = [
            { id: 1, title: 'Test Event', date: '2026-05-01', communities: { name: 'Test Community' } },
        ];

        mockSelect.mockReturnValue({
            in: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue({ data: events, error: null }),
                    }),
                }),
            }),
        });

        const { GET } = await import('@/app/api/mobile/events/route');
        const req = new Request('http://localhost/api/mobile/events');
        const res = await GET(req as any);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data).toEqual(events);
    });

    it('returns 500 on database error', async () => {
        const { getCurrentUser } = await import('@/lib/auth-server');
        (getCurrentUser as any).mockResolvedValue(mockUser);

        mockSelect.mockReturnValue({
            in: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB down' } }),
                    }),
                }),
            }),
        });

        const { GET } = await import('@/app/api/mobile/events/route');
        const req = new Request('http://localhost/api/mobile/events');
        const res = await GET(req as any);
        expect(res.status).toBe(500);
    });
});
