'use client';

import React from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    className?: string;
    circle?: boolean;
}

export function Skeleton({ width, height, className = '', circle = false }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-gray-800/50 ${circle ? 'rounded-full' : 'rounded-xl'} ${className}`}
            style={{
                width: width || '100%',
                height: height || '1rem',
            }}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="glass-card p-6 space-y-4">
            <Skeleton height="1.5rem" width="60%" />
            <Skeleton height="1rem" width="90%" />
            <Skeleton height="1rem" width="40%" />
            <div className="pt-4 flex gap-2">
                <Skeleton height="2.5rem" className="flex-1" />
                <Skeleton height="2.5rem" width="2.5rem" />
            </div>
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-white/5">
            <Skeleton circle width="2.5rem" height="2.5rem" />
            <div className="flex-1 space-y-2">
                <Skeleton height="1rem" width="40%" />
                <Skeleton height="0.75rem" width="20%" />
            </div>
            <Skeleton height="1.5rem" width="4rem" />
        </div>
    );
}
