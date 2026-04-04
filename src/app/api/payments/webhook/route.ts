import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature');
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!secret) {
            console.error('RAZORPAY_WEBHOOK_SECRET is not set');
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 501 });
        }

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        // ── 1. Verify HMAC signature ──────────────────────────────────────────
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        if (!crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(signature, 'hex'),
        )) {
            return NextResponse.json({ status: 'bad_signature' }, { status: 400 });
        }

        // ── 2. Parse payload ──────────────────────────────────────────────────
        const webhookEvent = JSON.parse(body) as {
            event: string;
            payload?: {
                payment?: {
                    entity?: {
                        id: string;
                        order_id: string;
                        amount: number;
                        currency: string;
                        status: string;
                        notes?: Record<string, string>;
                    };
                };
            };
        };

        const supportedEvents = ['payment.captured', 'order.paid'];
        if (!supportedEvents.includes(webhookEvent.event)) {
            // Acknowledge unknown events so Razorpay stops retrying.
            return NextResponse.json({ status: 'ignored' });
        }

        const payment = webhookEvent.payload?.payment?.entity;
        if (!payment?.id || !payment?.order_id) {
            return NextResponse.json({ error: 'Invalid webhook payload — missing payment entity' }, { status: 400 });
        }

        const notes = payment.notes ?? {};
        const eventId = notes.eventId ? Number(notes.eventId) : null;
        const ticketTierId = notes.ticketTierId && notes.ticketTierId !== 'general'
            ? Number(notes.ticketTierId)
            : null;

        // ── 3. Look up the kyoty user by matching the Razorpay order ─────────
        const supabase = createServiceClient();

        // Find pending-payment participant for this event to resolve user_id
        let resolvedUserId: number | null = null;
        if (eventId) {
            const { data: pendingParticipant } = await supabase
                .from('event_participants')
                .select('user_id')
                .eq('event_id', eventId)
                .eq('status', 'pending_payment')
                .limit(1)
                .maybeSingle();
            resolvedUserId = pendingParticipant?.user_id ?? null;
        }

        // ── 4. Persist to payments table (idempotent via ON CONFLICT DO NOTHING) ──
        const { error: insertError } = await supabase
            .from('payments')
            .upsert({
                razorpay_order_id: payment.order_id,
                razorpay_payment_id: payment.id,
                event_id: eventId,
                ticket_tier_id: ticketTierId,
                user_id: resolvedUserId,
                amount_paise: payment.amount,
                currency: payment.currency,
                status: 'captured',
                webhook_event: webhookEvent.event,
                raw_payload: payment,
            }, { onConflict: 'razorpay_payment_id', ignoreDuplicates: true });

        if (insertError) {
            // Don't expose internal errors to Razorpay, but log them.
            console.error('Failed to persist payment:', insertError.message);
            return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
        }

        // ── 5. Mark the event participant as registered (if eventId is known) ─
        if (eventId) {
            // Update participant status from 'pending_payment' → 'registered'
            // Only updates if a matching pending_payment row exists (safe no-op otherwise).
            await supabase
                .from('event_participants')
                .update({ status: 'registered' })
                .eq('event_id', eventId)
                .eq('status', 'pending_payment');
        }

        console.log(
            `[webhook] ${webhookEvent.event} recorded: payment=${payment.id} order=${payment.order_id} event=${eventId ?? 'unknown'}`,
        );

        return NextResponse.json({ status: 'ok' });
    } catch (err) {
        console.error('Webhook handler error:', err);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
