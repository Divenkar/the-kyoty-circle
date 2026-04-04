'use server';

import { sendEmail } from '@/lib/email';

interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export async function submitContactFormAction(data: ContactFormData) {
    const { name, email, subject, message } = data;

    if (!name || !email || !message) {
        return { success: false, error: 'Please fill in all required fields.' };
    }

    const subjectLabels: Record<string, string> = {
        general: 'General Inquiry',
        bug: 'Bug Report',
        feature: 'Feature Request',
        partnership: 'Partnership',
    };

    const subjectLabel = subjectLabels[subject] || subject;

    const html = `
    <div style="font-family:Inter,sans-serif;max-width:580px;margin:0 auto;color:#1a1a2e">
      <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:28px 32px;border-radius:16px 16px 0 0">
        <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px">Kyoty</span>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px">
        <h2 style="margin:0 0 8px;font-size:20px">New Contact Form Submission</h2>
        <p style="color:#4b5563;line-height:1.6"><strong>From:</strong> ${name} (${email})</p>
        <p style="color:#4b5563;line-height:1.6"><strong>Subject:</strong> ${subjectLabel}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
        <p style="color:#374151;line-height:1.7;white-space:pre-line">${message}</p>
      </div>
    </div>`;

    try {
        await sendEmail({
            to: process.env.CONTACT_EMAIL || 'hello@kyoty.in',
            subject: `[Contact] ${subjectLabel} from ${name}`,
            html,
        });
        return { success: true };
    } catch {
        return { success: false, error: 'Failed to send message. Please try again.' };
    }
}
