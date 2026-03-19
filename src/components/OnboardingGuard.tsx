'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { User } from '@/types';

export function OnboardingGuard({ user, children }: { user: User | null, children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (user && !user.social_proof_link && pathname !== '/onboarding') {
            router.push('/onboarding');
        }
    }, [user, pathname, router]);

    if (user && !user.social_proof_link && pathname !== '/onboarding') {
        return null; // Prevent flashing protected content
    }

    return <>{children}</>;
}
