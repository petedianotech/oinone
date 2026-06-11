import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, CategoryId } from '../types';
import { subscribeToArticles } from './blogService';

interface BlogContextType {
  posts: Post[];
  loading: boolean;
  getPost: (id: string) => Post | undefined;
  getCategoryPosts: (categoryId: CategoryId) => Post[];
  getFeaturedPosts: () => Post[];
  getTrendingPosts: () => Post[];
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const cached = localStorage.getItem('oinone_cached_posts');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('oinone_cached_posts');
      return !cached;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    // Standard real-time binding to Firestore with caching fallback
    const unsubscribe = subscribeToArticles(
      (realtimePosts) => {
        setPosts(realtimePosts);
        setLoading(false);
        try {
          localStorage.setItem('oinone_cached_posts', JSON.stringify(realtimePosts));
        } catch (e) {
          console.error(e);
        }
      },
      (error) => {
        console.error('[BlogProvider Listener Error]:', error);
        try {
          const cached = localStorage.getItem('oinone_cached_posts');
          if (cached) {
            setPosts(JSON.parse(cached));
          }
        } catch (e) {}
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getPost = (id: string) => {
    const found = posts.find((p) => p.id === id);
    if (found) return found;
    try {
      const cached = localStorage.getItem(`offline_post_${id}`);
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
    return posts.filter((p) => p.trending);
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
