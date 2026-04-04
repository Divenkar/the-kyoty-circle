"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-neutral-900">
          Something went wrong
        </h1>
        <p className="mt-3 text-base leading-relaxed text-neutral-500">
          An unexpected error occurred. Don&apos;t worry, our team has been
          notified. You can try again or head back to the home page.
        </p>

        {/* Error digest for debugging */}
        {error.digest && (
          <p className="mt-4 rounded-xl bg-neutral-100 px-4 py-2 font-mono text-xs text-neutral-400">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
