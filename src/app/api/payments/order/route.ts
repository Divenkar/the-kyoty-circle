import Razorpay from 'razorpay';
import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { apiOk, apiError } from '@/lib/api-response';

const MAX_AMOUNT_INR = 100_000; // ₹1,00,000 cap

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return apiError('Authentication required', 401);

        const { amount, eventId, ticketTierId } = await req.json();

        if (!amount || !eventId) {
            return apiError('Amount and eventId are required', 400);
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return apiError('Amount must be a positive number', 400);
        }

        if (amount > MAX_AMOUNT_INR) {
            return apiError(`Amount exceeds maximum (₹${MAX_AMOUNT_INR.toLocaleString()})`, 400);
        }

        if (!Number.isInteger(eventId) || eventId < 1) {
            return apiError('Invalid event ID', 400);
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
