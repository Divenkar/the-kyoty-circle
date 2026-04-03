'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, FileText, Calendar, Users } from 'lucide-react';

interface CreateMenuProps {
    /** Show as a full-width floating bottom-sheet trigger (mobile) or inline dropdown (desktop) */
    variant?: 'desktop' | 'mobile-fab';
}

export function CreateMenu({ variant = 'desktop' }: CreateMenuProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Close on route change
    useEffect(() => { setOpen(false); }, [pathname]);

    // Close on click-outside
    useEffect(() => {
        if (!open) return;
        function handler(e: PointerEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('pointerdown', handler);
        return () => document.removeEventListener('pointerdown', handler);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        function handler(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open]);

    const items = [
        {
            href: '/post/create',
            label: 'New Post',
            sublabel: 'Share something in a community',
            icon: FileText,
            iconBg: 'bg-primary-50 text-primary-700',
        },
        {
            href: '/create-event',
            label: 'New Event',
            sublabel: 'Schedule a community event',
            icon: Calendar,
            iconBg: 'bg-violet-50 text-violet-700',
        },
        {
            href: '/create-community',
            label: 'New Community',
            sublabel: 'Start your own circle',
            icon: Users,
            iconBg: 'bg-emerald-50 text-emerald-700',
        },
    ] as const;

    if (variant === 'mobile-fab') {
        return (
            <div className="relative flex flex-col items-center justify-center" ref={ref}>
                <button
                    onClick={() => setOpen((v) => !v)}
                    aria-label="Create"
                    aria-expanded={open}
                    className={`flex h-12 w-12 -mt-5 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
                        open
                            ? 'bg-primary-700 rotate-45 shadow-primary-600/40'
                            : 'bg-primary-600 shadow-primary-600/30 hover:bg-primary-700'
                    }`}
                >
                    <Plus size={22} className="text-white" />
                </button>
                <span className={`mt-1 text-[10px] font-semibold transition-colors ${
                    open ? 'text-primary-700' : 'text-neutral-500'
                }`}>Create</span>

                {open && (
                    <div className="absolute bottom-[calc(100%+0.75rem)] left-1/2 -translate-x-1/2 w-64 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl z-50">
                        <div className="p-1">
                            {items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-neutral-50"
                                >
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                                        <item.icon size={15} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-neutral-900">{item.label}</p>
                                        <p className="text-xs text-neutral-500">{item.sublabel}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Desktop dropdown
    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label="Create"
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    open
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                }`}
            >
                <Plus size={15} />
                Create
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xl z-50">
                    <div className="p-1">
                        {items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-neutral-50"
                            >
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                                    <item.icon size={15} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-neutral-900">{item.label}</p>
                                    <p className="text-xs text-neutral-500">{item.sublabel}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
