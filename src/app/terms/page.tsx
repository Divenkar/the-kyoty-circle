import type { Metadata } from "next";
import {
  FileText,
  CheckCircle2,
  User,
  Shield,
  Users,
  Calendar,
  PenLine,
  XCircle,
  Scale,
  RefreshCw,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Kyoty",
  description:
    "Read the terms and conditions for using the Kyoty community events platform.",
};

const sections = [
  {
    icon: CheckCircle2,
    title: "Acceptance of Terms",
    content: [
      'By accessing or using Kyoty ("the Platform"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing the Platform.',
      "These Terms of Service apply to all users of the Platform, including community organizers, event hosts, attendees, and general visitors.",
    ],
  },
  {
    icon: User,
    title: "Eligibility",
    content: [
      "You must be at least 16 years of age to use Kyoty. By registering for an account, you represent and warrant that you meet this age requirement.",
      "If you are using the Platform on behalf of an organization, you represent that you have the authority to bind that organization to these terms.",
    ],
  },
  {
    icon: Shield,
    title: "Account Responsibilities",
    content: [
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.",
      "You must provide accurate, complete, and current information when creating your account. Accounts created with false or misleading information may be suspended or terminated.",
      "You may not transfer your account to another person or use another person's account without permission.",
    ],
  },
  {
    icon: Users,
    title: "Community Guidelines",
    content: [
      "Kyoty is a platform for building genuine communities and hosting meaningful events. You agree to treat all users with respect and to not engage in harassment, discrimination, hate speech, or any form of abusive behavior.",
      "Community organizers are responsible for moderating their communities and ensuring that content and events comply with these terms and applicable laws.",
      "You may not use the Platform to distribute spam, malware, or any content that is illegal, harmful, threatening, defamatory, or otherwise objectionable.",
      "We reserve the right to remove any content or suspend any account that violates these guidelines, at our sole discretion.",
    ],
  },
  {
    icon: Calendar,
    title: "Events & Payments",
    content: [
      "Community organizers may create free or paid events on the Platform. By purchasing a ticket to a paid event, you agree to pay the listed price plus any applicable fees.",
      "Payments are processed securely through Razorpay. By making a payment, you also agree to Razorpay's terms of service. Kyoty does not store your full payment card details.",
      "Refund policies for paid events are set by individual event organizers. Kyoty is not responsible for issuing refunds unless required by applicable law. We encourage organizers to publish clear refund policies.",
      "Kyoty may charge a platform fee on paid event tickets. This fee will be clearly disclosed before any transaction is completed.",
    ],
  },
  {
    icon: PenLine,
    title: "User Content",
    content: [
      "You retain ownership of any content you post on Kyoty, including community posts, comments, event descriptions, and images.",
      "By posting content on the Platform, you grant Kyoty a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content in connection with operating and promoting the Platform.",
      "You are solely responsible for the content you post. You represent that you have all necessary rights to the content and that it does not infringe upon the rights of any third party.",
    ],
  },
  {
    icon: XCircle,
    title: "Termination",
    content: [
      "We may suspend or terminate your account and access to the Platform at any time, with or without cause, and with or without notice. Reasons for termination may include violations of these terms, abusive behavior, or prolonged inactivity.",
      "You may delete your account at any time through your account settings. Upon deletion, your personal data will be removed in accordance with our Privacy Policy, though some information may be retained as required by law.",
      "Upon termination, your right to use the Platform ceases immediately. Sections of these terms that by their nature should survive termination will remain in effect.",
    ],
  },
  {
    icon: Scale,
    title: "Limitation of Liability",
    content: [
      'Kyoty is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding the reliability, accuracy, or availability of the Platform.',
      "To the fullest extent permitted by law, Kyoty and its founders, employees, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.",
      "Our total liability to you for any claim arising from your use of the Platform shall not exceed the amount you paid to Kyoty in the 12 months preceding the claim, or INR 5,000, whichever is greater.",
      "Kyoty is not responsible for the actions, content, or events created by users. Interactions between users, including at in-person events, are solely between those users.",
    ],
  },
  {
    icon: RefreshCw,
    title: "Changes to These Terms",
    content: [
      "We reserve the right to modify these Terms of Service at any time. When we make changes, we will update the date at the top of this page and, for material changes, notify you via email or a prominent notice on the Platform.",
      'Your continued use of Kyoty after any changes constitutes acceptance of the new terms. If you do not agree to the revised terms, you should discontinue use of the Platform.',
    ],
  },
  {
    icon: Mail,
    title: "Contact",
    content: [
      "If you have any questions about these Terms of Service, please contact us.",
      "Email: hello@kyoty.in",
      "We will do our best to address your concerns promptly and fairly.",
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-primary-100 p-3">
            <FileText className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Terms of Service
          </h1>
          <p className="mt-3 text-base text-neutral-500">
            Effective: April 2026 &middot; Last updated: April 2026
          </p>
        </div>

        {/* Intro */}
        <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          <p className="leading-relaxed text-neutral-700">
            Welcome to Kyoty. These Terms of Service govern your use of our
            community events platform and all related services. Please read
            these terms carefully before using the Platform.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
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
                    <span className="mr-2 text-primary-400">
                      {index + 1}.
                    </span>
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
