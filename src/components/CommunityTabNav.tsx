'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, ImageIcon, Settings, Users, LayoutGrid } from 'lucide-react';

interface Tab {
    label: string;
    href: string;
    icon: React.ReactNode;
}

interface CommunityTabNavProps {
    slug: string;
    isMember: boolean;
    canManage: boolean;
}

export function CommunityTabNav({ slug, isMember, canManage }: CommunityTabNavProps) {
    const pathname = usePathname();
    const base = `/community/${slug}`;

    const tabs: Tab[] = [
        { label: 'Overview', href: base, icon: <LayoutGrid size={15} /> },
        ...(isMember ? [
            { label: 'Chat', href: `${base}/chat`, icon: <MessageCircle size={15} /> },
            { label: 'Media', href: `${base}/media`, icon: <ImageIcon size={15} /> },
            { label: 'Members', href: `${base}/members`, icon: <Users size={15} /> },
        ] : []),
        ...(canManage ? [
            { label: 'Manage', href: `${base}/manage`, icon: <Settings size={15} /> },
        ] : []),
    ];

    return (
        <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 bg-white px-4 sm:px-8 scrollbar-none">
            {tabs.map(tab => {
                const isActive = tab.href === base
                    ? pathname === base
                    : pathname.startsWith(tab.href);

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={[
                            'flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3.5 text-sm font-medium transition-colors',
                            isActive
                                ? 'border-primary-600 text-primary-700'
                                : 'border-transparent text-neutral-500 hover:text-neutral-800',
                        ].join(' ')}
                    >
                        {tab.icon}
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
