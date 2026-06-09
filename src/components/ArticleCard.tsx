import { Link } from 'react-router-dom';
import { Post } from '../types';
import { CATEGORIES, cn } from '../lib/utils';
import { Clock } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

interface ArticleCardProps {
  key?: React.Key;
  post: Post;
  variant?: 'featured' | 'compact' | 'standard';
  className?: string;
  theme?: 'light' | 'dark';
}

export function ArticleCard({ post, variant = 'standard', className, theme = 'light' }: ArticleCardProps) {
  const category = CATEGORIES[post.categoryId];

  if (variant === 'featured') {
    return (
      <Link to={`/article/${post.id}`} className={cn("group relative block overflow-hidden rounded-2xl", className)}>
        <div className="absolute inset-0">
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 flex flex-col justify-end h-full">
          <div className="mb-4 flex items-center space-x-3">
            <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-medium text-white">
              {category.name}
            </span>
            <span className="flex items-center text-xs font-medium text-gray-300">
              <Clock className="mr-1 h-3 w-3" />
              {post.readTime} min read
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white text-balance mb-3 group-hover:underline decoration-2 underline-offset-4">
            {post.title}
          </h2>
          <p className="hidden sm:block text-gray-300 line-clamp-2 max-w-2xl mb-4">
            {post.excerpt}
          </p>
          <div className="flex items-center space-x-3 mt-auto sm:mt-0">
            <img src={post.author.avatar} alt={post.author.name} className="h-8 w-8 rounded-full border border-white/20" />
            <span className="text-sm font-medium text-white">{post.author.name}</span>
            <span className="text-sm text-gray-400">&bull;</span>
            <span className="text-sm text-gray-400">{new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="mt-4 hidden sm:block">
            <span className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
              Read article
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    const isDark = theme === 'dark';
    return (
      <Link to={`/article/${post.id}`} className={cn("group flex gap-4 items-start", className)}>
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
           <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-center gap-0.5">
          <p className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-indigo-300" : "text-indigo-600 dark:text-indigo-400")}>
            {category.name}
          </p>
          <h3 className={cn("font-display text-sm sm:text-base font-semibold leading-tight line-clamp-2 transition-colors", isDark ? "text-white group-hover:text-amber-300" : "text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400")}>
            {post.title}
          </h3>
          <div className={cn("flex items-center mt-1 text-[11px] space-x-1.5", isDark ? "text-gray-300" : "text-gray-500 dark:text-gray-400")}>
            <span>{post.author.name}</span>
            <span>&bull;</span>
            <span>{new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="mt-1">
             <span className={cn("text-xs font-semibold hover:underline", isDark ? "text-amber-300" : "text-indigo-600 dark:text-indigo-400")}>
               Read article &rarr;
             </span>
          </div>
        </div>
      </Link>
    );
  }

  // Standard
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className={cn("group flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 transition-colors", className)}>
      <Link to={`/article/${post.id}`} className="block relative h-48 sm:h-56 overflow-hidden">
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <div className="flex justify-between items-center mb-3">
           <Link to={`/${post.categoryId}`} className={cn("text-xs font-semibold uppercase tracking-wider hover:underline", `text-${category.color.split('text-')[1]}`)}>
             {category.name}
           </Link>
           <span className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
              <Clock className="mr-1 h-3 w-3" />
              {post.readTime} min
            </span>
        </div>
        <Link to={`/article/${post.id}`} className="block">
          <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-tight">
            {post.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
            {post.excerpt}
          </p>
        </Link>
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
           <div className="flex items-center space-x-2">
            <img src={post.author.avatar} alt={post.author.name} className="h-6 w-6 rounded-full" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-300">{post.author.name}</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="mt-4 text-center">
           <span className="inline-flex w-full items-center justify-center px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition">
              Read article
           </span>
        </div>
      </div>
    </motion.div>
  );
}
