'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Bell,
    Compass,
    Home,
    LayoutDashboard,
    LogOut,
    Menu,
    Search,
    Settings,
    Shield,
    User as UserIcon,
    Users,
    X,
} from 'lucide-react';
import Image from 'next/image';
import { NotificationBell } from './NotificationBell';
import { CreateMenu } from './CreateMenu';
import { useClerk, useUser } from '@clerk/nextjs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavLink {
    href: string;
    label: string;
    icon: React.ElementType;
}

interface NavbarProps {
    initialUserRole?: string | null;
    initialUserEmail?: string | null;
    initialUserName?: string | null;
    initialAvatarUrl?: string | null;
    initialUserId?: number | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PUBLIC_NAV_LINKS: NavLink[] = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/communities', label: 'Communities', icon: Users },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function NavPillLink({ href, label, icon: Icon, isActive }: NavLink & { isActive: boolean }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isActive
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
            }`}
        >
            <Icon size={15} aria-hidden="true" />
            {label}
        </Link>
    );
}

function MobileNavLink({ href, label, icon: Icon, isActive }: NavLink & { isActive: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-50'
            }`}
        >
            <Icon size={16} aria-hidden="true" />
            {label}
        </Link>
    );
}

function DropdownMenuItem({
    href,
    label,
    icon: Icon,
}: {
    href: string;
    label: string;
    icon: React.ElementType;
}) {
    return (
        <Link
            href={href}
            role="menuitem"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
            <Icon size={15} className="text-neutral-400" aria-hidden="true" />
            {label}
        </Link>
    );
}

// ---------------------------------------------------------------------------
// Avatar dropdown
// ---------------------------------------------------------------------------

interface AvatarDropdownProps {
    displayName?: string | null;
    displayEmail?: string | null;
    avatarUrl?: string | null;
    isAdminRole: boolean;
    onSignOut: () => void;
}

