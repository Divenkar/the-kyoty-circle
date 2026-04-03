'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Compass, Home, LogOut, Menu, Settings, Sparkles, User as UserIcon, Users, X } from 'lucide-react';
import Image from 'next/image';
import { NotificationBell } from './NotificationBell';
import { useClerk, useUser } from '@clerk/nextjs';

interface NavbarProps {
    initialUserRole?: string | null;
    initialUserEmail?: string | null;
    initialUserName?: string | null;
    initialAvatarUrl?: string | null;
    initialUserId?: number | null;
}

export function Navbar({ initialUserRole, initialUserEmail, initialUserName, initialAvatarUrl, initialUserId }: NavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

    const { user: clerkUser, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();

    const effectiveRole = isSignedIn ? initialUserRole : null;
    const isAdminRole = effectiveRole === 'admin' || effectiveRole === 'kyoty_admin';

    useEffect(() => {
        setMobileOpen(false);
        setAvatarMenuOpen(false);
    }, [pathname]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
        router.refresh();
    };

    const isActive = (href: string) => href === '/' ? pathname === href : pathname.startsWith(href);

    const publicNavLinks = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/explore', label: 'Explore', icon: Compass },
        { href: '/communities', label: 'Communities', icon: Users },
    ];

    const authNavLinks = [
        { href: '/create-community', label: 'Start a community', icon: Sparkles },
    ];

    const navLinks = isSignedIn ? [...publicNavLinks, ...authNavLinks] : publicNavLinks;

    const displayEmail = clerkUser?.primaryEmailAddress?.emailAddress || initialUserEmail;
    const displayName = clerkUser?.fullName || initialUserName;
    const avatarUrl = clerkUser?.imageUrl || initialAvatarUrl;

    const loading = !isLoaded;

    return (
        <nav className="sticky top-0 z-50 border-b border-white/60 bg-white/85 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex min-h-[72px] items-center justify-between gap-4 py-3">
                    {/* Logo */}
                    <Link href="/" className="flex shrink-0 items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-600/20">
                            <span className="text-base font-extrabold tracking-tight text-white">K</span>
                        </div>
                        <div className="hidden sm:block">
                            <span className="block text-lg font-bold text-neutral-900">Kyoty</span>
                            <span className="block text-xs text-neutral-500">Verified communities & events</span>
                        </div>
                    </Link>

                    {/* Desktop Nav Pill */}
                    <div className="hidden items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 p-1 md:flex">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${isActive(link.href)
                                        ? 'bg-white text-primary-700 shadow-sm'
                                        : 'text-neutral-600 hover:text-neutral-900'
                                        }`}
                                >
                                    <Icon size={15} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Unauthenticated */}
                        {!loading && !isSignedIn && (
                            <>
                                <Link
                                    href="/login"
                                    className="hidden rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 sm:block"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/login"
                                    className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-700 hover:shadow-md"
                                >
                                    Join Kyoty
                                </Link>
                            </>
                        )}

                        {/* Authenticated */}
                        {!loading && isSignedIn && (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`hidden rounded-full px-4 py-2 text-sm font-medium transition-colors sm:flex items-center gap-1.5 ${isActive('/dashboard')
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                        }`}
                                >
                                    Dashboard
                                </Link>

                                {isAdminRole && (
                                    <Link
                                        href="/admin"
                                        className={`hidden rounded-full px-4 py-2 text-sm font-medium transition-colors sm:flex items-center gap-1.5 ${isActive('/admin')
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                            }`}
                                    >
                                        <Settings size={14} />
                                        Admin
                                    </Link>
                                )}

                                <NotificationBell userId={initialUserId ?? null} />

                                {/* Avatar dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                                        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-100 transition-colors hover:border-primary-300"
                                        aria-label="Account menu"
                                        aria-expanded={avatarMenuOpen}
                                    >
                                        {avatarUrl ? (
                                            <Image src={avatarUrl} alt="Profile" width={40} height={40} className="h-full w-full object-cover" unoptimized />
                                        ) : (
                                            <UserIcon size={18} className="text-neutral-600" />
                                        )}
                                    </button>
                                    {avatarMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-neutral-100 bg-white py-1 shadow-xl z-50">
                                        <div className="border-b border-neutral-100 px-4 py-3">
                                            {displayName && (
                                                <p className="text-sm font-semibold text-neutral-900">{displayName}</p>
                                            )}
                                            <p className="mt-0.5 truncate text-xs text-neutral-500">{displayEmail}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                                            >
                                                <UserIcon size={15} className="text-neutral-400" />
                                                My Dashboard
                                            </Link>
                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                                            >
                                                <UserIcon size={15} className="text-neutral-400" />
                                                My Profile
                                            </Link>
                                            <Link
                                                href="/notifications"
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                                            >
                                                <Bell size={15} className="text-neutral-400" />
                                                Notifications
                                            </Link>
                                            <Link
                                                href="/create-community"
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                                            >
                                                <Sparkles size={15} className="text-neutral-400" />
                                                Start a community
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                                            >
                                                <Settings size={15} className="text-neutral-400" />
                                                Settings
                                            </Link>
                                            {isAdminRole && (
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                                                >
                                                    <Settings size={15} className="text-neutral-400" />
                                                    Admin panel
                                                </Link>
                                            )}
                                        </div>
                                        <div className="border-t border-neutral-100 pt-1">
                                            <button
                                                onClick={handleSignOut}
                                                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                                            >
                                                <LogOut size={15} />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 md:hidden"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                            aria-expanded={mobileOpen}
                        >
                            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="border-t border-neutral-200 bg-white px-4 py-4 md:hidden max-h-[calc(100vh-4.5rem)] overflow-y-auto">
                    <div className="space-y-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${isActive(link.href)
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-neutral-600 hover:bg-neutral-50'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {link.label}
                                </Link>
                            );
                        })}

                        {isSignedIn ? (
                            <div className="border-t border-neutral-100 pt-3 space-y-1">
                                <Link href="/dashboard" className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                                    <UserIcon size={16} />
                                    Dashboard
                                </Link>
                                <Link href="/profile" className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${isActive('/profile') ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                                    <UserIcon size={16} />
                                    My Profile
                                </Link>
                                <Link href="/notifications" className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${isActive('/notifications') ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                                    <Bell size={16} />
                                    Notifications
                                </Link>
                                <Link href="/settings" className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${isActive('/settings') ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                                    <Settings size={16} />
                                    Settings
                                </Link>
                                {isAdminRole && (
                                    <Link href="/admin" className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${isActive('/admin') ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                                        <Settings size={16} />
                                        Admin Panel
                                    </Link>
                                )}
                                <div className="border-t border-neutral-100 pt-1 mt-1">
                                    <div className="px-4 py-2">
                                        <p className="text-xs text-neutral-400 truncate">{displayEmail}</p>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-t border-neutral-100 pt-3">
                                <Link
                                    href="/login"
                                    className="block w-full rounded-2xl bg-primary-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                                >
                                    Sign Up / Login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
