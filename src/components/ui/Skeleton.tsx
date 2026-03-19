import React from 'react';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-neutral-200 rounded-lg ${className}`}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card">
            <Skeleton className="h-40 w-full mb-4" />
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
            </div>
        </div>
    );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-xl">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                        <Skeleton className="h-4 w-1/3 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}
