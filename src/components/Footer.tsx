import Link from 'next/link';
import { Compass, Heart, Mail, MapPin, Search, Users } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-neutral-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md">
                                <span className="text-sm font-extrabold text-white">K</span>
                            </div>
                            <span className="text-lg font-bold text-neutral-900">Kyoty</span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm leading-6 text-neutral-500">
                            Verified communities and curated events for people who want more from their offline social life.
                        </p>
                        <div className="mt-5 flex items-center gap-4">
                            <Link
                                href="/search"
                                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs font-medium text-neutral-600 transition hover:border-primary-300 hover:text-primary-700"
                            >
                                <Search size={13} />
                                Search Kyoty
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 transition hover:text-primary-600"
                            >
                                <Mail size={13} />
                                Contact us
                            </Link>
                        </div>
                    </div>

                    {/* Discover */}
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">Discover</h3>
                        <ul className="mt-4 space-y-3">
                            {[
                                { label: 'Explore Events', href: '/explore?city=Noida' },
                                { label: 'Browse Communities', href: '/communities' },
                                { label: 'Search', href: '/search' },
                                { label: 'Noida', href: '/explore?city=Noida' },
                                { label: 'Delhi (Coming soon)', href: '#' },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-sm text-neutral-500 transition-colors hover:text-neutral-900">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* For organizers */}
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">For Organizers</h3>
                        <ul className="mt-4 space-y-3">
                            {[
                                { label: 'Start a Community', href: '/create-community' },
                                { label: 'Dashboard', href: '/dashboard' },
                                { label: 'Sign Up', href: '/login' },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-sm text-neutral-500 transition-colors hover:text-neutral-900">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company & Legal */}
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">Company</h3>
                        <ul className="mt-4 space-y-3">
                            {[
                                { label: 'Contact', href: '/contact' },
                                { label: 'Privacy Policy', href: '/privacy' },
                                { label: 'Terms of Service', href: '/terms' },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-sm text-neutral-500 transition-colors hover:text-neutral-900">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-neutral-100 pt-8 sm:flex-row">
                    <p className="text-xs text-neutral-400">
                        © {new Date().getFullYear()} Kyoty. All rights reserved.
                    </p>
                    <div className="flex items-center gap-5">
                        <Link href="/privacy" className="text-xs text-neutral-400 transition-colors hover:text-neutral-700">
                            Privacy
                        </Link>
                        <Link href="/terms" className="text-xs text-neutral-400 transition-colors hover:text-neutral-700">
                            Terms
                        </Link>
                        <span className="text-neutral-200">|</span>
                        <Link href="/explore" className="flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-700">
                            <Compass size={13} />
                            Events
                        </Link>
                        <Link href="/communities" className="flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-700">
                            <Users size={13} />
                            Communities
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
