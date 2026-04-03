'use client';

import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareButtonProps {
    title: string;
    text?: string;
    url?: string;
    className?: string;
}

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, text: text || title, url: shareUrl });
            } catch {
                // User cancelled — no-op
            }
            return;
        }
        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard blocked — silent fail
        }
    };

    return (
        <button
            onClick={handleShare}
            title={copied ? 'Link copied!' : 'Share event'}
            className={className ?? 'flex items-center justify-center w-9 h-9 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors'}
        >
            {copied ? <Check size={16} className="text-green-600" /> : <Share2 size={16} />}
        </button>
    );
}
