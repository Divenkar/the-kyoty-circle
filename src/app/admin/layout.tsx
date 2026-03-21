import Link from 'next/link';
import { Shield, Users, Calendar, LayoutDashboard, UserCircle } from 'lucide-react';

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/communities', label: 'Communities', icon: Users },
    { href: '/admin/events', label: 'Events', icon: Calendar },
    { href: '/admin/users', label: 'Users', icon: UserCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar — desktop */}
            <aside className="hidden lg:flex flex-col w-52 bg-white border-r border-neutral-200 px-3 py-6 shrink-0">
                <div className="flex items-center gap-2 px-3 mb-6">
                    <Shield size={18} className="text-primary-600" />
                    <span className="text-sm font-bold text-neutral-900 tracking-wide uppercase">Admin</span>
                </div>
                <nav className="flex flex-col gap-0.5">
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                        >
                            <Icon size={15} />
                            {label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Top bar — mobile */}
                <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-2">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                        <Shield size={14} className="text-primary-600 shrink-0 mr-1" />
                        {NAV_ITEMS.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
