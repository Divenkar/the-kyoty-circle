'use client';

import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`
          relative w-full max-w-lg bg-white rounded-2xl shadow-modal
          animate-in fade-in zoom-in-95 duration-200
          ${className}
        `.trim()}
            >
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
                <div className="px-6 py-4">{children}</div>
            </div>
        </div>
    );
}
