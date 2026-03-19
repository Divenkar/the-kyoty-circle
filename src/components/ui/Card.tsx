import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
    return (
        <div
            className={`
        bg-white border border-neutral-200 rounded-xl shadow-card
        ${hover ? 'hover:shadow-cardHover transition-shadow duration-200 cursor-pointer' : ''}
        ${className}
      `.trim()}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`px-5 py-4 border-b border-neutral-200 ${className}`}>
            {children}
        </div>
    );
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
    return (
        <div className={`px-5 py-4 ${className}`}>
            {children}
        </div>
    );
}
