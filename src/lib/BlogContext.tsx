const safeGetItem = (k: string) => { try { return localStorage.getItem(k); } catch(e) { return null; } };
const safeSetItem = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch(e) {} };
const safeRemoveItem = (k: string) => { try { localStorage.removeItem(k); } catch(e) {} };
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, CategoryId, PromoCampaign } from '../types';
import { subscribeToArticles } from './blogService';
import { subscribeToPromos, updatePromoCampaign, DEFAULT_PROMOS } from './promoService';

interface BlogContextType {
  posts: Post[];
  loading: boolean;
  getPost: (id: string) => Post | undefined;
  getCategoryPosts: (categoryId: CategoryId) => Post[];
  getFeaturedPosts: () => Post[];
  getTrendingPosts: () => Post[];
  promos: Record<PromoCampaign['id'], PromoCampaign>;
  updatePromo: (id: PromoCampaign['id'], updates: Partial<PromoCampaign>) => Promise<void>;
  preferredCategories: string[];
  isPersonalizedFilterActive: boolean;
  setIsPersonalizedFilterActive: (active: boolean) => void;
  streak: number;
  handleTogglePreference: (categoryId: string) => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const cached = safeGetItem('oinone_cached_posts');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [promos, setPromos] = useState<Record<PromoCampaign['id'], PromoCampaign>>(() => {
    try {
      const cached = safeGetItem('oinone_cached_promos');
      return cached ? JSON.parse(cached) : DEFAULT_PROMOS;
    } catch {
      return DEFAULT_PROMOS;
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = safeGetItem('oinone_cached_posts');
      return !cached;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    // Standard real-time binding to Firestore with caching fallback
    const unsubscribeArticles = subscribeToArticles(
      (realtimePosts) => {
        setPosts(realtimePosts);
        setLoading(false);
        try {
          safeSetItem('oinone_cached_posts', JSON.stringify(realtimePosts));
        } catch (e) {
          console.error(e);
        }
      },
      (error) => {
        console.error('[BlogProvider articles Listener Error]:', error);
        try {
          const cached = safeGetItem('oinone_cached_posts');
          if (cached) {
            setPosts(JSON.parse(cached));
          }
        } catch (e) {}
        setLoading(false);
      }
    );

    // Dynamic real-time binding to Promo Campaigns
    const unsubscribePromos = subscribeToPromos(
      (realtimePromos) => {
        setPromos(realtimePromos);
        try {
          safeSetItem('oinone_cached_promos', JSON.stringify(realtimePromos));
        } catch (e) {
          console.error(e);
        }
      },
      (error) => {
        console.error('[BlogProvider promos Listener Error]:', error);
        try {
          const cached = safeGetItem('oinone_cached_promos');
          if (cached) {
            setPromos(JSON.parse(cached));
          }
        } catch (e) {}
      }
    );

    return () => {
      unsubscribeArticles();
      unsubscribePromos();
    };
  }, []);

  const updatePromo = async (id: PromoCampaign['id'], updates: Partial<PromoCampaign>) => {
    const updated = await updatePromoCampaign(id, updates);
    if (updated) {
      setPromos(prev => ({
        ...prev,
        [id]: updated
      }));
    }
  };


  const getPost = (id: string) => {
    const found = posts.find((p) => p.id === id);
    if (found) return found;
    try {
      const cached = safeGetItem(`offline_post_${id}`);
      if (cached) {
        return JSON.parse(cached) as Post;
      }
    } catch (e) {
      console.error('[BlogContext Offline getPost]:', e);
    }
    return undefined;
  };

  const getCategoryPosts = (categoryId: CategoryId) => {
    return posts.filter((p) => p.categoryId === categoryId);
  };

  const getFeaturedPosts = () => {
    return posts.filter((p) => p.featured);
  };

  const getTrendingPosts = () => {
    return [...posts]
      .sort((a, b) => {
        const scoreA = (a.likesCount || 0) * 4 + (a.viewsCount || 0) * 1 + (a.commentsCount || 0) * 6 + (a.trending ? 15 : 0);
        const scoreB = (b.likesCount || 0) * 4 + (b.viewsCount || 0) * 1 + (b.commentsCount || 0) * 6 + (b.trending ? 15 : 0);
        return scoreB - scoreA;
      });
  };

  // Personalization fields for Finance, Technology, MMO, AI categories
  const [preferredCategories, setPreferredCategories] = useState<string[]>(() => {
    try {
      const cached = safeGetItem('oinone_preferred_categories');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isPersonalizedFilterActive, setIsPersonalizedFilterActive] = useState<boolean>(true);
  const [streak, setStreak] = useState<number>(0);

  // Daily learning streak computation
  useEffect(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastVisit = safeGetItem('oinone_last_visit');
      const currentStreak = safeGetItem('oinone_streak');
      let newStreak = currentStreak ? parseInt(currentStreak, 10) : 0;

      if (!lastVisit) {
        newStreak = 1;
        safeSetItem('oinone_last_visit', today);
        safeSetItem('oinone_streak', '1');
      } else if (lastVisit !== today) {
        const lastVisitDate = new Date(lastVisit);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate.getTime() - lastVisitDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          newStreak += 1;
        } else {
          newStreak = 1; // broken streak, reset
        }
        safeSetItem('oinone_last_visit', today);
        safeSetItem('oinone_streak', newStreak.toString());
      }
      setStreak(newStreak || 1);
    } catch (err) {
      console.warn('[Streak Loader Error]:', err);
    }
  }, []);

  const handleTogglePreference = (categoryId: string) => {
    let updated: string[];
    if (preferredCategories.includes(categoryId)) {
      updated = preferredCategories.filter(id => id !== categoryId);
    } else {
      updated = [...preferredCategories, categoryId];
    }
    setPreferredCategories(updated);
    try {
      safeSetItem('oinone_preferred_categories', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <BlogContext.Provider
      value={{
        posts,
        loading,
        getPost,
        getCategoryPosts,
        getFeaturedPosts,
        getTrendingPosts,
        promos,
        updatePromo,
        preferredCategories,
        isPersonalizedFilterActive,
        setIsPersonalizedFilterActive,
        streak,
        handleTogglePreference,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};
