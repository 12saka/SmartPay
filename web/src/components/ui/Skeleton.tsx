import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-shimmer bg-slate-200 rounded-md ${className}`}
      aria-hidden="true"
    />
  );
}
