import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

// Mock Supabase service client
const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockUpdate = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
    }),
});
const mockFrom = vi.fn().mockImplementation((table: string) => {
    if (table === 'payments') return { upsert: mockUpsert };
    if (table === 'event_participants') {
        return {
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            maybeSingle: vi.fn().mockResolvedValue({ data: { user_id: 1 } }),
                        }),
                    }),
                }),
            }),
            update: mockUpdate,
        };
    }
    return {};
});

vi.mock('@/utils/supabase/server', () => ({
    createServiceClient: vi.fn(() => ({ from: mockFrom })),
}));

vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', 'test-webhook-secret');

describe('POST /api/payments/webhook', () => {
    let POST: (req: Request) => Promise<Response>;

    beforeEach(async () => {
        vi.clearAllMocks();
        const mod = await import('@/app/api/payments/webhook/route');
        POST = mod.POST as any;
    });

    function makeSignedRequest(body: string, secret = 'test-webhook-secret') {
        const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
        return new Request('http://localhost/api/payments/webhook', {
            method: 'POST',
            headers: {
                'x-razorpay-signature': signature,
                'content-type': 'application/json',
            },
            body,
        });
    }

    it('rejects requests with missing signature', async () => {
        const req = new Request('http://localhost/api/payments/webhook', {
            method: 'POST',
            body: '{}',
        });
        const res = await POST(req as any);
        expect(res.status).toBe(400);
    });

    it('rejects requests with wrong signature (same length)', async () => {
        // Use a valid-length hex string that doesn't match the actual HMAC
        const wrongSig = crypto.createHmac('sha256', 'wrong-secret').update('{"event":"payment.captured"}').digest('hex');
        const req = new Request('http://localhost/api/payments/webhook', {
            method: 'POST',
            headers: { 'x-razorpay-signature': wrongSig },
            body: '{"event":"payment.captured"}',
        });
        const res = await POST(req as any);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.status).toBe('bad_signature');
    });

    it('acknowledges unsupported events', async () => {
        const body = JSON.stringify({ event: 'refund.created' });
        const req = makeSignedRequest(body);
        const res = await POST(req as any);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.status).toBe('ignored');
    });

    it('processes payment.captured and returns ok', async () => {
        const body = JSON.stringify({
            event: 'payment.captured',
            payload: {
                payment: {
                    entity: {
                        id: 'pay_123',
                        order_id: 'order_456',
                        amount: 50000,
                        currency: 'INR',
                        status: 'captured',
                        notes: { eventId: '10', ticketTierId: 'general' },
                    },
                },
            },
        });
        const req = makeSignedRequest(body);
        const res = await POST(req as any);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.status).toBe('ok');
        expect(mockUpsert).toHaveBeenCalledOnce();
    });

    it('rejects payload without payment entity', async () => {
        const body = JSON.stringify({
            event: 'payment.captured',
            payload: {},
        });
        const req = makeSignedRequest(body);
        const res = await POST(req as any);
        expect(res.status).toBe(400);
    });
});
