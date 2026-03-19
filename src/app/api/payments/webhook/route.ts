import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature');
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!secret) {
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 501 });
        }

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        if (expectedSignature === signature) {
            const event = JSON.parse(body);

            // Handle the event
            if (event.event === 'payment.captured' || event.event === 'order.paid') {
                const payment = event.payload.payment.entity;
                const notes = payment.notes;

                console.log(`Payment captured: ${payment.amount} INR for event ${notes?.eventId}`);

                // In a real implementation using Supabase:
                // const { error } = await supabase.from('event_participants').insert({ event_id: notes.eventId, ... })
            }

            return NextResponse.json({ status: 'ok' });
        } else {
            return NextResponse.json({ status: 'bad_signature' }, { status: 400 });
        }
    } catch (err: any) {
        console.error('Webhook Error:', err);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
