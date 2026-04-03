'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import type { User } from '@/types';

// Inner component uses useSearchParams — must live inside a <Suspense> boundary.
function OnboardingGuardInner({ user, children }: { user: User | null; children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const authFreePaths = ['/onboarding', '/login', '/forgot-password'];
    const shouldRedirect = !!user && !user.onboarding_completed && !authFreePaths.includes(pathname);

    useEffect(() => {
        if (shouldRedirect) {
            // Preserve the current path so the user returns to their original
            // destination after completing onboarding.
            const existingNext = searchParams.get('next');
            const destination = existingNext ?? pathname;
            const target =
                destination && destination !== '/onboarding'
                    ? `/onboarding?next=${encodeURIComponent(destination)}`
                    : '/onboarding';
            router.push(target);
        }
    }, [router, shouldRedirect, pathname, searchParams]);

    if (shouldRedirect) {
        return null; // Prevent flashing protected content
    }

    return <>{children}</>;
}

export function OnboardingGuard({ user, children }: { user: User | null; children: React.ReactNode }) {
    // Suspense is required because the inner component calls useSearchParams().
    // The fallback renders children directly — safe because auth state cannot
    // be determined during SSR anyway; the client-side effect handles redirects.
    return (
        <Suspense fallback={<>{children}</>}>
            <OnboardingGuardInner user={user}>{children}</OnboardingGuardInner>
        </Suspense>
    );
}
