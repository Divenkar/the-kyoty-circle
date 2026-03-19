import React from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'neutral' | 'danger';

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    neutral: 'bg-neutral-100 text-neutral-700',
    danger: 'bg-danger-100 text-danger-700',
};

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center px-2.5 py-0.5
        text-xs font-medium rounded-full
        ${variantClasses[variant]}
        ${className}
      `.trim()}
        >
            {children}
        </span>
    );
}
