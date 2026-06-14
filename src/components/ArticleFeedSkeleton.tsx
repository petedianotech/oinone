import React from 'react';
import { ArticleSkeleton } from './ArticleCard';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ArticleFeedSkeletonProps {
  layout?: 'home' | 'category';
  className?: string;
}

export function ArticleFeedSkeleton({ layout = 'home', className }: ArticleFeedSkeletonProps) {
  if (layout === 'category') {
    return (
      <div className={cn("min-h-screen pt-24 bg-[#0a0a0c] flex flex-col", className)}>
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-24 relative z-10 animate-pulse">
          
          {/* Back navigation button skeleton */}
          <div className="pt-6 flex justify-start">
            <div className="h-4 w-32 bg-white/5 rounded-md" />
          </div>

          {/* Category Header skeleton */}
          <div className="py-20 border-b border-white/5 mb-16 relative">
            <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6 flex flex-col items-center">
              <div className="h-8 w-44 rounded-full bg-white/5 border border-white/5" />
              <div className="h-16 w-3/4 rounded-2xl bg-white/10" />
              <div className="h-5 w-1/2 rounded-lg bg-white/5" />
            </div>
          </div>

          {/* Core Content skeletons */}
          <div className="space-y-16">
            {/* Featured Post skeleton */}
            <div className="h-[450px] md:h-[510px] relative rounded-3xl bg-[#121216] border border-white/5 overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 h-full bg-white/5" />
              <div className="w-full md:w-1/2 p-10 flex flex-col justify-center space-y-4">
                <div className="h-6 w-20 bg-white/10 rounded-full" />
                <div className="h-10 w-4/5 bg-white/10 rounded-xl" />
                <div className="h-4 w-11/12 bg-white/5 rounded-md" />
                <div className="h-4 w-2/3 bg-white/5 rounded-md" />
                <div className="flex items-center space-x-3 pt-6 border-t border-white/5">
                  <div className="h-8 w-8 rounded-full bg-white/10" />
                  <div className="h-4 w-24 bg-white/5 rounded" />
                </div>
              </div>
            </div>

            {/* Grid of Standard Articles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <ArticleSkeleton key={i} variant="standard" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Home Screen Feed Skeleton
  return (
    <section className={cn("space-y-32 animate-pulse", className)}>
      {/* Featured Big Card Skeleton */}
      <div className="h-[650px] relative rounded-[2.5rem] overflow-hidden bg-gray-100 dark:bg-[#121216] border border-gray-200 dark:border-white/5">
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
         <div className="absolute bottom-12 left-12 right-12 z-20 space-y-6">
           <div className="h-6 w-28 bg-white/20 rounded-full" />
           <div className="h-14 w-2/3 bg-white/20 rounded-2xl" />
           <div className="h-5 w-1/2 bg-white/10 rounded-lg" />
           <div className="flex items-center space-x-3 pt-4">
             <div className="h-8 w-8 rounded-full bg-white/20" />
             <div className="h-4 w-24 bg-white/10 rounded" />
           </div>
         </div>
      </div>

      {/* Main Grid Section */}
      <div className="space-y-8">
        <div className="w-56 h-8 rounded-lg bg-gray-200 dark:bg-white/5 border border-transparent dark:border-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleSkeleton key={i} variant="standard" />
          ))}
        </div>
      </div>
    </section>
  );
}
