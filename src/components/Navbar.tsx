'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Compass, Home, LogOut, Menu, Sparkles, User as UserIcon, Users, X } from 'lucide-react';
import Image from 'next/image';
import { NotificationBell } from './NotificationBell';
import { supabase } from '@/lib/supabase';

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const navLinks = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/explore', label: 'Explore', icon: Compass },
        { href: '/communities', label: 'Communities', icon: Users },
        { href: '/create-community', label: 'Start a community', icon: Sparkles },
    ];

    const isActive = (href: string) => href === '/' ? pathname === href : pathname.startsWith(href);

    return (
        <nav className="sticky top-0 z-50 border-b border-white/60 bg-white/85 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex min-h-[72px] items-center justify-between gap-4 py-3">
                    <Link href="/" className="flex shrink-0 items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-600/20">
                            <span className="text-base font-extrabold tracking-tight text-white">K</span>
                        </div>
                        <div>
                            <span className="block text-lg font-bold text-neutral-900">Kyoty</span>
                            <span className="block text-xs text-neutral-500">Verified communities & events</span>
                        </div>
                    </Link>

                    <div className="hidden items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 p-1 md:flex">
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

                    <div className="flex items-center gap-2 sm:gap-3">
                        {!loading && !user && (
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

                        {!loading && user && (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`hidden rounded-full px-4 py-2 text-sm font-medium transition-colors sm:flex ${isActive('/dashboard')
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                        }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/admin"
                                    className={`hidden rounded-full px-4 py-2 text-sm font-medium transition-colors sm:flex ${isActive('/admin')
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                        }`}
                                >
                                    Admin
                                </Link>
                                <NotificationBell />
                                <div className="relative group">
                                    <button className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
                                        {user.user_metadata?.avatar_url ? (
                                            <Image src={user.user_metadata.avatar_url} alt="Profile" width={40} height={40} className="h-full w-full object-cover" unoptimized />
                                        ) : (
                                            <UserIcon size={20} className="text-neutral-600" />
                                        )}
                                    </button>
                                    <div className="absolute right-0 mt-2 hidden w-56 overflow-hidden rounded-2xl border border-neutral-100 bg-white py-1 shadow-xl group-hover:block">
                                        <div className="border-b border-neutral-100 px-4 py-3">
                                            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Signed in as</p>
                                            <p className="mt-1 truncate text-sm text-neutral-700">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                                        >
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            className="rounded-xl p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 md:hidden"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {mobileOpen && (
                <div className="border-t border-neutral-200 bg-white px-4 py-4 md:hidden">
                    <div className="space-y-2">
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

                        {user ? (
                            <>
                                <Link href="/dashboard" className="block rounded-2xl px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
                                    Dashboard
                                </Link>
                                <Link href="/admin" className="block rounded-2xl px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
                                    Admin Panel
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </>
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
