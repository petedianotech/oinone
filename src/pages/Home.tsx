import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlog } from '../lib/BlogContext';
import { subscribeToActiveOffers, incrementOfferViews, incrementOfferClicks } from '../lib/offerService';
import { subscribeToAds } from '../lib/adsService';
import { Offer, Ad } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { ArticleFeedSkeleton } from '../components/ArticleFeedSkeleton';
import { Flame, Coins, Cpu, Sparkles, ArrowRight, ExternalLink, Search, Clock, Compass, Zap, Shield, SlidersHorizontal, Calendar, Eye, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { optimizeImageUrl } from '../lib/utils';

export function Home() {
  const { posts, loading, getFeaturedPosts, getTrendingPosts } = useBlog();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [featuredOffer, setFeaturedOffer] = useState<Offer | null>(null);
  const [activeAds, setActiveAds] = useState<Ad[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'likes'>('newest');
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const navigate = useNavigate();
  const incrementedOfferRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setVisibleCount(6);
  }, [selectedCategory, searchQuery, sortBy]);

  useEffect(() => {
    const unsubscribeOffers = subscribeToActiveOffers((offers) => {
      if (offers.length > 0) {
        const topOffer = offers[0];
        setFeaturedOffer(topOffer);
        if (!incrementedOfferRef.current.has(topOffer.id)) {
          incrementedOfferRef.current.add(topOffer.id);
          incrementOfferViews(topOffer.id).catch(console.error);
        }
      } else {
        setFeaturedOffer(null);
      }
    }, (err) => {
      console.warn('[Home] Active offers subscription silenced:', err);
    });

    const unsubscribeAds = subscribeToAds((ads) => {
      const active = ads.filter(ad => ad.status === 'active');
      setActiveAds(active);
    }, (err) => {
      console.warn('[Home] Ads subscription silenced:', err);
    });

    return () => {
      unsubscribeOffers();
      unsubscribeAds();
    };
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
    const categories = [
      { id: 'all', name: 'All Insights', icon: Compass },
      { id: 'finance', name: 'Finance & Wealth', icon: Coins },
      { id: 'technology', name: 'Tech Ecosystem', icon: Cpu },
      { id: 'mmo', name: 'Digital Business', icon: Zap },
      { id: 'ai', name: 'Artificial Intelligence', icon: Sparkles },
      { id: 'cyber', name: 'Cybersecurity', icon: Shield }
    ];

    const matchedPosts = searchQuery.trim() && !loading
      ? posts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4)
      : [];

    const trending = !loading ? getTrendingPosts() : [];
    
    // Process displayPosts with flexible filtering, sorting and paging
    let displayPosts = !loading ? [...posts] : [];

    // Filter by selected category node
    if (selectedCategory !== 'all') {
      displayPosts = displayPosts.filter(p => p.categoryId === selectedCategory);
    }

    // Filter by Search Input query string
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      displayPosts = displayPosts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q)
      );
    }

    // Apply exact custom sorting
    displayPosts.sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === 'oldest') {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        return timeA - timeB;
      }
      if (sortBy === 'views') {
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      }
      if (sortBy === 'likes') {
        return (b.likesCount || 0) - (a.likesCount || 0);
      }
      return 0;
    });

    const totalMatchingCount = displayPosts.length;
    const paginatedPosts = displayPosts.slice(0, visibleCount);

    return (
      <div className="space-y-32">
        {/* PREMIUM AI HERO SECTION (Loads immediately) */}
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
                          Search Results
                        </div>
                        {matchedPosts.map(post => (
                          <Link key={post.id} to={`/article/${post.id}`} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group text-left">
                            <img src={optimizeImageUrl(post.imageUrl, 100)} alt="" className="w-12 h-12 rounded-xl object-cover" />
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

              {/* Trending Topics Removed as requested */}
            </motion.div>
          </div>
        </section>

        {/* Content Section - Skeleton or Real data */}
        {loading ? (
          <ArticleFeedSkeleton layout="home" />
        ) : (
          <>
            {/* DYNAMIC TRENDING PORTS */}
            {trending.length > 0 && (
              <section className="space-y-8 pb-16 dark:border-b-0 border-b border-gray-200 dark:border-gray-800/80">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                  <h2 className="font-display text-2xl font-bold tracking-tight text-gray-905 dark:text-white uppercase tracking-wider">
                    Trending Articles
                  </h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-200 dark:from-gray-800 to-transparent ml-4" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trending.slice(0, 4).map((post, idx) => (
                    <Link
                      key={`trending-${post.id}`}
                      to={`/article/${post.id}`}
                      className="group relative flex flex-col justify-between p-6 rounded-[2rem] bg-gray-50/50 hover:bg-white dark:bg-[#121216]/50 dark:hover:bg-[#121216]/95 border border-gray-150 dark:border-white/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left"
                    >
                      <div className="space-y-4">
                        {/* Numeric rank badge paired with read time */}
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-mono font-extrabold text-[#1f2937]/10 dark:text-white/10 group-hover:text-brand-cyan/20 transition-colors">
                            0{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-brand-purple/80 bg-brand-purple/10 border border-brand-purple/20 px-2.5 py-1 rounded-full">
                            {post.readTime} min read
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="font-display font-black text-gray-950 dark:text-gray-100 group-hover:text-brand-purple transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-2 mt-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>

                      {/* Display metric badges inside container footer */}
                      <div className="flex items-center gap-4 pt-5 mt-4 border-t border-gray-100 dark:border-white/5 text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                          <ThumbsUp className="w-3.5 h-3.5 text-brand-purple" /> {post.likesCount || 0} Likes
                        </span>
                        <span className="flex items-center gap-1.5 hover:text-brand-cyan transition-colors">
                          <Eye className="w-3.5 h-3.5 text-brand-cyan" /> {post.viewsCount || 0} Views
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ADSTERRA NATIVE BANNER AD INTEGRATION */}
            {activeAds.length > 0 && (
              <section className="mb-12">
                <div className="flex flex-col gap-6">
                  {activeAds.map(ad => (
                    <a 
                      key={ad.id} 
                      href={ad.linkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group relative flex flex-col md:flex-row items-center justify-between p-6 md:p-8 rounded-[2rem] bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/50 dark:border-indigo-500/20 overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] hover:-translate-y-1"
                    >
                      {/* Decorative backdrop */}
                      <div className="absolute inset-0 bg-white/40 dark:bg-[#060610]/40 backdrop-blur-sm -z-10" />
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full" />
                      
                      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 z-10 w-full">
                        {ad.imageUrl && (
                          <div className="shrink-0 w-full md:w-64 h-40 md:h-32 rounded-2xl overflow-hidden shadow-lg border border-white/20 dark:border-white/5 relative group-hover:scale-105 transition-transform duration-500">
                             <img src={optimizeImageUrl(ad.imageUrl, 500)} alt={ad.title} className="w-full h-full object-cover" />
                             <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded border border-white/10 text-[9px] font-bold text-white uppercase tracking-widest">
                               Sponsored
                             </div>
                          </div>
                        )}
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-xl md:text-2xl font-display font-black text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {ad.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-indigo-200/70 font-medium max-w-2xl">
                            {ad.description}
                          </p>
                        </div>
                        <div className="shrink-0 mt-4 md:mt-0">
                          <span className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold tracking-wide shadow-lg shadow-indigo-600/20 group-hover:bg-indigo-500 transition-colors">
                            Explore Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* LATEST ARTICLES (NOW PLACED AT THE VERY TOP) */}
            <section className="space-y-8 animate-fade-in" id="articles-feed">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-250 dark:border-gray-800">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {selectedCategory === 'all' ? 'Latest Articles' : `${categories.find(c => c.id === selectedCategory)?.name || selectedCategory} Articles`}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {loading ? 'Loading...' : `Found ${totalMatchingCount} total articles`}
                  </p>
                </div>

                {/* Sorting Toolset */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-indigo-300/60 mr-2 flex items-center gap-1">
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Sort By:
                  </span>
                  
                  <div className="inline-flex rounded-xl bg-gray-100 dark:bg-white/5 p-1 border border-gray-200/60 dark:border-white/5">
                    {[
                      { id: 'newest', name: 'Newest', icon: Calendar },
                      { id: 'oldest', name: 'Oldest', icon: Calendar },
                      { id: 'views', name: 'Popularity', icon: Eye },
                      { id: 'likes', name: 'Highly Rated', icon: ThumbsUp }
                    ].map((sortItem) => {
                      const SortIcon = sortItem.icon;
                      const isSortActive = sortBy === sortItem.id;
                      return (
                        <button
                          key={sortItem.id}
                          onClick={() => setSortBy(sortItem.id as any)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSortActive
                              ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm border border-gray-200/50 dark:border-white/10'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'
                          }`}
                        >
                          <SortIcon className="w-3" />
                          <span>{sortItem.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {paginatedPosts.length > 0 ? (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paginatedPosts.map((post, idx) => {
                      if (idx === 2) {
                        return (
                          <React.Fragment key={`ad-wrapper-${post.id}`}>
                            <ArticleCard post={post} variant="standard" />
                            {/* Inline Grid Sponsor Card (Monetag Direct Link AD) */}
                            <a 
                              href="https://omg10.com/4/11136040"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group glass-panel border border-emerald-500/30 bg-[#121216]/60 rounded-[2rem] overflow-hidden hover-glass transition-all duration-500 hover:-translate-y-2 flex flex-col relative text-left"
                            >
                              <div className="h-48 relative overflow-hidden bg-gradient-to-br from-emerald-950/40 to-cyan-950/40">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#121216]/80 via-transparent to-transparent z-10" />
                                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[9px] font-bold text-white uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> SPONSOR AD
                                </div>
                                <div className="flex items-center justify-center h-full text-emerald-400 bg-gradient-to-br from-emerald-950/20 to-brand-blue/20">
                                  <Zap className="w-16 h-16 animate-bounce" style={{ animationDuration: '3s' }} />
                                </div>
                              </div>
                              <div className="p-6 flex-1 flex flex-col relative">
                                <div className="absolute -top-5 right-6 z-20 bg-emerald-500 text-black font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-lg shadow-emerald-500/20 border border-emerald-500 flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-black" /> HOT OFFER
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-emerald-300 transition-colors">Digital Wealth Activation</h3>
                                <p className="text-sm text-gray-400 leading-relaxed mb-6 font-medium flex-1">Securing direct high-payout income engines, verified advertising portals, and fast tracking MMORPG resources.</p>
                                <div className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 py-4 rounded-[1rem] text-xs font-bold uppercase tracking-widest transition-all duration-300">
                                  Access Partner Vault <ExternalLink className="w-4 h-4 text-emerald-400" />
                                </div>
                              </div>
                            </a>
                          </React.Fragment>
                        );
                      }
                      return <ArticleCard key={post.id} post={post} variant="standard" />;
                    })}
                  </div>

                  {/* Load More Button */}
                  {totalMatchingCount > visibleCount && (
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={() => setVisibleCount(prev => prev + 6)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 select-none text-gray-900 dark:text-white font-bold text-xs uppercase tracking-wider transition-all focus:ring-2 focus:ring-brand-purple/50 active:scale-95 cursor-pointer"
                      >
                        <span>Load More Insights</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="col-span-full border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
                  <Sparkles className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Records Found</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    There are no written articles for this category yet.
                  </p>
                </div>
              )}
            </section>

            {/* EXCLUSIVE ACCESS (Offer Banner Redefined) */}
            {featuredOffer && (
              <section className="animate-fade-in">
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
                          src={optimizeImageUrl(featuredOffer.imageUrl, 500)} 
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

            {/* AI CATEGORY DISCOVERY (Replacing boring row) - MOVED TO THE BOTTOM */}
            <section className="animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Browse Categories</h2>
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
                      onClick={() => {
                        setSelectedCategory(topic.id);
                        const element = document.getElementById('articles-feed');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }} 
                      className={`relative flex flex-col items-center justify-center gap-4 p-6 rounded-3xl transition-all duration-300 group overflow-hidden cursor-pointer ${
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
          </>
        )}
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
