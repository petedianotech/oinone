import { Link } from 'react-router-dom';
import { Post } from '../types';
import { CATEGORIES, cn, optimizeImageUrl } from '../lib/utils';
import { Clock, Eye, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ArticleCardProps {
  key?: React.Key;
  post: Post;
  variant?: 'featured' | 'compact' | 'standard';
  className?: string;
  theme?: 'light' | 'dark'; // We force dark anyway mostly, but keep for compat
}

export function ArticleCard({ post, variant = 'standard', className, theme = 'dark' }: ArticleCardProps) {
  const category = CATEGORIES[post.categoryId] || { name: post.categoryId, color: 'text-white' };

  if (variant === 'featured') {
    return (
      <Link to={`/article/${post.id}`} className={cn("group flex flex-col h-full bg-[#121216] rounded-3xl overflow-hidden glass-panel hover-glass transition-all duration-300 relative isolation-auto", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 to-brand-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative h-64 sm:h-72 overflow-hidden">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
          <img 
            src={optimizeImageUrl(post.imageUrl, 800)} 
            alt={post.title} 
            className="h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col flex-1 p-6 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <span className="inline-flex items-center rounded-full bg-white/10 border border-white/10 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-widest backdrop-blur-md">
              {category.name}
            </span>
            <span className="flex items-center text-xs font-semibold text-gray-400 gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} min read
            </span>
          </div>
          <h3 className="font-display text-2xl font-bold text-white mb-3 group-hover:text-brand-purple transition-colors leading-tight">
            {post.title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2 mb-6 font-medium">
            {post.excerpt}
          </p>
          <div className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#a855f7] group-hover:text-cyan-400 transition-colors">
            <span>Read Article</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 duration-200" />
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex items-center space-x-3">
              <img src={post.author.avatar} alt={post.author.name} className="h-8 w-8 rounded-full border border-white/20" />
              <div>
                <div className="text-sm font-bold text-white">{post.author.name}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">{formatDistanceToNow(new Date(post.date))} ago</div>
              </div>
            </div>
            {post.viewsCount && (
              <span className="flex items-center text-xs font-semibold text-gray-500 gap-1">
                <Eye className="w-3.5 h-3.5" /> {post.viewsCount}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/article/${post.id}`} className={cn("group flex gap-4 items-start p-3 rounded-2xl hover:bg-white/5 transition-colors", className)}>
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#121216]">
           <img 
            src={optimizeImageUrl(post.imageUrl, 200)} 
            alt={post.title} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
          />
        </div>
        <div className="flex flex-col justify-center gap-1 w-full">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-purple">
            {category.name}
          </p>
          <h3 className="font-display text-sm font-bold text-white leading-tight line-clamp-2 group-hover:text-brand-cyan transition-colors">
            {post.title}
          </h3>
          <div className="flex items-center mt-1 text-[10px] text-gray-500 gap-1.5 uppercase tracking-wider font-semibold">
            <span>{post.readTime} min</span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span>{formatDistanceToNow(new Date(post.date))}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Standard Layered Card
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className={cn("group flex flex-col h-full bg-white dark:bg-[#121216]/50 rounded-[2rem] overflow-hidden glass-panel hover-glass transition-all relative border-t border-gray-100 dark:border-white/5", className)}>
      <Link to={`/article/${post.id}`} className="block relative h-56 mx-2 mt-2 overflow-hidden rounded-[1.5rem]">
        <img 
          src={optimizeImageUrl(post.imageUrl, 600)} 
          alt={post.title} 
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute top-3 left-3 flex gap-2">
           <span className="inline-flex items-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-widest">
              {category.name}
           </span>
        </div>
      </Link>
      <div className="flex flex-col flex-1 p-6 relative z-10">
        <Link to={`/article/${post.id}`} className="block flex-1">
          <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-blue dark:group-hover:text-cyan-300 transition-colors line-clamp-2 leading-tight">
            {post.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 font-medium">
            {post.excerpt}
          </p>
        </Link>
        <div className="mb-2 mt-1">
          <Link to={`/article/${post.id}`} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-800 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors group/btn">
            <span>Read Article</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1 duration-200" />
          </Link>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
           <div className="flex items-center space-x-3">
            <img src={post.author.avatar} alt={post.author.name} className="h-7 w-7 rounded-full border border-gray-200 dark:border-white/10" loading="lazy" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-900 dark:text-gray-200">{post.author.name}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">{formatDistanceToNow(new Date(post.date))} ago</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span className="flex items-center text-[10px] uppercase tracking-widest font-bold text-gray-500">
                <Clock className="mr-1 h-3 w-3" />
                {post.readTime} min
              </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ArticleSkeleton({ variant = 'standard', className }: { variant?: 'featured' | 'compact' | 'standard', className?: string, key?: import('react').Key }) {
  if (variant === 'featured') {
    return (
      <div className={cn("relative block overflow-hidden rounded-3xl bg-[#121216] animate-pulse border border-white/5", className)}>
         <div className="h-64 sm:h-72 bg-white/5" />
         <div className="p-6">
           <div className="h-6 w-20 bg-white/10 rounded-full mb-4" />
           <div className="h-8 w-3/4 bg-white/10 rounded-xl mb-3" />
           <div className="h-4 w-1/2 bg-white/5 rounded-xl mb-6" />
           <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
             <div className="w-8 h-8 rounded-full bg-white/10" />
             <div className="h-4 w-24 bg-white/5 rounded-md" />
           </div>
         </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex gap-4 items-start p-3 animate-pulse", className)}>
        <div className="relative h-20 w-20 flex-shrink-0 rounded-xl bg-white/5" />
        <div className="flex flex-col justify-center gap-2 mt-1 w-full">
          <div className="h-3 w-16 bg-white/10 rounded" />
          <div className="h-4 w-full bg-white/10 rounded" />
          <div className="h-4 w-2/3 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-[#121216]/50 rounded-[2rem] overflow-hidden border border-white/5 animate-pulse", className)}>
      <div className="mx-2 mt-2 h-48 sm:h-56 rounded-[1.5rem] bg-white/5" />
      <div className="flex flex-col flex-1 p-6">
        <div className="h-6 w-11/12 bg-white/10 rounded-xl mb-3" />
        <div className="h-6 w-3/4 bg-white/10 rounded-xl mb-6" />
        <div className="h-4 w-full bg-white/5 rounded-md mb-2" />
        <div className="h-4 w-2/3 bg-white/5 rounded-md" />
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center space-x-3">
            <div className="h-7 w-7 rounded-full bg-white/10" />
            <div className="h-3 w-20 bg-white/5 rounded" />
          </div>
          <div className="h-3 w-12 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
}
