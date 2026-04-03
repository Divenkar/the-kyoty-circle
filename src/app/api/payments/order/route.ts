import Razorpay from 'razorpay';
import { NextRequest } from 'next/server';
import { apiOk, apiError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
    try {
        const { amount, eventId, ticketTierId } = await req.json();

        if (!amount || !eventId) {
            return apiError('Amount and eventId are required', 400);
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return apiError('Amount must be a positive number', 400);
        }

        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            console.error('Razorpay keys missing from environment');
            return apiError('Payment gateway not configured', 501);
        }

        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

        const order = await razorpay.orders.create({
            amount: amount * 100, // rupees → paise
            currency: 'INR',
            receipt: `receipt_evt_${eventId}_${Date.now()}`,
            notes: {
                eventId: eventId.toString(),
                ticketTierId: ticketTierId?.toString() ?? 'general',
            },
        });

        return apiOk({ order });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create order';
        console.error('Razorpay order error:', error);
        return apiError(message, 500);
    }
}
