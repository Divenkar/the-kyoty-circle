import type { Metadata } from "next";
import { Shield, Eye, Share2, Cookie, UserCheck, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Kyoty",
  description:
    "Learn how Kyoty collects, uses, and protects your personal information.",
};

const sections = [
  {
    icon: Eye,
    title: "Information We Collect",
    content: [
      "When you create an account on Kyoty, we collect information you provide directly, including your name, email address, profile photo, and any other details you choose to share on your profile.",
      "We use Clerk as our authentication provider. When you sign up or log in, Clerk may collect additional authentication-related data such as your IP address, device information, and login timestamps to keep your account secure.",
      "When you interact with communities, create events, or RSVP, we collect data about those interactions to provide and improve the platform experience.",
      "We automatically collect certain technical information when you use Kyoty, including browser type, operating system, referring URLs, pages visited, and time spent on pages.",
    ],
  },
  {
    icon: Shield,
    title: "How We Use Your Information",
    content: [
      "We use your personal information to create and manage your Kyoty account, enable you to join communities, create and attend events, and interact with other members.",
      "Your data helps us personalize your experience, such as recommending relevant communities and events based on your interests and location.",
      "We use aggregated, anonymized data to understand how our platform is used and to improve our features, performance, and user experience.",
      "We may send you transactional emails (event reminders, community updates) and, with your consent, promotional communications about new features or communities you might enjoy.",
    ],
  },
  {
    icon: Share2,
    title: "Data Sharing & Third Parties",
    content: [
      "We do not sell your personal information to third parties. We share data only as described in this policy.",
      "Your profile information and community activity are visible to other Kyoty users according to your privacy settings. Community organizers can see the list of members and event attendees within their communities.",
      "We use Supabase as our database and storage provider. Your data is stored securely in Supabase-managed infrastructure with row-level security policies enforced at the database level.",
      "Payment processing for paid events is handled by Razorpay. When you purchase a ticket, Razorpay collects your payment information directly. We do not store your full card details on our servers.",
      "We may share data with service providers who assist us in operating the platform (analytics, email delivery, hosting), all bound by confidentiality agreements.",
    ],
  },
  {
    icon: Cookie,
    title: "Cookies & Tracking",
    content: [
      "Kyoty uses essential cookies to keep you logged in and maintain your session. These are strictly necessary for the platform to function.",
      "We use analytics cookies to understand how users navigate and interact with the platform. This data is aggregated and does not personally identify you.",
      "Clerk, our authentication provider, sets cookies necessary for secure authentication and session management.",
      "You can control cookie preferences through your browser settings. Disabling essential cookies may prevent you from using certain features of the platform.",
    ],
  },
  {
    icon: UserCheck,
    title: "Your Rights",
    content: [
      "You have the right to access, correct, or delete your personal information at any time. You can update most of your profile details directly from your Kyoty settings page.",
      "You can request a full export of your data or ask us to delete your account and associated data by contacting us at the address below.",
      "You have the right to opt out of non-essential communications at any time by updating your notification preferences or using the unsubscribe link in our emails.",
      "If you are located in the European Economic Area, you have additional rights under GDPR, including the right to data portability and the right to lodge a complaint with a supervisory authority.",
    ],
  },
  {
    icon: Mail,
    title: "Contact Us",
    content: [
      "If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please contact us.",
      "Email: hello@kyoty.in",
      "We aim to respond to all privacy-related inquiries within 5 business days.",
      "This policy may be updated from time to time. We will notify you of any material changes by posting the updated policy on this page and updating the date above.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-primary-100 p-3">
            <Shield className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Privacy Policy
          </h1>
          <p className="mt-3 text-base text-neutral-500">
            Last updated: April 2026
          </p>
        </div>

        {/* Intro */}
        <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          <p className="leading-relaxed text-neutral-700">
            At Kyoty, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our community events platform. Please read
            this policy carefully. By using Kyoty, you agree to the collection
            and use of information in accordance with this policy.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                    <Icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-900">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-3">
                  {section.content.map((paragraph, i) => (
                    <p
                      key={i}
                      className="leading-relaxed text-neutral-600"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
