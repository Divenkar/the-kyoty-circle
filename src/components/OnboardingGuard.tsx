'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import type { User } from '@/types';

export function OnboardingGuard({ user, children }: { user: User | null, children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const authFreePaths = ['/onboarding', '/login', '/forgot-password'];
    const shouldRedirect = !!user && !user.onboarding_completed && !authFreePaths.includes(pathname);

    useEffect(() => {
        if (shouldRedirect) {
            // Preserve the current path (and any existing next param) so the user
            // returns to their original destination after completing onboarding.
            const existingNext = searchParams.get('next');
            const destination = existingNext ?? pathname;
            const target = destination && destination !== '/onboarding'
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
