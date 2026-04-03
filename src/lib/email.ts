import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'Kyoty <noreply@kyoty.in>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[Email skipped – no RESEND_API_KEY] To: ${to} | Subject: ${subject}`);
        return;
    }
    try {
        await resend.emails.send({ from: FROM, to, subject, html });
    } catch (err) {
        console.error('[Email error]', err);
    }
}

// ─── Templates ────────────────────────────────────────────────────────────────

function base(content: string) {
    return `
    <div style="font-family:Inter,sans-serif;max-width:580px;margin:0 auto;color:#1a1a2e">
      <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:28px 32px;border-radius:16px 16px 0 0">
        <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px">Kyoty</span>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px">
        ${content}
      </div>
      <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:20px">
        You're receiving this because you have an account on Kyoty.
      </p>
    </div>`;
}

function btn(href: string, label: string) {
    return `<a href="${href}" style="display:inline-block;background:#6366f1;color:#fff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:20px">${label}</a>`;
}

export function memberApprovedEmail(userName: string, communityName: string, communitySlug: string) {
    return base(`
      <h2 style="margin:0 0 8px;font-size:20px">Welcome to ${communityName}! 🎉</h2>
      <p style="color:#4b5563;line-height:1.6">Hi ${userName},</p>
      <p style="color:#4b5563;line-height:1.6">
        Great news — your request to join <strong>${communityName}</strong> has been <strong style="color:#16a34a">approved</strong>.
        You now have full access to the community chat, events, and members.
      </p>
      ${btn(`${APP_URL}/community/${communitySlug}`, 'Open Community')}
    `);
}

export function memberRejectedEmail(userName: string, communityName: string) {
    return base(`
      <h2 style="margin:0 0 8px;font-size:20px">Update on your application</h2>
      <p style="color:#4b5563;line-height:1.6">Hi ${userName},</p>
      <p style="color:#4b5563;line-height:1.6">
        Unfortunately, your request to join <strong>${communityName}</strong> was not approved at this time.
        This could be due to capacity limits or community fit — don't be discouraged!
      </p>
      <p style="color:#4b5563;line-height:1.6">There are many other communities on Kyoty that might be a perfect match.</p>
      ${btn(`${APP_URL}/communities`, 'Explore communities')}
    `);
}

export function eventRegistrationEmail(
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventId: number,
) {
    return base(`
      <h2 style="margin:0 0 8px;font-size:20px">You're registered! 🎟️</h2>
      <p style="color:#4b5563;line-height:1.6">Hi ${userName},</p>
      <p style="color:#4b5563;line-height:1.6">
        Your spot is confirmed for <strong>${eventTitle}</strong> on <strong>${eventDate}</strong>.
        Show your QR ticket at the event for quick check-in.
      </p>
      ${btn(`${APP_URL}/event/${eventId}/ticket`, 'View My Ticket')}
    `);
}

export function waitlistJoinedEmail(
    userName: string,
    eventTitle: string,
    eventDate: string,
    position: number,
    eventId: number,
) {
    return base(`
      <h2 style="margin:0 0 8px;font-size:20px">You're on the waitlist ⏳</h2>
      <p style="color:#4b5563;line-height:1.6">Hi ${userName},</p>
      <p style="color:#4b5563;line-height:1.6">
        <strong>${eventTitle}</strong> on <strong>${eventDate}</strong> is currently full, but you've been added to the waitlist at position <strong>#${position}</strong>.
        We'll automatically move you to <strong>registered</strong> if a spot opens up — no action needed.
      </p>
      ${btn(`${APP_URL}/event/${eventId}`, 'View Event')}
    `);
}

export function waitlistPromotedEmail(
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventId: number,
) {
    return base(`
      <h2 style="margin:0 0 8px;font-size:20px">You're off the waitlist! 🎉</h2>
      <p style="color:#4b5563;line-height:1.6">Hi ${userName},</p>
      <p style="color:#4b5563;line-height:1.6">
        A spot opened up for <strong>${eventTitle}</strong> on <strong>${eventDate}</strong>
        and you've been automatically moved from the waitlist to <strong style="color:#16a34a">registered</strong>.
      </p>
      ${btn(`${APP_URL}/event/${eventId}/ticket`, 'View My Ticket')}
    `);
}

export function organizerMessageEmail(
    eventTitle: string,
    subject: string,
    body: string,
    eventId: number,
) {
    return base(`
      <h2 style="margin:0 0 8px;font-size:20px">${subject}</h2>
      <p style="color:#6b7280;font-size:13px;margin-bottom:16px">
        Message from the organiser of <strong>${eventTitle}</strong>
      </p>
      <p style="color:#374151;line-height:1.7;white-space:pre-line">${body}</p>
      ${btn(`${APP_URL}/event/${eventId}`, 'View Event')}
    `);
}
