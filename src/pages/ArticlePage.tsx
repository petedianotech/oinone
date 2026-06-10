import { useParams, Navigate, Link } from 'react-router-dom';
import { useBlog } from '../lib/BlogContext';
import { CATEGORIES, cn } from '../lib/utils';
import { Clock, ArrowLeft, MessageSquare, Send, ThumbsUp, Lightbulb, Rocket, Sparkles, Bookmark, Share2 } from 'lucide-react';
import { ArticleCard } from '../components/ArticleCard';
import { ShareButtons } from '../components/ShareButtons';
import { motion, useScroll, useSpring } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { subscribeToComments, addPostComment, togglePostLike, CommentData, incrementPostViews } from '../lib/blogService';
import { formatDistanceToNow } from 'date-fns';

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
  const [saved, setSaved] = useState(false);
  const [reactions, setReactions] = useState<{
    like: boolean;
    informative: boolean;
    inspiring: boolean;
    mindBlown: boolean;
  }>(() => {
    try {
      const savedReacts = localStorage.getItem(`reactions_${articleId}`);
      return savedReacts ? JSON.parse(savedReacts) : { like: false, informative: false, inspiring: false, mindBlown: false };
    } catch {
      return { like: false, informative: false, inspiring: false, mindBlown: false };
    }
  });

  useEffect(() => {
    try {
      const savedReacts = localStorage.getItem(`reactions_${articleId}`);
      setReactions(savedReacts ? JSON.parse(savedReacts) : { like: false, informative: false, inspiring: false, mindBlown: false });
      const isSaved = localStorage.getItem(`saved_${articleId}`);
      setSaved(!!isSaved);
    } catch {
      setReactions({ like: false, informative: false, inspiring: false, mindBlown: false });
    }
  }, [articleId]);

  useEffect(() => {
    if (!articleId) return;

    incrementPostViews(articleId);

    const unsubscribeComments = subscribeToComments(
      articleId,
      (loadedComments) => setComments(loadedComments),
      (error) => console.error('[ArticlePage]: Loading comment thread. Default to empty.', error)
    );

    return () => unsubscribeComments();
  }, [articleId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-[#0a0a0c]">
        <div className="max-w-4xl mx-auto px-4 h-[60vh] rounded-3xl bg-[#121216] animate-pulse">
           <div className="flex items-center justify-center h-full">
             <div className="flex flex-col items-center gap-4">
                <Sparkles className="w-8 h-8 text-white/50 animate-bounce" />
                <p className="text-white/50 font-bold tracking-widest uppercase text-xs">Initializing Neural Link...</p>
             </div>
           </div>
        </div>
      </div>
    );
  }

  const post = getPost(articleId || '');

  if (!post) {
    return <Navigate to="/" replace />;
  }

  const activeLikesCount = likesCount !== null ? likesCount : (post.likesCount || 0);
  const category = CATEGORIES[post.categoryId];
  const relatedPosts = posts.filter(p => p.id !== post.id).slice(0, 3);
  const currentUrl = window.location.href;

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
    try { localStorage.setItem(tokenKey, JSON.stringify(updated)); } catch (err) {}
    try {
      const result = await togglePostLike(articleId);
      setLikesCount(result.count);
    } catch (e) {}
  };

  const toggleSave = () => {
    if (!articleId) return;
    const newStatus = !saved;
    setSaved(newStatus);
    try {
      if (newStatus) localStorage.setItem(`saved_${articleId}`, "true");
      else localStorage.removeItem(`saved_${articleId}`);
    } catch (err) {}
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleId || !newCommentContent.trim()) return;
    setSubmittingComment(true);
    try {
      const name = newCommentName.trim() || 'Anonymous Reader';
      await addPostComment(articleId, name, newCommentContent.trim());
      setNewCommentContent('');
      setNewCommentName('');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Premium Neural Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-purple origin-left z-50 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
        style={{ scaleX }}
      />
      
      {/* Massive Hero Setup */}
      <div className="relative pt-24 min-h-[85vh] flex flex-col items-center justify-center isolation-auto border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-transparent to-[#0a0a0c]" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center mt-12 mb-16">
          <div className="w-full flex items-center justify-between mb-8 opacity-70">
            <Link to="/" className="inline-flex items-center text-xs font-bold uppercase tracking-widest hover:text-white hover:opacity-100 transition-all">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Link>
            <div className="flex gap-4">
              <button onClick={toggleSave} className={`flex items-center gap-2 cursor-pointer transition-colors ${saved ? 'text-brand-cyan' : 'hover:text-white'}`}>
                <Bookmark className="w-4 h-4" /> {saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-8">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              {category?.name || 'Article'}
            </span>
            <span className="text-white/30">•</span>
            <span className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Clock className="mr-1 h-3.5 w-3.5" />
              {post.readTime} min read
            </span>
          </div>
          
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-8 tracking-tight text-white/95 max-w-4xl text-balance">
            {post.title}
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-400 font-medium leading-relaxed max-w-3xl mb-12">
            {post.excerpt}
          </p>
          
          <div className="flex items-center gap-6 glass-panel pl-2 pr-6 py-2 rounded-[2rem]">
            <img src={post.author.avatar} alt={post.author.name} className="h-14 w-14 rounded-full border-2 border-white/10" />
            <div className="text-left">
              <p className="font-bold text-white text-lg">{post.author.name}</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{post.author.role}</p>
            </div>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Published</p>
              <p className="font-bold text-white">{new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
        
        {/* Left Sidebar (Sticky Features) */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-32 space-y-8">
            {post.summary && (
              <div className="glass-panel p-6 rounded-3xl border border-brand-purple/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="w-20 h-20" />
                </div>
                <div className="flex items-center gap-2 mb-4 text-brand-purple">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-bold text-xs uppercase tracking-widest">Neural Summary</span>
                </div>
                <p className="text-sm text-gray-300 font-medium leading-relaxed">
                  {post.summary}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest ml-2">Share Log</span>
              <ShareButtons title={post.title} url={currentUrl} />
            </div>
          </div>
        </div>

        {/* Main Article Content */}
        <article className="lg:col-span-7 w-full sm:-mt-10 relative z-20">
          <div className="prose prose-invert prose-lg prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-cyan hover:prose-a:text-brand-blue prose-img:rounded-3xl prose-img:border prose-img:border-white/10 leading-relaxed text-gray-300">
            {post.content.map((paragraph, idx) => {
              const hasHTML = paragraph.trim().startsWith('<') || /<\/?[a-z][\s\S]*>/i.test(paragraph);
              if (hasHTML) {
                return <div key={idx} className="mb-8" dangerouslySetInnerHTML={{ __html: paragraph }} />;
              }
              // Add a bit of smart styling to the first paragraph drop cap
              if (idx === 0) {
                return <p key={idx} className="text-xl sm:text-2xl text-white/90 font-medium leading-relaxed mb-10">{paragraph}</p>;
              }
              return <p key={idx} className="mb-8">{paragraph}</p>;
            })}
          </div>

          {/* Reactions Interactivity */}
          <div className="mt-16 pt-10 border-t border-white/10">
             <h3 className="font-display text-2xl font-bold mb-6">Neural feedback</h3>
             <div className="flex flex-wrap gap-4">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleReact('like')} className={cn("flex px-6 py-3 rounded-2xl border text-sm font-bold transition-all", reactions.like ? "bg-brand-blue/20 border-brand-blue/50 text-white" : "glass-panel hover-glass text-gray-400")} >
                  <ThumbsUp className={cn("h-5 w-5 mr-2", reactions.like ? "text-brand-blue" : "")} /> 👍 {getReactionCount('like')}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleReact('informative')} className={cn("flex px-6 py-3 rounded-2xl border text-sm font-bold transition-all", reactions.informative ? "bg-amber-500/20 border-amber-500/50 text-white" : "glass-panel hover-glass text-gray-400")} >
                  <Lightbulb className={cn("h-5 w-5 mr-2", reactions.informative ? "text-amber-500" : "")} /> 💡 {getReactionCount('informative')}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleReact('inspiring')} className={cn("flex px-6 py-3 rounded-2xl border text-sm font-bold transition-all", reactions.inspiring ? "bg-emerald-500/20 border-emerald-500/50 text-white" : "glass-panel hover-glass text-gray-400")} >
                  <Rocket className={cn("h-5 w-5 mr-2", reactions.inspiring ? "text-emerald-500" : "")} /> 🚀 {getReactionCount('inspiring')}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleReact('mindBlown')} className={cn("flex px-6 py-3 rounded-2xl border text-sm font-bold transition-all", reactions.mindBlown ? "bg-brand-purple/20 border-brand-purple/50 text-white" : "glass-panel hover-glass text-gray-400")} >
                  <Sparkles className={cn("h-5 w-5 mr-2", reactions.mindBlown ? "text-brand-purple" : "")} /> 😮 {getReactionCount('mindBlown')}
                </motion.button>
             </div>
          </div>
        </article>
      </div>

      {/* Discussion Console */}
      <div className="bg-[#0a0a0c] border-t border-white/5 py-20 relative">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 z-10 relative">
            <div className="flex items-center gap-3 mb-10">
              <MessageSquare className="w-6 h-6 text-brand-purple" />
              <h2 className="font-display text-3xl font-bold text-white">System Console <span className="opacity-50">({comments.length})</span></h2>
            </div>
            
            <form onSubmit={handleCommentSubmit} className="mb-12 glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 blur-[50px]" />
              <div className="space-y-6 relative z-10">
                 <div>
                   <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Identity Handler</label>
                   <input type="text" value={newCommentName} onChange={(e) => setNewCommentName(e.target.value)} placeholder="Anonymous Node" maxLength={80} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-purple transition-all" />
                 </div>
                 <div>
                   <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Data Output</label>
                   <textarea value={newCommentContent} onChange={(e) => setNewCommentContent(e.target.value)} placeholder="Initialize thought sequence..." required rows={4} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-purple transition-all resize-none" />
                 </div>
                 <div className="flex justify-end">
                   <button type="submit" disabled={submittingComment || !newCommentContent.trim()} className="bg-white text-black px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                      {submittingComment ? "Transmitting..." : "Execute"} <Send className="w-4 h-4" />
                   </button>
                 </div>
              </div>
            </form>

            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4 p-6 glass-panel rounded-3xl border border-white/5 relative group">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img src={comment.authorAvatar} alt={comment.authorName} className="w-12 h-12 rounded-full border border-white/10 shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-white text-lg">{comment.authorName}</span>
                       <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                         {formatDistanceToNow(new Date(comment.createdAt))} ago
                       </span>
                    </div>
                    <p className="text-gray-400 font-medium leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
         </div>
      </div>

      {/* Recommended Topics Overlay */}
      <div className="bg-[#121216] border-t border-white/5 py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-brand-cyan/5 mix-blend-screen blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-12 justify-center text-center">
            <h2 className="font-display text-4xl font-extrabold pb-2 bg-gradient-to-r from-white via-gray-200 to-gray-500 -webkit-background-clip-text text-transparent bg-clip-text">Continue Protocol</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {relatedPosts.map(p => (
              <ArticleCard key={p.id} post={p} variant="standard" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
