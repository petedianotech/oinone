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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Standard real-time binding to Firestore
    const unsubscribe = subscribeToArticles(
      (realtimePosts) => {
        setPosts(realtimePosts);
        setLoading(false);
      },
      (error) => {
        console.error('[BlogProvider Listener Error]:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getPost = (id: string) => {
    return posts.find((p) => p.id === id);
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
