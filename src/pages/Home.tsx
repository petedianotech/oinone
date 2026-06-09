import { useBlog } from '../lib/BlogContext';
import { ArticleCard } from '../components/ArticleCard';
import { Newsletter } from '../components/Newsletter';
import { Flame } from 'lucide-react';
import { motion } from 'motion/react';

export function Home() {
  const { posts, loading, getFeaturedPosts, getTrendingPosts } = useBlog();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 transition-colors duration-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-t-2 border-indigo-600 animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm animate-pulse">Syncing insights database...</p>
        </div>
      </div>
    );
  }

  const featured = getFeaturedPosts();
  const trending = getTrendingPosts();
  
  // Exclude featured from recent to avoid duplication in this simple mock
  const recent = posts.filter(p => !p.featured).slice(0, 6);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen pt-24 bg-gray-50 dark:bg-gray-950 transition-colors duration-200"
    >
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 pb-20">
        
        {/* Hero Section - Main Featured & Sub-featured */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-[500px] lg:h-[600px]">
            {featured[0] && <ArticleCard post={featured[0]} variant="featured" className="h-full" />}
          </div>
          <div className="lg:col-span-4 flex flex-col gap-8 h-[500px] lg:h-[600px]">
            {featured.slice(1, 3).map(post => (
              <div key={post.id} className="flex-1">
                <ArticleCard post={post} variant="featured" className="h-full" />
              </div>
            ))}
          </div>
        </section>

        {/* Latest and Trending Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Latest Articles */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-gray-950 dark:text-white">Latest Stories</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recent.map(post => (
                <ArticleCard key={post.id} post={post} variant="standard" />
              ))}
            </div>
          </div>

          {/* Sidebar / Trending */}
          <aside className="lg:col-span-4 space-y-12">
             <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm sticky top-24 transition-colors duration-200">
                <div className="flex items-center space-x-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <Flame className="text-orange-500 h-5 w-5" />
                  <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white">Trending Now</h3>
                </div>
                <div className="flex flex-col gap-6">
                  {trending.map((post, i) => (
                    <div key={post.id} className="flex gap-4">
                      <span className="text-3xl font-display font-bold text-gray-200 dark:text-gray-800 leading-none">
                        0{i + 1}
                      </span>
                      <ArticleCard post={post} variant="compact" />
                    </div>
                  ))}
                </div>
             </div>
          </aside>
        </section>

      </main>

      <Newsletter />
    </motion.div>
  );
}
