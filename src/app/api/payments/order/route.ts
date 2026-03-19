import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
    try {
        const { amount, eventId, ticketTierId } = await req.json();

        if (!amount || !eventId) {
            return NextResponse.json({ error: 'Amount and eventId are required' }, { status: 400 });
        }

        let keyId = process.env.RAZORPAY_KEY_ID;
        let keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            // Fallback or warning if no keys
            console.warn('Razorpay keys missing from environment. Using dummy mode.');
            return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 501 });
        }

        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_evt_${eventId}_${Date.now()}`,
            notes: {
                eventId: eventId.toString(),
                ticketTierId: ticketTierId?.toString() || 'general'
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({ success: true, order });
    } catch (error: any) {
        console.error('Razorpay Order error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
    }
}
