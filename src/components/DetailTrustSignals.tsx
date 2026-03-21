import type { ReactNode } from 'react';

interface TrustSignalItem {
    label: string;
    value: ReactNode;
    icon: ReactNode;
    hint?: ReactNode;
}

interface DetailTrustSignalsProps {
    items: TrustSignalItem[];
    className?: string;
}

export function DetailTrustSignals({ items, className = '' }: DetailTrustSignalsProps) {
    return (
        <div className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-4 ${className}`.trim()}>
            {items.map((item) => (
                <div
                    key={item.label}
                    className="min-h-[92px] rounded-2xl border border-neutral-200 bg-neutral-50 p-4 shadow-sm"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm">
                            {item.icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                {item.label}
                            </p>
                            <div className="mt-1 flex min-h-6 flex-wrap items-center gap-1.5 text-sm font-semibold text-neutral-900">
                                {item.value}
                            </div>
                            {item.hint && (
                                <p className="mt-1 text-xs leading-5 text-neutral-500">
                                    {item.hint}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
