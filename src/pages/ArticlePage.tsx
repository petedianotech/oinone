const safeGetItem = (k: string) => { try { return localStorage.getItem(k); } catch(e) { return null; } };
const safeSetItem = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch(e) {} };
const safeRemoveItem = (k: string) => { try { localStorage.removeItem(k); } catch(e) {} };
import { useParams, Navigate, Link } from 'react-router-dom';
import { useBlog } from '../lib/BlogContext';
import { CATEGORIES, cn, optimizeImageUrl } from '../lib/utils';
import { Clock, ArrowLeft, MessageSquare, Send, ThumbsUp, Lightbulb, Rocket, Sparkles, Bookmark, Volume2, Play, Pause, Square } from 'lucide-react';
import { ArticleCard } from '../components/ArticleCard';
import { ShareButtons } from '../components/ShareButtons';
import { motion, useScroll, useSpring } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { subscribeToComments, addPostComment, togglePostLike, CommentData, incrementPostViews } from '../lib/blogService';
import { formatDistanceToNow } from 'date-fns';
import Markdown from 'react-markdown';

export function ArticlePage() {
  const { articleId } = useParams<{ articleId: string }>();
  const { getPost, posts, loading } = useBlog();
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [comments, setComments] = useState<CommentData[]>(() => {
    try {
      const cachedComments = safeGetItem(`offline_comments_${articleId}`);
      return cachedComments ? JSON.parse(cachedComments) : [];
    } catch {
      return [];
    }
  });
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const [likesCount, setLikesCount] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  // Speech System States
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [isPausedSpeech, setIsPausedSpeech] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);

  const [reactions, setReactions] = useState<{
    like: boolean;
    informative: boolean;
    inspiring: boolean;
    mindBlown: boolean;
  }>(() => {
    try {
      const savedReacts = safeGetItem(`reactions_${articleId}`);
      return savedReacts ? JSON.parse(savedReacts) : { like: false, informative: false, inspiring: false, mindBlown: false };
    } catch {
      return { like: false, informative: false, inspiring: false, mindBlown: false };
    }
  });

  useEffect(() => {
    try {
      const savedReacts = safeGetItem(`reactions_${articleId}`);
      setReactions(savedReacts ? JSON.parse(savedReacts) : { like: false, informative: false, inspiring: false, mindBlown: false });
      const isSaved = safeGetItem(`saved_${articleId}`);
      setSaved(!!isSaved);
    } catch {
      setReactions({ like: false, informative: false, inspiring: false, mindBlown: false });
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSpeech(false);
    setIsPausedSpeech(false);
  }, [articleId]);

  useEffect(() => {
    if (!articleId) return;

    incrementPostViews(articleId);

    const unsubscribeComments = subscribeToComments(
      articleId,
      (loadedComments) => {
        setComments(loadedComments);
        try {
          if (safeGetItem(`saved_${articleId}`)) {
            safeSetItem(`offline_comments_${articleId}`, JSON.stringify(loadedComments));
          }
        } catch {}
      },
      (error) => {
        console.warn('[ArticlePage]: Loading comment thread fallback.', error);
        try {
          const cachedComments = safeGetItem(`offline_comments_${articleId}`);
          if (cachedComments) setComments(JSON.parse(cachedComments));
        } catch {}
      }
    );

    return () => {
      unsubscribeComments();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [articleId]);

  if (loading) {
    return (
      <div className="min-h-screen py-24 bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner" />
          <p className="text-sm text-zinc-500 font-medium">Loading article...</p>
        </div>
      </div>
    );
  }

  const post = articleId ? getPost(articleId) : undefined;

  if (!post) {
    return <Navigate to="/" replace />;
  }

  const category = CATEGORIES[post.categoryId];
  const activeLikesCount = likesCount !== null ? likesCount : (post.likesCount || 0);

  const speakArticle = () => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support audio narration.');
      return;
    }

    if (isPlayingSpeech && isPausedSpeech) {
      window.speechSynthesis.resume();
      setIsPausedSpeech(false);
      return;
    }

    if (isPlayingSpeech && !isPausedSpeech) {
      window.speechSynthesis.pause();
      setIsPausedSpeech(true);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanContent = post.content.map(p => p.replace(/<[^>]*>?/gm, '').replace(/[#*`_~]/g, '')).join('. ');
    const fullText = `${post.title}. Written by ${post.author.name}. ${post.excerpt}. ${cleanContent}`;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = speechRate;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => {
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    };

    utterance.onerror = () => {
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlayingSpeech(true);
    setIsPausedSpeech(false);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSpeech(false);
    setIsPausedSpeech(false);
  };

  const updateSpeechRate = (newRate: number) => {
    setSpeechRate(newRate);
    if (isPlayingSpeech) {
      stopSpeaking();
      setTimeout(() => speakArticle(), 150);
    }
  };

  const relatedPosts = posts.filter(p => p.id !== post.id && p.categoryId === post.categoryId).slice(0, 3);
  const fallbackRelated = relatedPosts.length > 0 ? relatedPosts : posts.filter(p => p.id !== post.id).slice(0, 3);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://oinone.co/article/${post.id}`;

  const getReactionCount = (type: 'like' | 'informative' | 'inspiring' | 'mindBlown') => {
    let base = type === 'like' ? Math.max(1, Math.floor(activeLikesCount * 0.4)) :
               type === 'informative' ? Math.max(0, Math.floor(activeLikesCount * 0.3)) :
               type === 'inspiring' ? Math.max(0, Math.floor(activeLikesCount * 0.2)) :
               Math.max(0, Math.floor(activeLikesCount * 0.1));

    if (activeLikesCount > 0 && base === 0 && type === 'informative') base = 1;
    return base + (reactions[type] ? 1 : 0);
  };

  const handleReact = async (type: 'like' | 'informative' | 'inspiring' | 'mindBlown') => {
    if (!articleId) return;
    const tokenKey = `reactions_${articleId}`;
    const newStatus = !reactions[type];
    const updated = { ...reactions, [type]: newStatus };
    setReactions(updated);
    try { safeSetItem(tokenKey, JSON.stringify(updated)); } catch (err) {}
    try {
      const result = await togglePostLike(articleId);
      if (result) setLikesCount(result.count);
    } catch (e) {}
  };

  const toggleSave = () => {
    if (!articleId || !post) return;
    const newStatus = !saved;
    setSaved(newStatus);
    try {
      if (newStatus) {
        safeSetItem(`saved_${articleId}`, "true");
        safeSetItem(`offline_post_${articleId}`, JSON.stringify(post));
        safeSetItem(`offline_comments_${articleId}`, JSON.stringify(comments));
      } else {
        safeRemoveItem(`saved_${articleId}`);
        safeRemoveItem(`offline_post_${articleId}`);
        safeRemoveItem(`offline_comments_${articleId}`);
      }
    } catch (err) {}
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleId || !newCommentContent.trim()) return;
    setSubmittingComment(true);
    try {
      const name = newCommentName.trim() || 'Reader';
      await addPostComment(articleId, name, newCommentContent.trim());
      setNewCommentContent('');
      setNewCommentName('');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Article SEO Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt,
          "image": post.imageUrl ? [post.imageUrl] : [],
          "datePublished": (() => {
            try { return new Date(post.date).toISOString(); } catch { return new Date().toISOString(); }
          })(),
          "dateModified": (() => {
            try { return new Date(post.date).toISOString(); } catch { return new Date().toISOString(); }
          })(),
          "author": [{
            "@type": "Person",
            "name": post.author?.name || "Peter Damiano",
            "role": post.author?.role || "Founder & Editor"
          }],
          "publisher": {
            "@type": "Organization",
            "name": "Oinone",
            "logo": {
              "@type": "ImageObject",
              "url": "https://oinone.co/logo.svg"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": currentUrl
          }
        })}
      </script>

      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 origin-left z-50"
        style={{ scaleX }}
      />
      
      {/* Article Header */}
      <header className="bg-white border-b border-zinc-200 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to all articles</span>
            </Link>
            <button 
              onClick={toggleSave} 
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                saved 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                  : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{saved ? 'Saved' : 'Save article'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              {category?.name || 'Insight'}
            </span>
            <span className="text-zinc-300">·</span>
            <span className="flex items-center text-xs text-zinc-500 gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-zinc-900 tracking-tight leading-[1.15] mb-6">
            {post.title}
          </h1>

          <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed mb-8">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
            <div className="flex items-center gap-3">
              <img 
                src={post.author.avatar} 
                alt={post.author.name} 
                className="h-10 w-10 rounded-full object-cover border border-zinc-200"
              />
              <div>
                <p className="text-sm font-medium text-zinc-900">{post.author.name}</p>
                <p className="text-xs text-zinc-500">{post.author.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-400">Published</p>
              <p className="text-xs font-medium text-zinc-700">
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-10">
        <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-sm">
          <img 
            src={optimizeImageUrl(post.imageUrl, 1200)} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Article Body + Narration */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Listen Narration Player */}
        <div className="mb-10 p-4 rounded-xl bg-white border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-700">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-zinc-900">Audio Narration</h4>
              <p className="text-xs text-zinc-500">
                {isPlayingSpeech 
                  ? (isPausedSpeech ? 'Paused' : 'Playing aloud...') 
                  : 'Listen to this article'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => updateSpeechRate(speechRate === 1 ? 1.25 : speechRate === 1.25 ? 1.5 : 1)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              {speechRate}x
            </button>
            <button
              onClick={speakArticle}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {isPlayingSpeech && !isPausedSpeech ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> {isPausedSpeech ? 'Resume' : 'Listen'}
                </>
              )}
            </button>
            {isPlayingSpeech && (
              <button
                onClick={stopSpeaking}
                className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                title="Stop"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Formatted Content */}
        <div className="prose-article prose-zinc max-w-none">
          {post.content.map((paragraph, idx) => (
            <div key={`p-${idx}`} className="mb-6 leading-relaxed">
              <Markdown>{paragraph}</Markdown>
            </div>
          ))}
        </div>

        {/* Share buttons */}
        <div className="mt-12 pt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Share this article
          </span>
          <ShareButtons title={post.title} url={currentUrl} />
        </div>

        {/* Reactions Section */}
        <div className="mt-10 pt-8 border-t border-zinc-200">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Was this article helpful?
          </h3>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => handleReact('like')}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer",
                reactions.like
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
              )}
            >
              <ThumbsUp className="w-4 h-4" /> Helpful ({getReactionCount('like')})
            </button>
            <button
              onClick={() => handleReact('informative')}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer",
                reactions.informative
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
              )}
            >
              <Lightbulb className="w-4 h-4" /> Informative ({getReactionCount('informative')})
            </button>
            <button
              onClick={() => handleReact('inspiring')}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer",
                reactions.inspiring
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
              )}
            >
              <Rocket className="w-4 h-4" /> Practical ({getReactionCount('inspiring')})
            </button>
            <button
              onClick={() => handleReact('mindBlown')}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer",
                reactions.mindBlown
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
              )}
            >
              <Sparkles className="w-4 h-4" /> Insightful ({getReactionCount('mindBlown')})
            </button>
          </div>
        </div>

        {/* Reader Comments */}
        <div className="mt-14 pt-10 border-t border-zinc-200">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-zinc-700" />
            <h2 className="text-xl font-semibold text-zinc-900">
              Discussion ({comments.length})
            </h2>
          </div>

          <form onSubmit={handleCommentSubmit} className="mb-10 p-5 rounded-xl bg-white border border-zinc-200">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={newCommentName}
                  onChange={(e) => setNewCommentName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  maxLength={60}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Your Comment</label>
                <textarea
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  placeholder="Share your perspective or ask a question..."
                  required
                  rows={3}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !newCommentContent.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submittingComment ? 'Posting...' : 'Post comment'} <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4 text-center">No comments yet. Start the conversation!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-4 rounded-xl bg-white border border-zinc-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-zinc-900">{comment.authorName}</span>
                    <span className="text-xs text-zinc-400">
                      {formatDistanceToNow(new Date(comment.createdAt))} ago
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {/* Related Articles Section */}
      <section className="bg-white border-t border-zinc-200 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-8">
            Related articles in {category?.name || 'this category'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fallbackRelated.map(p => (
              <ArticleCard key={p.id} post={p} variant="standard" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