function AvatarDropdown({
    displayName,
    displayEmail,
    avatarUrl,
    isAdminRole,
    onSignOut,
}: AvatarDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Close on route change
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Close on click-outside
    useEffect(() => {
        if (!open) return;
        function handlePointerDown(e: PointerEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-100 transition-colors hover:border-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Account menu"
                aria-haspopup="true"
                aria-expanded={open}
            >
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                        unoptimized
                    />
                ) : (
                    <UserIcon size={18} className="text-neutral-600" aria-hidden="true" />
                )}
            </button>

            {open && (
                <div
                    role="menu"
                    aria-label="Account options"
                    className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-neutral-100 bg-white py-1 shadow-xl"
                >
                    {/* User identity */}
                    <div className="border-b border-neutral-100 px-4 py-3">
                        {displayName && (
                            <p className="text-sm font-semibold text-neutral-900">{displayName}</p>
                        )}
                        <p className="mt-0.5 truncate text-xs text-neutral-500">{displayEmail}</p>
                    </div>

                    {/* Navigation items */}
                    <div className="py-1">
                        <DropdownMenuItem href="/dashboard" label="My Dashboard" icon={LayoutDashboard} />
                        <DropdownMenuItem href="/profile" label="My Profile" icon={UserIcon} />
                        <DropdownMenuItem href="/notifications" label="Notifications" icon={Bell} />
                        <DropdownMenuItem href="/create-community" label="Start a community" icon={Users} />
                        <DropdownMenuItem href="/settings" label="Settings" icon={Settings} />
                        {isAdminRole && (
                            <DropdownMenuItem href="/admin" label="Admin panel" icon={Shield} />
                        )}
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-neutral-100 pt-1">
                        <button
                            role="menuitem"
                            onClick={onSignOut}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                            <LogOut size={15} aria-hidden="true" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Mobile menu
// ---------------------------------------------------------------------------

interface MobileMenuProps {
    navLinks: NavLink[];
    isActive: (href: string) => boolean;
    isSignedIn: boolean;
    isAdminRole: boolean;
    displayEmail?: string | null;
    onSignOut: () => void;
}

function MobileMenu({
    navLinks,
    isActive,
    isSignedIn,
    isAdminRole,
    displayEmail,
    onSignOut,
}: MobileMenuProps) {
    return (
        <div className="border-t border-neutral-200 bg-white px-4 py-4 md:hidden max-h-[calc(100vh-4.5rem)] overflow-y-auto">
            <nav aria-label="Mobile navigation">
                {/* Mobile search */}
                <Link
                    href="/search"
                    className="mb-3 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500 transition hover:border-primary-300"
                >
                    <Search size={16} />
                    Search communities, events...
                </Link>

                <div className="space-y-1">
                    {navLinks.map((link) => (
                        <MobileNavLink key={link.href} {...link} isActive={isActive(link.href)} />
                    ))}
                </div>

                {isSignedIn ? (
                    <div className="mt-3 space-y-1 border-t border-neutral-100 pt-3">
                        <MobileNavLink href="/dashboard" label="Dashboard" icon={LayoutDashboard} isActive={isActive('/dashboard')} />
                        <MobileNavLink href="/profile" label="My Profile" icon={UserIcon} isActive={isActive('/profile')} />
                        <MobileNavLink href="/notifications" label="Activity" icon={Bell} isActive={isActive('/notifications')} />
                        <MobileNavLink href="/create-event" label="Create Event" icon={Settings} isActive={isActive('/create-event')} />
                        <MobileNavLink href="/create-community" label="Start Community" icon={Users} isActive={isActive('/create-community')} />
                        <MobileNavLink href="/settings" label="Settings" icon={Settings} isActive={isActive('/settings')} />
                        {isAdminRole && (
                            <MobileNavLink href="/admin" label="Admin Panel" icon={Shield} isActive={isActive('/admin')} />
                        )}

                        <div className="border-t border-neutral-100 pt-2 mt-2">
                            {displayEmail && (
                                <p className="px-4 pb-1 text-xs text-neutral-400 truncate">{displayEmail}</p>
                            )}
                            <button
                                onClick={onSignOut}
                                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                            >
                                <LogOut size={16} aria-hidden="true" />
                                Sign out
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-3 border-t border-neutral-100 pt-3 space-y-2">
                        <Link
                            href="/login"
                            className="block w-full rounded-2xl border border-neutral-200 px-4 py-3 text-center text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/signup"
                            className="block w-full rounded-2xl bg-primary-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                        >
                            Join Kyoty
                        </Link>
                    </div>
                )}
            </nav>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Avatar skeleton (prevents layout shift while Clerk loads)
// ---------------------------------------------------------------------------

function AvatarSkeleton() {
    return (
        <div className="h-11 w-11 animate-pulse rounded-full bg-neutral-200" aria-hidden="true" />
    );
}

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------

export function Navbar({
    initialUserRole,
    initialUserEmail,
    initialUserName,
    initialAvatarUrl,
    initialUserId,
}: NavbarProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const { user: clerkUser, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();

    const effectiveRole = isSignedIn ? initialUserRole : null;
    const isAdminRole = effectiveRole === 'admin' || effectiveRole === 'kyoty_admin';

    const navLinks = PUBLIC_NAV_LINKS;

    const displayEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? initialUserEmail;
    const displayName = clerkUser?.fullName ?? initialUserName;
    const avatarUrl = clerkUser?.imageUrl ?? initialAvatarUrl;

    const isActive = useCallback(
        (href: string) => (href === '/' ? pathname === href : pathname.startsWith(href)),
        [pathname],
    );

    const handleSignOut = useCallback(async () => {
        await signOut({ redirectUrl: '/' });
    }, [signOut]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Prevent body scroll while mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    return (
        <nav
            className="sticky top-0 z-50 border-b border-white/60 bg-white/85 backdrop-blur-xl"
            aria-label="Main navigation"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex min-h-[72px] items-center justify-between gap-4 py-3">

                    {/* Logo */}
                    <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Kyoty home">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-600/20">
                            <span className="text-base font-extrabold tracking-tight text-white" aria-hidden="true">K</span>
                        </div>
                        <div className="hidden sm:block">
                            <span className="block text-lg font-bold text-neutral-900">Kyoty</span>
                            <span className="block text-xs text-neutral-500">Verified communities &amp; events</span>
                        </div>
                    </Link>

                    {/* Desktop nav pill */}
                    <div
                        className="hidden items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 p-1 md:flex"
                        role="list"
                    >
                        {navLinks.map((link) => (
                            <div key={link.href} role="listitem">
                                <NavPillLink {...link} isActive={isActive(link.href)} />
                            </div>
                        ))}
                    </div>

                    {/* Search bar */}
                    <Link
                        href="/search"
                        className="hidden items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-sm text-neutral-400 transition-colors hover:border-primary-300 hover:text-neutral-600 md:flex"
                    >
                        <Search size={15} />
                        <span className="min-w-[100px]">Search...</span>
                        <kbd className="ml-2 rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-400">
                            /
                        </kbd>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center gap-2 sm:gap-3">

                        {/* Loading skeleton */}
                        {!isLoaded && <AvatarSkeleton />}

                        {/* Unauthenticated */}
                        {isLoaded && !isSignedIn && (
                            <>
                                <Link
                                    href="/login"
                                    className="hidden rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 sm:block"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/signup"
                                    className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-700 hover:shadow-md"
                                >
                                    Join Kyoty
                                </Link>
                            </>
                        )}

                        {/* Authenticated */}
                        {isLoaded && isSignedIn && (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`hidden rounded-full px-4 py-2 text-sm font-medium transition-colors sm:flex items-center gap-1.5 ${
                                        isActive('/dashboard')
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                    }`}
                                >
                                    Dashboard
                                </Link>

                                {isAdminRole && (
                                    <Link
                                        href="/admin"
                                        className={`hidden rounded-full px-4 py-2 text-sm font-medium transition-colors sm:flex items-center gap-1.5 ${
                                            isActive('/admin')
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                        }`}
                                    >
                                        <Shield size={14} aria-hidden="true" />
                                        Admin
                                    </Link>
                                )}

                                <div className="hidden sm:block">
                                    <CreateMenu variant="desktop" />
                                </div>

                                <NotificationBell userId={initialUserId ?? null} />

                                <AvatarDropdown
                                    displayName={displayName}
                                    displayEmail={displayEmail}
                                    avatarUrl={avatarUrl}
                                    isAdminRole={isAdminRole}
                                    onSignOut={handleSignOut}
                                />
                            </>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 md:hidden"
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={mobileOpen}
                            aria-controls="mobile-menu"
                        >
                            {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div id="mobile-menu">
                    <MobileMenu
                        navLinks={navLinks}
                        isActive={isActive}
                        isSignedIn={!!isSignedIn}
                        isAdminRole={isAdminRole}
                        displayEmail={displayEmail}
                        onSignOut={handleSignOut}
                    />
                </div>
            )}
        </nav>
    );
}
