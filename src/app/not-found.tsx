import Link from "next/link";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md text-center">
        {/* Large 404 */}
        <p className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-[8rem] font-extrabold leading-none tracking-tighter text-transparent sm:text-[10rem]">
          404
        </p>

        {/* Heading and message */}
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">
          Page not found
        </h1>
        <p className="mt-3 text-base leading-relaxed text-neutral-500">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It
          might have been moved, deleted, or maybe the URL is incorrect.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
          <Link
            href="/explore"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 sm:w-auto"
          >
            <Compass className="h-4 w-4" />
            Explore events
          </Link>
        </div>
      </div>
    </div>
  );
}
