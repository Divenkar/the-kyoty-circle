'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
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

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const navLinks = [
        { href: '/explore', label: 'Explore' },
        { href: '/communities', label: 'Communities' },
        { href: '/#services', label: 'Services' },
        { href: '/#support', label: 'Support' },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
                            <span className="text-white font-extrabold text-base tracking-tight">K</span>
                        </div>
                        <span className="text-xl font-bold text-neutral-900">Kyoty</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive(link.href)
                                        ? 'text-primary-600 bg-primary-50'
                                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center gap-3">
                        {!loading && !user && (
                            <>
                                <Link
                                    href="/login"
                                    className="hidden sm:block px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/login"
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}

                        {!loading && user && (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`hidden sm:flex px-4 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive('/dashboard') ? 'text-primary-600 bg-primary-50' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'}`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/admin"
                                    className={`hidden sm:flex px-4 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive('/admin') ? 'text-primary-600 bg-primary-50' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'}`}
                                >
                                    Admin
                                </Link>
                                <NotificationBell />
                                <div className="relative group">
                                    <button className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200">
                                        {user.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon size={20} className="text-neutral-600" />
                                        )}
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-100 py-1 hidden group-hover:block animate-in fade-in zoom-in-95 duration-100">
                                        <div className="px-4 py-2 border-b border-neutral-50">
                                            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {mobileOpen && (
                <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-3 space-y-1 animate-in slide-in-from-top-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${isActive(link.href)
                                    ? 'text-primary-600 bg-primary-50'
                                    : 'text-neutral-600 hover:bg-neutral-50'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {user ? (
                        <>
                            <Link
                                href="/dashboard"
                                onClick={() => setMobileOpen(false)}
                                className="block px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/admin"
                                onClick={() => setMobileOpen(false)}
                                className="block px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg"
                            >
                                Admin Panel
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <div className="pt-2 border-t border-neutral-100">
                            <Link
                                href="/login"
                                onClick={() => setMobileOpen(false)}
                                className="block w-full px-4 py-3 text-sm font-semibold text-center text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Sign Up / Login
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
