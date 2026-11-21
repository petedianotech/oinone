import React from 'react';
import { ArticleSkeleton } from './ArticleCard';
import { cn } from '../lib/utils';

interface ArticleFeedSkeletonProps {
  layout?: 'home' | 'category';
  className?: string;
}

export function ArticleFeedSkeleton({ layout = 'home', className }: ArticleFeedSkeletonProps) {
  if (layout === 'category') {
    return (
      <div className={cn('min-h-screen pt-8 bg-zinc-50', className)}>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 animate-pulse">
          <div className="h-4 w-28 bg-zinc-200 rounded mb-10" />
          <div className="py-12 border-b border-zinc-200 mb-12 space-y-4">
            <div className="h-6 w-32 bg-zinc-200 rounded" />
            <div className="h-10 w-2/3 bg-zinc-200 rounded" />
            <div className="h-4 w-1/2 bg-zinc-100 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleSkeleton key={i} variant="standard" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8 animate-pulse', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleSkeleton key={i} variant="standard" />
        ))}
      </div>
    </div>
  );
}
