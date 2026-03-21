import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
    type: 'linkedin' | 'instagram' | null | undefined;
    size?: 'sm' | 'md';
}

export function VerifiedBadge({ type, size = 'md' }: VerifiedBadgeProps) {
    if (!type) return null;

    const label = type === 'linkedin' ? 'LinkedIn' : 'Instagram';

    if (size === 'sm') {
        return (
            <span
                title={`Verified via ${label}`}
                className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 border border-green-200"
            >
                <ShieldCheck size={10} />
                Verified
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 border border-green-200">
            <ShieldCheck size={12} />
            Verified · {label}
        </span>
    );
}
