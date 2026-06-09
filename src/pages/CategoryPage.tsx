import { useParams, Navigate } from 'react-router-dom';
import { useBlog } from '../lib/BlogContext';
import { CATEGORIES } from '../lib/utils';
import { CategoryId } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { motion } from 'motion/react';

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { getCategoryPosts, loading } = useBlog();
  
  if (!categoryId || !(categoryId in CATEGORIES)) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 transition-colors duration-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-t-2 border-indigo-600 animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm animate-pulse">Syncing category insights...</p>
        </div>
      </div>
    );
  }

  const category = CATEGORIES[categoryId as CategoryId];
  const posts = getCategoryPosts(categoryId as CategoryId);
  const featured = posts[0];
  const restPosts = posts.slice(1);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen pt-24 bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-200"
    >
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20">
        
        {/* Category Header */}
        <div className="py-12 border-b border-gray-200 dark:border-gray-800 mb-12">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-4 ${category.color}`}>
            {category.name}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-950 dark:text-white mb-4 tracking-tight">
            The Latest in {category.name}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
            {category.description}
          </p>
        </div>

        {/* Content */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl text-gray-500">No posts found in this category yet.</h3>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Featured Post for Category */}
            {featured && (
               <ArticleCard post={featured} variant="featured" className="h-[400px] md:h-[500px]" />
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {restPosts.map(post => (
                <ArticleCard key={post.id} post={post} variant="standard" />
              ))}
            </div>
          </div>
        )}
      </main>
    </motion.div>
  );
}
