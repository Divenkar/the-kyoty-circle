import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @supabase/supabase-js
const mockSupabaseClient = { from: vi.fn() };
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockSupabaseClient),
}));

// Mock @clerk/nextjs/server
const mockGetToken = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
    auth: vi.fn(() => Promise.resolve({ getToken: mockGetToken })),
    currentUser: vi.fn(),
}));

// Set env vars before importing
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');

describe('supabase/server', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createClient', () => {
        it('injects Clerk JWT when token is available', async () => {
            mockGetToken.mockResolvedValueOnce('clerk-jwt-token');
            const { createClient } = await import('@/utils/supabase/server');
            const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');

            await createClient();

            expect(createSupabaseClient).toHaveBeenCalledWith(
                'https://test.supabase.co',
                'test-anon-key',
                { global: { headers: { Authorization: 'Bearer clerk-jwt-token' } } },
            );
        });

        it('falls back to anon key (no auth header) when no Clerk token', async () => {
            mockGetToken.mockResolvedValue(null);
            const { createClient } = await import('@/utils/supabase/server');
            const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');

            await createClient();

            expect(createSupabaseClient).toHaveBeenCalledWith(
                'https://test.supabase.co',
                'test-anon-key',
                undefined,
            );
        });

        it('never falls back to service role key', async () => {
            mockGetToken.mockResolvedValue(null);
            const { createClient } = await import('@/utils/supabase/server');
            const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');

            await createClient();

            // Verify it was NOT called with the service role key
            const calls = (createSupabaseClient as any).mock.calls;
            for (const call of calls) {
                expect(call[1]).not.toBe('test-service-key');
            }
        });
    });

    describe('createServiceClient', () => {
        it('uses service role key', async () => {
            const { createServiceClient } = await import('@/utils/supabase/server');
            const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');

            createServiceClient();

            expect(createSupabaseClient).toHaveBeenCalledWith(
                'https://test.supabase.co',
                'test-service-key',
            );
        });
    });
});
