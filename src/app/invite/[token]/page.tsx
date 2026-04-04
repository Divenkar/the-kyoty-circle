"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Users, Sparkles, ArrowRight } from "lucide-react";

export default function InviteLandingPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params.token;

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/api/invite/${token}`);
    }, 1500);

    return () => clearTimeout(timer);
  }, [router, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md text-center">
        {/* Card */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm sm:p-10">
          {/* Sparkle decoration */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-400" />
            <Sparkles className="h-3 w-3 text-primary-300" />
          </div>

          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-200">
            <Users className="h-10 w-10 text-white" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-neutral-900">
            You&apos;ve been invited!
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            Someone invited you to join their community on Kyoty. Hang tight
            while we set things up for you.
          </p>

          {/* Animated spinner */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
            <span className="text-sm font-medium text-neutral-400">
              Redirecting you...
            </span>
          </div>

          {/* Noscript fallback */}
          <noscript>
            <div className="mt-6">
              <a
                href={`/api/invite/${token}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
              >
                Accept invite
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </noscript>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-xs text-neutral-400">
          If you&apos;re not redirected automatically,{" "}
          <a
            href={`/api/invite/${token}`}
            className="font-medium text-primary-500 underline transition hover:text-primary-600"
          >
            click here
          </a>
          .
        </p>
      </div>
    </div>
  );
}
