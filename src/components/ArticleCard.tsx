import { Link } from 'react-router-dom';
import { Post } from '../types';
import { CATEGORIES, cn, optimizeImageUrl } from '../lib/utils';
import { Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';

interface ArticleCardProps {
  post: Post;
  variant?: 'featured' | 'compact' | 'standard';
  className?: string;
  isPrioritized?: boolean;
}

export function ArticleCard({
  post,
  variant = 'standard',
  className,
}: ArticleCardProps) {
  const category = CATEGORIES[post.categoryId] || {
    name: post.categoryId,
  };

  if (variant === 'featured') {
    return (
      <Link
        to={`/article/${post.id}`}
        className={cn(
          'group flex flex-col h-full rounded-xl overflow-hidden border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all',
          className
        )}
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100">
          <img
            src={optimizeImageUrl(post.imageUrl, 800)}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
        <div className="flex flex-col flex-1 p-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-indigo-600">{category.name}</span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} min
            </span>
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 leading-snug mb-2 group-hover:text-indigo-700 transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-zinc-600 line-clamp-2 mb-5 flex-1">{post.excerpt}</p>
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-8 w-8 rounded-full object-cover"
                loading="lazy"
              />
              <div>
                <div className="text-sm font-medium text-zinc-800">{post.author.name}</div>
                <div className="text-xs text-zinc-500">
                  {formatDistanceToNow(new Date(post.date))} ago
                </div>
              </div>
            </div>
            {post.viewsCount != null && (
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <Eye className="w-3.5 h-3.5" />
                {post.viewsCount}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        to={`/article/${post.id}`}
        className={cn(
          'group flex gap-4 items-start p-3 rounded-lg hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100',
          className
        )}
      >
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
          <img
            src={optimizeImageUrl(post.imageUrl, 200)}
            alt={post.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <p className="text-[11px] font-medium text-indigo-600 mb-0.5">{category.name}</p>
          <h3 className="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
            {post.title}
          </h3>
          <div className="flex items-center mt-1 text-[11px] text-zinc-500 gap-1.5">
            <span>{post.readTime} min</span>
            <span>·</span>
            <span>{formatDistanceToNow(new Date(post.date))}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <article
      className={cn(
        'group flex flex-col h-full rounded-xl overflow-hidden border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all',
        className
      )}
    >
      <Link to={`/article/${post.id}`} className="block relative aspect-[16/10] overflow-hidden bg-zinc-100">
        <img
          src={optimizeImageUrl(post.imageUrl, 600)}
          alt={post.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-medium text-zinc-800 shadow-sm">
            {category.name}
          </span>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-5">
        <Link to={`/article/${post.id}`} className="block flex-1">
          <h3 className="text-lg font-semibold text-zinc-900 leading-snug mb-2 group-hover:text-indigo-700 transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-zinc-600 line-clamp-2 mb-4">{post.excerpt}</p>
        </Link>

        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-7 w-7 rounded-full object-cover"
              loading="lazy"
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-zinc-800">{post.author.name}</span>
              <span className="text-[11px] text-zinc-500">
                {formatDistanceToNow(new Date(post.date))} ago
              </span>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-zinc-500">
            <Clock className="h-3 w-3" />
            {post.readTime} min
          </span>
        </div>
      </div>
    </article>
  );
}

export function ArticleSkeleton({
  variant = 'standard',
  className,
}: {
  variant?: 'featured' | 'compact' | 'standard';
  className?: string;
}) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex gap-4 p-3 animate-pulse', className)}>
        <div className="h-16 w-16 rounded-lg bg-zinc-200 flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-16 bg-zinc-200 rounded" />
          <div className="h-4 w-full bg-zinc-200 rounded" />
          <div className="h-3 w-2/3 bg-zinc-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-zinc-200 bg-white overflow-hidden animate-pulse', className)}>
      <div className="aspect-[16/10] bg-zinc-100" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-11/12 bg-zinc-200 rounded" />
        <div className="h-4 w-full bg-zinc-100 rounded" />
        <div className="h-4 w-2/3 bg-zinc-100 rounded" />
        <div className="pt-4 border-t border-zinc-100 flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-zinc-200" />
          <div className="h-3 w-20 bg-zinc-100 rounded" />
        </div>
      </div>
    </div>
  );
}
