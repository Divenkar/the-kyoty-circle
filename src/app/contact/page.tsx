"use client";

// Note: Metadata cannot be exported from a client component.
// To set metadata, create a separate layout.tsx in this directory or use generateMetadata in a parent.

import { useState, type FormEvent } from "react";
import { Mail, Clock, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const subjects = [
  { value: "general", label: "General Inquiry" },
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "partnership", label: "Partnership" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    // Simulate a short delay for UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "general", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-primary-100 p-3">
            <MessageSquare className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Get in Touch
          </h1>
          <p className="mt-3 text-base text-neutral-500">
            Have a question, found a bug, or want to partner with us? We&apos;d
            love to hear from you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-neutral-700"
                  >
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Your name"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-neutral-700"
                  >
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="mt-5">
                <label
                  htmlFor="subject"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  {subjects.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="mt-5">
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Tell us more about your question or feedback..."
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Email */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                <Mail className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Email Us
              </h3>
              <a
                href="mailto:hello@kyoty.in"
                className="mt-1 block text-sm text-primary-600 transition hover:text-primary-700"
              >
                hello@kyoty.in
              </a>
            </div>

            {/* Response Time */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                <Clock className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Response Time
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                We typically respond within 24&ndash;48 hours on business days.
              </p>
            </div>

            {/* Social / Community */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                <MessageSquare className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Community
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Join the conversation and connect with other community
                organizers.
              </p>
              <div className="mt-3 flex gap-3">
                <a
                  href="https://x.com/kyotyHQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary-600 transition hover:text-primary-700"
                >
                  X / Twitter
                </a>
                <span className="text-neutral-300">|</span>
                <a
                  href="https://instagram.com/kyoty.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary-600 transition hover:text-primary-700"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
