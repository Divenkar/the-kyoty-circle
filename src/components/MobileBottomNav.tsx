'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Compass, UserCircle, Users } from 'lucide-react';
import { CreateMenu } from './CreateMenu';

const LEFT_ITEMS = [
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/communities', label: 'Spaces', icon: Users },
];

const RIGHT_ITEMS = [
    { href: '/notifications', label: 'Activity', icon: Bell },
    { href: '/profile', label: 'Profile', icon: UserCircle },
];

const HIDDEN_PATHS = ['/login', '/forgot-password', '/onboarding'];

export function MobileBottomNav() {
    const pathname = usePathname();

    if (HIDDEN_PATHS.some((path) => pathname.startsWith(path)) || pathname.startsWith('/auth')) {
        return null;
    }

    const isActive = (href: string) => {
        if (href === '/explore') return pathname.startsWith('/explore') || pathname.startsWith('/event/');
        if (href === '/communities') return pathname.startsWith('/communities') || pathname.startsWith('/community/');
        if (href === '/notifications') return pathname.startsWith('/notifications');
        return pathname.startsWith('/profile');
    };

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden"
            aria-label="Mobile navigation"
        >
            <div className="mx-auto flex max-w-md items-end justify-around gap-1">
                {/* Left two items */}
                {LEFT_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-colors ${
                                active
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                            }`}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}

                {/* Center Create FAB */}
                <div className="flex flex-col items-center justify-center px-2">
                    <CreateMenu variant="mobile-fab" />
                </div>

                {/* Right two items */}
                {RIGHT_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-colors ${
                                active
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                            }`}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
