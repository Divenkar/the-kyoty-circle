import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm',
    secondary:
        'bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 focus:ring-primary-500 shadow-sm',
    ghost:
        'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus:ring-primary-500',
    danger:
        'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 shadow-sm',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
};

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    className = '',
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-150 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {children}
        </button>
    );
}
