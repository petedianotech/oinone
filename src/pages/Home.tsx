import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlog } from '../lib/BlogContext';
import { ArticleCard } from '../components/ArticleCard';
import { Flame, Coins, Cpu, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export function Home() {
  const { posts, loading, getFeaturedPosts, getTrendingPosts } = useBlog();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
  
  // Exclude featured from standard general listing on home load to prevent redundancy
  const recent = posts.filter(p => !p.featured);
  
  // Make sure clicking any topic query filters across BOTH featured and general posts so they show up beautifully
  const filteredRecent = selectedCategory === 'all'
    ? recent.slice(0, 6)
    : posts.filter(p => p.categoryId === selectedCategory).slice(0, 6);

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
              <h2 className="font-display text-2xl font-bold text-gray-950 dark:text-white">
                {selectedCategory === 'all' ? 'Latest Stories' : `Latest in ${selectedCategory.toUpperCase()}`}
              </h2>
            </div>
            {filteredRecent.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredRecent.map(post => (
                  <ArticleCard key={post.id} post={post} variant="standard" />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center transition-colors">
                <p className="text-gray-500 dark:text-gray-400 font-medium">No articles found in this category yet. Create one in the Admin dashboard using the AI generator!</p>
              </div>
            )}
          </div>

          {/* Sidebar / Extended Content */}
          <aside className="lg:col-span-4 space-y-8">
             {/* About Widget - Renovated with solid premium opaque gradient */}
             <div className="bg-gradient-to-br from-[#0b0a1d] via-[#111030] to-[#050512] rounded-2xl p-6 shadow-xl border border-indigo-900/40 text-white relative overflow-hidden transition-all duration-300">
                <div className="absolute inset-x-0 -top-32 h-64 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
                <h3 className="font-display font-semibold text-lg text-white mb-4 relative z-10">About Oinone</h3>
                <p className="text-sm text-indigo-100/90 mb-4 leading-relaxed relative z-10 font-normal">
                  Oinone is a premier destination for insights on Finance, Technology, AI, and building digital wealth. Curated by Peter Damiano.
                </p>
                <Link to="/about" className="inline-flex items-center text-indigo-300 hover:text-white text-sm font-semibold transition-colors relative z-10 group">
                  Read our story <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>

             {/* Trending Widget with Premium Solid Gradient Background */}
             <div className="bg-gradient-to-br from-[#0b0a1d] via-[#111030] to-[#050512] rounded-2xl p-6 shadow-xl border border-indigo-900/40 text-white relative overflow-hidden transition-all duration-300">
                <div className="absolute inset-x-0 -top-32 h-64 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
                <div className="flex items-center space-x-2 mb-6 border-b border-white/10 pb-4 relative z-10">
                  <Flame className="text-amber-500 h-5 w-5 animate-pulse" />
                  <h3 className="font-display font-semibold text-lg text-white">Trending Now</h3>
                  <span className="ml-auto text-[10px] uppercase font-bold tracking-widest bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/20">
                    Premium
                  </span>
                </div>
                <div className="flex flex-col gap-5 relative z-10">
                  {trending.slice(0, 5).map((post, i) => (
                    <div key={post.id} className="flex gap-4">
                       <span className="text-2xl font-display font-black text-indigo-400/30 leading-none pt-1">
                        0{i + 1}
                       </span>
                       <ArticleCard post={post} variant="compact" theme="dark" className="flex-1" />
                    </div>
                  ))}
                </div>
             </div>
             
             {/* Explore Topics Widget with Premium Solid Gradient Background & Feature Integrations */}
             <div className="bg-gradient-to-br from-[#0b0a1d] via-[#111030] to-[#050512] rounded-2xl p-6 shadow-xl border border-indigo-900/40 text-white relative overflow-hidden transition-all duration-300 sticky top-24">
                <div className="absolute inset-x-0 -top-32 h-64 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />
                <h3 className="font-display font-semibold text-lg text-white mb-2 relative z-10">Explore Topics</h3>
                <p className="text-xs text-indigo-200/60 mb-4 relative z-10">Select a category to filter stories</p>
                <div className="flex flex-wrap gap-2 relative z-10 mb-6 pb-6 border-b border-white/10">
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 transition-all text-xs font-semibold rounded-lg shadow-sm border cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-indigo-500 border-indigo-500 text-white'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    All Topics
                  </button>
                  {[
                    { id: 'finance', name: 'Finance' },
                    { id: 'technology', name: 'Technology' },
                    { id: 'mmo', name: 'Make Money' },
                    { id: 'ai', name: 'AI' }
                  ].map(topic => (
                    <button 
                      key={topic.id} 
                      onClick={() => setSelectedCategory(topic.id)} 
                      className={`px-3 py-1.5 transition-all text-xs font-semibold rounded-lg shadow-sm border cursor-pointer ${
                        selectedCategory === topic.id
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {topic.name}
                    </button>
                  ))}
                </div>
             </div>
          </aside>
        </section>

      </main>
    </motion.div>
  );
}
