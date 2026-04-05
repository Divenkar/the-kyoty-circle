import crypto from 'crypto';
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

/**
 * Verify a Clerk/Svix webhook signature using Node crypto.
 *
 * Clerk uses the Standard Webhooks spec (Svix). The secret is base64-encoded
 * and prefixed with "whsec_". The signature is computed as:
 *   HMAC-SHA256(base64decode(secret), "${msg_id}.${timestamp}.${body}")
 * and compared against the signatures in the `svix-signature` header.
 */
function verifyWebhook(
    body: string,
    svixId: string,
    svixTimestamp: string,
    svixSignature: string,
    secret: string,
): boolean {
    // Strip "whsec_" prefix and decode base64 key
    const keyStr = secret.startsWith('whsec_') ? secret.slice(6) : secret;
    const key = Buffer.from(keyStr, 'base64');

    // Compute expected signature
    const signedContent = `${svixId}.${svixTimestamp}.${body}`;
    const expected = crypto.createHmac('sha256', key).update(signedContent).digest('base64');

    // The header may contain multiple signatures separated by spaces (versioned)
    const signatures = svixSignature.split(' ');
    for (const sig of signatures) {
        // Each signature is like "v1,<base64>"
        const parts = sig.split(',');
        const sigValue = parts.slice(1).join(',');
        if (sigValue && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sigValue))) {
            return true;
        }
    }

    return false;
}

export async function POST(req: Request) {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
        console.error('CLERK_WEBHOOK_SECRET is not set');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 501 });
    }

    const headerPayload = await headers();
    const body = await req.text();

    const svixId = headerPayload.get('svix-id') ?? '';
    const svixTimestamp = headerPayload.get('svix-timestamp') ?? '';
    const svixSignature = headerPayload.get('svix-signature') ?? '';

    if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
    }

    // Reject timestamps older than 5 minutes to prevent replay attacks
    const now = Math.floor(Date.now() / 1000);
    const ts = parseInt(svixTimestamp, 10);
    if (isNaN(ts) || Math.abs(now - ts) > 300) {
        return NextResponse.json({ error: 'Timestamp too old or invalid' }, { status: 400 });
    }

    let evt: ClerkWebhookEvent;
    try {
        const valid = verifyWebhook(body, svixId, svixTimestamp, svixSignature, secret);
        if (!valid) throw new Error('Signature mismatch');
        evt = JSON.parse(body) as ClerkWebhookEvent;
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
