import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { ensureUser } from '@/lib/auth-server';
import { createServiceClient } from '@/utils/supabase/server';

type ClerkUserCreatedEvent = {
    type: 'user.created';
    data: {
        id: string;
        email_addresses: Array<{ email_address: string }>;
        first_name: string | null;
        last_name: string | null;
        image_url: string | null;
    };
};

type ClerkWebhookEvent = ClerkUserCreatedEvent | { type: string; data: unknown };

export async function POST(req: Request) {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
        console.error('CLERK_WEBHOOK_SECRET is not set');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 501 });
    }

    const wh = new Webhook(secret);
    const headerPayload = await headers();
    const body = await req.text();

    let evt: ClerkWebhookEvent;
    try {
        evt = wh.verify(body, {
            'svix-id': headerPayload.get('svix-id') ?? '',
            'svix-timestamp': headerPayload.get('svix-timestamp') ?? '',
            'svix-signature': headerPayload.get('svix-signature') ?? '',
        }) as ClerkWebhookEvent;
    } catch (err) {
        console.error('Clerk webhook verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (evt.type === 'user.created') {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data as ClerkUserCreatedEvent['data'];
        const name = [first_name, last_name].filter(Boolean).join(' ') || 'User';
        const email = email_addresses[0]?.email_address ?? '';

        try {
            // Webhook has no user session — use service client explicitly.
            const supabase = createServiceClient();
            await ensureUser({ authId: id, email, name, avatarUrl: image_url }, supabase);
        } catch (err) {
            console.error('Failed to create kyoty_users row for Clerk user:', id, err);
            return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
        }
    }

    return NextResponse.json({ status: 'ok' });
}
