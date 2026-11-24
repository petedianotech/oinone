import { useParams, Navigate, Link } from 'react-router-dom';
import { useBlog } from '../lib/BlogContext';
import { CATEGORIES } from '../lib/utils';
import { CategoryId } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { ArticleFeedSkeleton } from '../components/ArticleFeedSkeleton';
import { Sparkles, ArrowLeft } from 'lucide-react';

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { getCategoryPosts, loading } = useBlog();
  
  if (!categoryId || !(categoryId in CATEGORIES)) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <ArticleFeedSkeleton layout="category" />;
  }

  const category = CATEGORIES[categoryId as CategoryId];
  const posts = getCategoryPosts(categoryId as CategoryId);
  const featured = posts[0];
  const restPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        {/* Back navigation */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Category Header */}
        <div className="py-10 border-b border-zinc-200 mb-12">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3">
              {category.name} Section
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-zinc-900 tracking-tight mb-4">
              {category.name}
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>

        {/* Content */}
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-zinc-200 rounded-xl">
            <Sparkles className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-zinc-800">No articles in this category yet.</h3>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Post for Category */}
            {featured && (
               <ArticleCard post={featured} variant="featured" />
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restPosts.map(post => (
                <ArticleCard key={post.id} post={post} variant="standard" />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
