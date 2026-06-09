import { useParams, Navigate, Link } from 'react-router-dom';
import { useBlog } from '../lib/BlogContext';
import { CATEGORIES, cn } from '../lib/utils';
import { Clock, Facebook, Twitter, Linkedin, Link as LinkIcon, ArrowLeft, MessageSquare, Send, ThumbsUp, Lightbulb, Rocket, Sparkles } from 'lucide-react';
import { ArticleCard } from '../components/ArticleCard';
import { ShareButtons } from '../components/ShareButtons';
import { motion, useScroll, useSpring } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { subscribeToComments, addPostComment, togglePostLike, CommentData, incrementPostViews } from '../lib/blogService';

export function ArticlePage() {
  const { articleId } = useParams<{ articleId: string }>();
  const { getPost, posts, loading } = useBlog();
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [comments, setComments] = useState<CommentData[]>([]);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const [likesCount, setLikesCount] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [reactions, setReactions] = useState<{
    like: boolean;
    informative: boolean;
    inspiring: boolean;
    mindBlown: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem(`reactions_${articleId}`);
      return saved ? JSON.parse(saved) : { like: false, informative: false, inspiring: false, mindBlown: false };
    } catch {
      return { like: false, informative: false, inspiring: false, mindBlown: false };
    }
  });

  // Update reactions state if articleId changes to prevent stale data when navigating between related articles
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`reactions_${articleId}`);
      setReactions(saved ? JSON.parse(saved) : { like: false, informative: false, inspiring: false, mindBlown: false });
    } catch {
      setReactions({ like: false, informative: false, inspiring: false, mindBlown: false });
    }
  }, [articleId]);

  // 1. Hook up listeners for dynamic comments and like status
  useEffect(() => {
    if (!articleId) return;

    incrementPostViews(articleId);

    const unsubscribeComments = subscribeToComments(
      articleId,
      (loadedComments) => {
        setComments(loadedComments);
      },
      (error) => {
        console.error('[ArticlePage]: Loading comment thread. Default to empty.', error);
      }
    );

    return () => unsubscribeComments();
  }, [articleId]);

  // 2. Fetch specific article
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 transition-colors duration-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-t-2 border-indigo-600 animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm animate-pulse">Syncing article details...</p>
        </div>
      </div>
    );
  }

  const post = getPost(articleId || '');

  if (!post) {
    return <Navigate to="/" replace />;
  }

  // Handle setting initial count or changes of likes
  const activeLikesCount = likesCount !== null ? likesCount : (post.likesCount || 0);

  const category = CATEGORIES[post.categoryId];
  const relatedPosts = posts.filter(p => p.id !== post.id).slice(0, 3);
  const currentUrl = window.location.href;

  // We distribute activeLikesCount across 4 reaction types so they scale realistically with popularity
  const getReactionCount = (type: 'like' | 'informative' | 'inspiring' | 'mindBlown') => {
    let base = 0;
    // Deterministic distribution based on total article upvotes/likes
    if (type === 'like') {
      base = Math.max(1, Math.floor(activeLikesCount * 0.4));
    } else if (type === 'informative') {
      base = Math.max(0, Math.floor(activeLikesCount * 0.3));
    } else if (type === 'inspiring') {
      base = Math.max(0, Math.floor(activeLikesCount * 0.2));
    } else if (type === 'mindBlown') {
      base = Math.max(0, Math.floor(activeLikesCount * 0.1));
    }

    // fallback padding to ensure at least some count for interactive feel
    if (activeLikesCount > 0 && base === 0 && type === 'informative') {
      base = 1;
    }

    const userReacted = reactions[type];
    return base + (userReacted ? 1 : 0);
  };

  const handleReact = async (type: 'like' | 'informative' | 'inspiring' | 'mindBlown') => {
    if (!articleId) return;
    
    const tokenKey = `reactions_${articleId}`;
    const newStatus = !reactions[type];
    const updated = { ...reactions, [type]: newStatus };
    
    setReactions(updated);
    try {
      localStorage.setItem(tokenKey, JSON.stringify(updated));
    } catch (err) {
      console.warn("localStorage not accessible", err);
    }

    try {
      // Toggle the post upvote in DB to increment/decrement the SEO metrics on Firestore
      const result = await togglePostLike(articleId);
      setLikesCount(result.count);
    } catch (e) {
      console.error('[ArticlePage reacting action error]:', e);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleId || !newCommentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const name = newCommentName.trim() || 'Anonymous Reader';
      await addPostComment(articleId, name, newCommentContent.trim());
      setNewCommentContent('');
      setNewCommentName('');
    } catch (err) {
      console.error('[ArticlePage Comment Action FAILED!]:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
      {/* Reading Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-indigo-600 origin-left z-50"
        style={{ scaleX }}
      />
      
      {/* Article Header */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <div className="flex items-center space-x-4 mb-6">
          <Link to={`/${post.categoryId}`} className={cn("text-xs font-semibold uppercase tracking-wider", `text-${category.color.split('text-')[1]}`)}>
            {category.name}
          </Link>
          <span className="text-gray-300 dark:text-gray-700">&bull;</span>
          <span className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
            <Clock className="mr-1 h-3 w-3" />
            {post.readTime} min read
          </span>
        </div>
        
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-950 dark:text-white leading-tight mb-6 tracking-tight text-balance">
          {post.title}
        </h1>
        
        <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-3xl">
          {post.excerpt}
        </p>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-y border-gray-100 dark:border-gray-800 gap-4">
          <div className="flex items-center space-x-3">
            <img src={post.author.avatar} alt={post.author.name} className="h-12 w-12 rounded-full border border-gray-150 dark:border-gray-800" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{post.author.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{post.author.role} &bull; {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 4 Feature Engagement Reactions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Thumbs Up (Like) */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReact('like')}
                className={cn(
                  "flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer",
                  reactions.like
                    ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400 shadow-sm"
                    : "bg-white border-gray-250 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-white"
                )}
                title="Thumbs Up"
              >
                <ThumbsUp className={cn("h-3.5 w-3.5", reactions.like ? "fill-blue-500 stroke-blue-500" : "")} />
                <span>👍 {getReactionCount('like')}</span>
              </motion.button>

              {/* Informative */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReact('informative')}
                className={cn(
                  "flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer",
                  reactions.informative
                    ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400 shadow-sm"
                    : "bg-white border-gray-250 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-white"
                )}
                title="Informative"
              >
                <Lightbulb className={cn("h-3.5 w-3.5", reactions.informative ? "fill-amber-500 stroke-amber-500" : "")} />
                <span>💡 {getReactionCount('informative')}</span>
              </motion.button>

              {/* Inspiring */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReact('inspiring')}
                className={cn(
                  "flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer",
                  reactions.inspiring
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400 shadow-sm"
                    : "bg-white border-gray-250 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-white"
                )}
                title="Inspiring"
              >
                <Rocket className={cn("h-3.5 w-3.5", reactions.inspiring ? "fill-emerald-500 stroke-emerald-500" : "")} />
                <span>🚀 {getReactionCount('inspiring')}</span>
              </motion.button>

              {/* Mind-blown */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReact('mindBlown')}
                className={cn(
                  "flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer",
                  reactions.mindBlown
                    ? "bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-950/20 dark:border-purple-900/40 dark:text-purple-400 shadow-sm"
                    : "bg-white border-gray-250 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-white"
                )}
                title="Mind-blown"
              >
                <Sparkles className={cn("h-3.5 w-3.5", reactions.mindBlown ? "fill-purple-500 stroke-purple-500" : "")} />
                <span>😮 {getReactionCount('mindBlown')}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          
          {post.summary && (
             <div className="absolute top-4 right-4 z-10">
               <button 
                 onClick={() => setShowSummary(!showSummary)}
                 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-lg backdrop-blur-md transition cursor-pointer"
               >
                 {showSummary ? "Hide Summary" : "Summarise (Simple English)"}
               </button>
             </div>
          )}
        </div>
      </div>

      {post.summary && showSummary && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl"
          >
             <h3 className="text-lg font-display font-bold text-indigo-900 dark:text-indigo-200 mb-2">Article Summary</h3>
             <p className="text-indigo-800 dark:text-indigo-300 leading-relaxed text-sm">
                {post.summary}
             </p>
          </motion.div>
        </div>
      )}

      {/* Article Body */}
      <article className="max-w-2xl mx-auto px-4 sm:px-6 pb-12 prose prose-lg prose-indigo dark:prose-invert prose-headings:font-display prose-headings:tracking-tight text-gray-800 dark:text-gray-200 leading-relaxed">
        {post.content.map((paragraph, idx) => {
          const hasHTML = paragraph.trim().startsWith('<') || /<\/?[a-z][\s\S]*>/i.test(paragraph);
          if (hasHTML) {
            return (
              <div 
                key={idx} 
                className="mb-6 space-y-4 prose-headings:font-display prose-headings:tracking-tight prose-a:text-indigo-600"
                dangerouslySetInnerHTML={{ __html: paragraph }} 
              />
            );
          }
          return (
            <p key={idx} className={`${idx === 0 ? 'text-xl leading-relaxed text-gray-600 dark:text-gray-300 mb-8' : 'mb-6'}`}>
              {paragraph}
            </p>
          );
        })}
      </article>

      {/* Share Buttons Component */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-16 border-b border-gray-150 dark:border-gray-850">
        <ShareButtons title={post.title} url={currentUrl} />
      </div>

      {/* Interactive Comments Thread Section */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16" id="comments-section">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-indigo-650 dark:text-indigo-400" />
            <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">
              Discussion ({comments.length})
            </h3>
          </div>
        </div>

        {/* 1. Comment entry Form */}
        <form onSubmit={handleCommentSubmit} className="mb-10 bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-150 dark:border-gray-850 transition-all">
          <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
            Leave your feedback
          </span>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={newCommentName}
                onChange={(e) => setNewCommentName(e.target.value)}
                placeholder="Your Name (Default: Anonymous Reader)"
                maxLength={80}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-950 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all"
              />
            </div>
            <div>
              <textarea
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder="Share your thoughts or questions on this article..."
                required
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-950 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingComment || !newCommentContent.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium text-xs flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <span>{submittingComment ? "Posting..." : "Post Comment"}</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </form>

        {/* 2. Comments Thread List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                No comments written yet. Be the first to start the conversation!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={comment.id}
                className="flex items-start space-x-3.5 p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-2xl"
              >
                <img
                  src={comment.authorAvatar}
                  alt={comment.authorName}
                  className="h-10 w-10 rounded-full border border-gray-100 dark:border-gray-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <h5 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {comment.authorName}
                    </h5>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                      {new Date(comment.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed break-words whitespace-pre-line">
                    {comment.content}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Recommended Articles */}
      <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-gray-950 dark:text-white mb-10">Read Next</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedPosts.map(p => (
              <ArticleCard key={p.id} post={p} variant="standard" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
