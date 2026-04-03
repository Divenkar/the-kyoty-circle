'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { User } from '@/types';

export function OnboardingGuard({ user, children }: { user: User | null, children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const authFreePaths = ['/onboarding', '/login', '/forgot-password'];
    const shouldRedirect = !!user && !user.onboarding_completed && !authFreePaths.includes(pathname);

    useEffect(() => {
        if (shouldRedirect) {
            router.push('/onboarding');
        }
    }, [router, shouldRedirect]);

    if (shouldRedirect) {
        return null; // Prevent flashing protected content
    }

    return <>{children}</>;
}
