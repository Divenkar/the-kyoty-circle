import Link from 'next/link';
import { Compass, Users } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-neutral-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md">
                                <span className="text-sm font-extrabold text-white">K</span>
                            </div>
                            <span className="text-lg font-bold text-neutral-900">Kyoty</span>
                        </Link>
                        <p className="mt-4 text-sm leading-6 text-neutral-500">
                            Verified communities and curated events for people who want more from their offline social life.
                        </p>
                    </div>

                    {/* Discover */}
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">Discover</h3>
                        <ul className="mt-4 space-y-3">
                            {[
                                { label: 'Explore Events', href: '/explore?city=Noida' },
                                { label: 'Browse Communities', href: '/communities' },
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

                    {/* Explore by category */}
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">Categories</h3>
                        <ul className="mt-4 space-y-3">
                            {['Sports', 'Tech', 'Arts', 'Fitness', 'Networking', 'Outdoor'].map((cat) => (
                                <li key={cat}>
                                    <Link href={`/explore?city=Noida&category=${cat}`} className="text-sm text-neutral-500 transition-colors hover:text-neutral-900">
                                        {cat}
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
                    <div className="flex items-center gap-6">
                        <Link href="/explore" className="flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-700">
                            <Compass size={13} />
                            Explore events
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
