import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useBlog } from '../lib/BlogContext';
import { subscribeToActiveOffers, incrementOfferViews, incrementOfferClicks } from '../lib/offerService';
import { subscribeToAds } from '../lib/adsService';
import { Offer, Ad } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { ArticleFeedSkeleton } from '../components/ArticleFeedSkeleton';
import {
  Coins,
  Cpu,
  Sparkles,
  ArrowRight,
  Search,
  Compass,
  Zap,
  Shield,
  SlidersHorizontal,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { optimizeImageUrl } from '../lib/utils';

export function Home() {
  const {
    posts,
    loading,
    getTrendingPosts,
    preferredCategories,
    isPersonalizedFilterActive,
  } = useBlog();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [featuredOffer, setFeaturedOffer] = useState<Offer | null>(null);
  const [activeAds, setActiveAds] = useState<Ad[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'likes'>('newest');
  const [visibleCount, setVisibleCount] = useState(9);
  const incrementedOfferRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setVisibleCount(9);
  }, [selectedCategory, searchQuery, sortBy, preferredCategories, isPersonalizedFilterActive]);

  useEffect(() => {
    const unsubscribeOffers = subscribeToActiveOffers(
      (offers) => {
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
      },
      (err) => console.warn('[Home] Offers subscription:', err)
    );

    const unsubscribeAds = subscribeToAds(
      (ads) => setActiveAds(ads.filter((ad) => ad.status === 'active')),
      (err) => console.warn('[Home] Ads subscription:', err)
    );

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

  const categories = [
    { id: 'all', name: 'All', icon: Compass },
    { id: 'finance', name: 'Finance', icon: Coins },
    { id: 'technology', name: 'Technology', icon: Cpu },
    { id: 'mmo', name: 'Business', icon: Zap },
    { id: 'ai', name: 'AI', icon: Sparkles },
    { id: 'cyber', name: 'Security', icon: Shield },
  ];

  // Filtering & sorting
  let displayPosts = !loading ? [...posts] : [];

  if (selectedCategory !== 'all') {
    displayPosts = displayPosts.filter((p) => p.categoryId === selectedCategory);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    displayPosts = displayPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q)
    );
  }

  displayPosts.sort((a, b) => {
    if (
      selectedCategory === 'all' &&
      isPersonalizedFilterActive &&
      preferredCategories.length > 0
    ) {
      const aPreferred = preferredCategories.includes(a.categoryId);
      const bPreferred = preferredCategories.includes(b.categoryId);
      if (aPreferred && !bPreferred) return -1;
      if (!aPreferred && bPreferred) return 1;
    }

    if (sortBy === 'newest') {
      return (b.date ? new Date(b.date).getTime() : 0) - (a.date ? new Date(a.date).getTime() : 0);
    }
    if (sortBy === 'oldest') {
      return (a.date ? new Date(a.date).getTime() : 0) - (b.date ? new Date(b.date).getTime() : 0);
    }
    if (sortBy === 'views') return (b.viewsCount || 0) - (a.viewsCount || 0);
    if (sortBy === 'likes') return (b.likesCount || 0) - (a.likesCount || 0);
    return 0;
  });

  const totalMatchingCount = displayPosts.length;
  const paginatedPosts = displayPosts.slice(0, visibleCount);
  const trending = !loading ? getTrendingPosts().slice(0, 4) : [];

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Hero */}
      <section className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-indigo-400 mb-3">
              Finance · Technology · AI · Business
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15] mb-5">
              Clear thinking on the ideas that shape how we build and invest.
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-8 max-w-xl">
              Practical deep-dives written for builders, operators, and curious minds.
            </p>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                aria-label="Search articles"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Category filters */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  document.getElementById('articles-feed')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-zinc-900'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Sponsored / Ads */}
        {activeAds.length > 0 && (
          <section className="space-y-4">
            {activeAds.map((ad) => (
              <a
                key={ad.id}
                href={ad.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-xl border border-zinc-800 bg-[#111113] hover:border-zinc-700 transition-colors"
              >
                {ad.imageUrl && (
                  <div className="w-full sm:w-40 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900">
                    <img
                      src={optimizeImageUrl(ad.imageUrl, 400)}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    Sponsored
                  </span>
                  <h3 className="text-lg font-semibold text-white mt-1 group-hover:text-indigo-300 transition-colors">
                    {ad.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                    {ad.description}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 flex-shrink-0">
                  Learn more <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </section>
        )}

        {/* Featured offer */}
        {featuredOffer && (
          <section>
            <button
              onClick={handleOfferClick}
              className="w-full text-left group flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-xl border border-zinc-800 bg-[#111113] hover:border-zinc-700 transition-colors"
            >
              {featuredOffer.imageUrl && (
                <div className="w-full sm:w-40 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900">
                  <img
                    src={optimizeImageUrl(featuredOffer.imageUrl, 400)}
                    alt={featuredOffer.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-medium uppercase tracking-wider text-amber-500/80">
                  Featured
                </span>
                <h3 className="text-lg font-semibold text-white mt-1 group-hover:text-indigo-300 transition-colors">
                  {featuredOffer.title}
                </h3>
                {featuredOffer.description && (
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                    {featuredOffer.description}
                  </p>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 flex-shrink-0">
                View offer <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </section>
        )}

        {/* Trending (when on All and not searching) */}
        {!loading && selectedCategory === 'all' && !searchQuery.trim() && trending.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-5">
              Trending
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trending.map((post) => (
                <ArticleCard key={post.id} post={post} variant="compact" />
              ))}
            </div>
          </section>
        )}

        {/* Main feed */}
        <section id="articles-feed">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {selectedCategory === 'all'
                  ? 'Latest articles'
                  : `${categories.find((c) => c.id === selectedCategory)?.name || selectedCategory} articles`}
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                {loading ? 'Loading…' : `${totalMatchingCount} article${totalMatchingCount !== 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'newest' | 'oldest' | 'views' | 'likes')
                }
                className="bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                aria-label="Sort articles"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="views">Most viewed</option>
                <option value="likes">Most liked</option>
              </select>
            </div>
          </div>

          {loading ? (
            <ArticleFeedSkeleton layout="home" />
          ) : paginatedPosts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-zinc-500">No articles match your filters.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-4 text-sm text-indigo-400 hover:text-indigo-300"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPosts.map((post) => (
                  <ArticleCard
                    key={post.id}
                    post={post}
                    isPrioritized={
                      isPersonalizedFilterActive &&
                      preferredCategories.includes(post.categoryId)
                    }
                  />
                ))}
              </div>

              {visibleCount < totalMatchingCount && (
                <div className="mt-12 text-center">
                  <button
                    onClick={() => setVisibleCount((c) => c + 9)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
