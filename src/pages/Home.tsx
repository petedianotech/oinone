import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlog } from '../lib/BlogContext';
import { subscribeToActiveOffers, incrementOfferViews, incrementOfferClicks } from '../lib/offerService';
import { Offer } from '../types';
import { ArticleCard, ArticleSkeleton } from '../components/ArticleCard';
import { Flame, Coins, Cpu, Sparkles, ArrowRight, ExternalLink, Search, Clock, Compass, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';

export function Home() {
  const { posts, loading, getFeaturedPosts, getTrendingPosts } = useBlog();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [featuredOffer, setFeaturedOffer] = useState<Offer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToActiveOffers((offers) => {
      if (offers.length > 0) {
        setFeaturedOffer(offers[0]);
        incrementOfferViews(offers[0].id).catch(console.error);
      } else {
        setFeaturedOffer(null);
      }
    }, (err) => {
      console.warn('[Home] Active offers subscription silenced:', err);
    });
    return () => unsubscribe();
  }, []);

  const handleOfferClick = async () => {
    if (featuredOffer) {
      await incrementOfferClicks(featuredOffer.id).catch(console.error);
      window.open(featuredOffer.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app we might navigate to a global search page
      // Here we can just filter recent posts locally
    }
  };

  const renderHomeContent = () => {
    if (loading) {
      return (
        <div className="space-y-32">
          {/* Skeleton Hero */}
          <section className="h-[650px] relative rounded-[2.5rem] overflow-hidden bg-gray-100 dark:bg-[#121216] animate-pulse">
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </section>
          <section className="space-y-8">
             <div className="w-48 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <ArticleSkeleton key={i} variant="standard" />
              ))}
            </div>
          </section>
        </div>
      );
    }

    const featured = getFeaturedPosts();
    const trending = getTrendingPosts();
    const recent = posts.filter(p => !p.featured);
    const filteredRecent = selectedCategory === 'all'
      ? recent.slice(0, 6)
      : posts.filter(p => p.categoryId === selectedCategory).slice(0, 6);

    const categories = [
      { id: 'all', name: 'All Insights', icon: Compass },
      { id: 'finance', name: 'Finance & Wealth', icon: Coins },
      { id: 'technology', name: 'Tech Ecosystem', icon: Cpu },
      { id: 'mmo', name: 'Digital Business', icon: Zap },
      { id: 'ai', name: 'Artificial Intelligence', icon: Sparkles },
      { id: 'cyber', name: 'Cybersecurity', icon: Shield }
    ];

    const matchedPosts = searchQuery.trim() 
      ? posts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4)
      : [];

    return (
      <div className="space-y-32">
        {/* PREMIUM AI HERO SECTION */}
        <section className="relative min-h-[80vh] flex flex-col justify-center pt-10">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-purple/20 mix-blend-screen blur-[120px] rounded-full pointer-events-none dark:block hidden" />
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-brand-cyan/15 mix-blend-screen blur-[100px] rounded-full pointer-events-none dark:block hidden" />

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/10 shadow-xl mb-4 bg-white/5 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-brand-cyan via-white to-brand-purple bg-clip-text text-transparent">Oinone Intelligence</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter text-balance text-gray-950 dark:text-white leading-[1.1]">
                The future of <span className="dark:gradient-text text-indigo-600">content publishing</span> is here.
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
                Explore an AI-curated universe of deep dives into Technology, Private Wealth, and Digital Ecosystems.
              </p>
            </motion.div>

            {/* Smart Search & Discovery */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-2xl mx-auto"
            >
              <form onSubmit={handleSearch} className="relative z-20">
                <div className={`relative flex items-center bg-white dark:bg-[#121216]/80 backdrop-blur-2xl border ${isSearchFocused ? 'border-brand-purple shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]' : 'border-gray-200 dark:border-gray-800'} rounded-3xl p-2 transition-all duration-500`}>
                  <div className="pl-4 pr-3 text-gray-400 dark:text-gray-500">
                    <Search className="w-6 h-6" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder="What do you want to master today?"
                    className="w-full bg-transparent border-none outline-none py-3 text-gray-900 dark:text-white placeholder-gray-500 text-lg font-medium"
                  />
                  <button type="submit" className="bg-gray-900 dark:bg-white text-white dark:text-gray-950 px-6 py-3 rounded-2xl font-bold text-sm transition-transform active:scale-95 hidden sm:block">
                    Explore
                  </button>
                </div>
              </form>

              {/* Live Search Results Popover */}
              <AnimatePresence>
                {isSearchFocused && searchQuery.trim() && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-[#121216]/95 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-4 shadow-2xl z-30"
                  >
                    {matchedPosts.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                          Neural Matches
                        </div>
                        {matchedPosts.map(post => (
                          <Link key={post.id} to={`/article/${post.id}`} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group text-left">
                            <img src={post.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-brand-purple transition-colors line-clamp-1">{post.title}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(post.date))} ago
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No intelligent matches found for "{searchQuery}"
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating Trending Topics */}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <span className="text-sm font-semibold text-gray-500 mr-2 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" /> Trending Topics:
                </span>
                {['Hyper-Automation', 'Zero-Day AI Models', 'Post-SaaS Economy'].map(topic => (
                  <button key={topic} onClick={() => setSearchQuery(topic)} className="px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#121216]/50 backdrop-blur-md text-xs font-bold text-gray-700 dark:text-gray-300 hover:border-brand-purple hover:text-brand-purple transition-colors">
                    {topic}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURED MAGAZINE EXPERIENCE */}
        {featured.length > 0 && (
          <section className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Editor's Neural Selection</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[700px]">
              {/* Massive Main Feature */}
              {featured[0] && (
                <Link to={`/article/${featured[0].id}`} className="lg:col-span-8 relative rounded-[2rem] overflow-hidden group block h-[500px] lg:h-full">
                  <div className="absolute inset-0 bg-gray-200 dark:bg-[#121216]">
                    <img src={featured[0].imageUrl} alt={featured[0].title} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" loading="eager" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-8 md:p-12 pl-8 md:pl-12 flex flex-col justify-end">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="px-3 py-1.5 rounded-full glass-panel text-xs font-bold text-white uppercase tracking-wider backdrop-blur-md">
                        {categories.find(c => c.id === featured[0].categoryId)?.name || featured[0].categoryId}
                      </span>
                      <span className="text-white/80 text-sm font-medium flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> 8 min read
                      </span>
                    </div>
                    <h3 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4 group-hover:text-cyan-300 transition-colors">
                      {featured[0].title}
                    </h3>
                    <p className="text-lg text-white/70 line-clamp-2 max-w-3xl font-medium">
                      {featured[0].excerpt}
                    </p>
                    <div className="mt-8 flex items-center gap-4">
                      <img src={featured[0].authorAvatar} className="w-12 h-12 rounded-full border-2 border-white/20" alt={featured[0].authorName} />
                      <div>
                        <div className="text-white font-bold">{featured[0].authorName}</div>
                        <div className="text-white/60 text-sm">{featured[0].authorRole}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Secondary Layered Cards */}
              <div className="lg:col-span-4 flex flex-col gap-6 h-[500px] lg:h-full">
                {featured.slice(1, 3).map((post, idx) => (
                  <Link key={post.id} to={`/article/${post.id}`} className="flex-1 relative rounded-[2rem] overflow-hidden group block bg-[#121216]">
                    <div className="absolute inset-0">
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-700 group-hover:scale-105" loading="lazy" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/60 to-transparent" />
                    
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                      <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-wider w-fit mb-4">
                        {categories.find(c => c.id === post.categoryId)?.name || post.categoryId}
                      </span>
                      <h3 className="font-display text-xl font-bold text-white leading-snug mb-3 group-hover:text-brand-purple transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <span>{formatDistanceToNow(new Date(post.date))} ago</span>
                        <span>•</span>
                        <span>{post.viewsCount || 0} views</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* AI CATEGORY DISCOVERY (Replacing boring row) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Knowledge Nodes</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-800 to-transparent mx-8 hidden md:block" />
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {categories.map(topic => {
              const Icon = topic.icon;
              const isActive = selectedCategory === topic.id;
              const count = topic.id === 'all' ? posts.length : posts.filter(p => p.categoryId === topic.id).length;
              
              return (
                <button 
                  key={topic.id} 
                  onClick={() => setSelectedCategory(topic.id)} 
                  className={`relative flex flex-col items-center justify-center gap-4 p-6 rounded-3xl transition-all duration-300 group overflow-hidden ${
                    isActive
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl'
                      : 'bg-white dark:bg-[#121216] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg'
                  }`}
                >
                  {/* Subtle Background Icon for active state */}
                  {isActive && <Icon className="absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] dark:opacity-5 pointer-events-none" />}
                  
                  <div className={`p-4 rounded-2xl transition-colors ${isActive ? 'bg-white/10 dark:bg-black/5' : 'bg-gray-50 dark:bg-white/5 group-hover:bg-gray-100 dark:group-hover:bg-white/10'}`}>
                    <Icon className={`w-6 h-6 ${isActive ? '' : 'dark:text-white text-gray-900'}`} />
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-bold ${isActive ? '' : 'text-gray-900 dark:text-white'}`}>{topic.name}</div>
                    <div className={`text-[10px] uppercase tracking-widest mt-1 font-semibold ${isActive ? 'text-white/70 dark:text-gray-900/70' : 'text-gray-400'}`}>
                      {count} {count === 1 ? 'Record' : 'Records'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* EXCLUSIVE ACCESS (Offer Banner Redefined) */}
        {featuredOffer && (
          <section>
            <div 
              onClick={handleOfferClick}
              className="relative rounded-[2.5rem] overflow-hidden bg-[#0a0a0c] border border-emerald-500/20 p-8 md:p-12 cursor-pointer group isolation-auto"
            >
              {/* Premium Glow effect behind banner */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-brand-blue/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                {featuredOffer.imageUrl && (
                  <div className="w-full md:w-64 h-40 rounded-[2rem] overflow-hidden shadow-2xl shrink-0">
                    <img 
                      src={featuredOffer.imageUrl} 
                      alt={featuredOffer.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" 
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                    <Zap className="w-3.5 h-3.5" /> High-Value Partner Sequence
                  </div>
                  <h3 className="font-display text-3xl md:text-4xl font-bold text-white">
                    {featuredOffer.title}
                  </h3>
                  <p className="text-gray-400 max-w-2xl text-lg font-medium">
                    {featuredOffer.description}
                  </p>
                </div>
                <div className="shrink-0 w-full md:w-auto">
                  <button className="w-full md:w-auto px-8 py-5 rounded-2xl bg-white text-black font-extrabold text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-xl shadow-white/10 flex items-center justify-center gap-2">
                    Initialize Sequence <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* LATEST NEURAL LOGS */}
        <section className="space-y-8">
          <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {selectedCategory === 'all' ? 'Latest Neural Logs' : `${categories.find(c => c.id === selectedCategory)?.name || selectedCategory} Logs`}
            </h2>
          </div>
          
          {filteredRecent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRecent.map(post => (
                <ArticleCard key={post.id} post={post} variant="standard" />
              ))}
            </div>
          ) : (
            <div className="col-span-full border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
              <Sparkles className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-6" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Records Found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                The neural database has no published entries for this specific category node.
              </p>
            </div>
          )}
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-32">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key="home-content"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.6 }}
          >
            {renderHomeContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
