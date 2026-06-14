import { useParams, Navigate, Link } from 'react-router-dom';
import { useBlog } from '../lib/BlogContext';
import { CATEGORIES, cn } from '../lib/utils';
import { CategoryId } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { ArticleFeedSkeleton } from '../components/ArticleFeedSkeleton';
import { motion } from 'motion/react';
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen pt-24 bg-[#0a0a0c] flex flex-col transition-colors duration-200"
    >
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-24 relative z-10">
        
        {/* Back navigation */}
        <div className="pt-6 flex justify-start">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-indigo-400 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back Home</span>
          </Link>
        </div>

        {/* Category Header */}
        <div className="py-20 border-b border-white/5 mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/5 to-brand-cyan/5 blur-3xl rounded-full" />
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-brand-cyan backdrop-blur-md mb-6">
              {category.name} Articles
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
              {category.name}
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-medium leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>

        {/* Content */}
        {posts.length === 0 ? (
          <div className="text-center py-32 glass-panel rounded-[2rem] border border-white/5">
            <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-display font-bold text-gray-400">There are no articles in this category yet.</h3>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Featured Post for Category */}
            {featured && (
               <ArticleCard post={featured} variant="featured" className="h-[450px] md:h-[550px]" />
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
