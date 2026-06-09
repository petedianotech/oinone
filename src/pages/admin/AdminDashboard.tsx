import React, { useState, useEffect } from 'react';
import { db, auth, OperationType, handleFirestoreError } from '../../lib/firebase';
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Lock, LayoutDashboard, Users, MessageSquare, LogOut, FileText, Trash2, Plus, X, Edit2 } from 'lucide-react';
import { Post, CategoryId } from '../../types';

export function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'ai-writer' | 'comments'>('overview');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // AI Writer State
  const [aiForm, setAiForm] = useState({ topic: '', keyword: '', categoryId: 'ai', tone: 'Professional', length: 'Medium (around 800-1000 words)', imageType: 'stock' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<any>(null);
  const [activeCoverIndex, setActiveCoverIndex] = useState<number>(0);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  // New Post Form State
  const [newPost, setNewPost] = useState({
    title: '', excerpt: '', content: '', categoryId: 'ai', authorName: 'Peter', authorRole: 'Editor', authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', imageUrl: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u && u.email !== 'petedianotech@gmail.com') {
        await signOut(auth);
        setUser(null);
      } else {
        setUser(u);
      }
      setLoading(false);
      if (u && u.email === 'petedianotech@gmail.com') {
        fetchAdminData();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchAdminData = async () => {
    try {
      const postsSnap = await getDocs(collection(db, 'articles'));
      const postsData = postsSnap.docs.map(doc => doc.data() as Post);
      setPosts(postsData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (e) {
      console.error('Error fetching admin data (articles):', e);
      handleFirestoreError(e, OperationType.GET, 'articles');
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      if (result.user.email !== 'petedianotech@gmail.com') {
        await signOut(auth);
        setUser(null);
        alert('Unauthorized login attempt. Access is restricted exclusively to petedianotech@gmail.com.');
      }
    } catch (e) {
      console.error('Login failed', e);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiForm),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedDraft({ ...data, categoryId: aiForm.categoryId });
      setActiveCoverIndex(0);
    } catch (err) {
      console.error(err);
      alert('Error generating AI content');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAiDraft = async (publish: boolean) => {
    if (!generatedDraft) return;
    
    // Fallback ID generated from title
    const id = generatedDraft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // We expect content to be HTML block, but the system stores content as string[] paragraphs. 
    // Usually, we could just split by newline. 
    // Since AI gave HTML, let's just make it single-element array if it has HTML, or split if plain text.
    const contentArray = [generatedDraft.content];
    
    const fullPost: Post = {
      id,
      title: generatedDraft.title,
      summary: generatedDraft.summary || generatedDraft.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...',
      excerpt: generatedDraft.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...', // Strip HTML for excerpt
      content: contentArray,
      categoryId: generatedDraft.categoryId as CategoryId,
      author: {
        id: 'peter-admin',
        name: 'Peter Damiano',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        role: 'Developer & Creator'
      },
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: Math.max(1, Math.ceil(generatedDraft.content.split(' ').length / 200)),
      imageUrl: generatedDraft.images?.[activeCoverIndex] || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200',
      featured: false,
      trending: false,
      likesCount: 0,
      isDraft: !publish
    };

    try {
      await setDoc(doc(db, 'articles', id), fullPost);
      setPosts([fullPost, ...posts.filter(p => p.id !== id)]);
      setGeneratedDraft(null); // Clear form
      alert(publish ? 'Article Published!' : 'Draft Saved!');
      if (publish) setActiveTab('posts');
    } catch (err) {
      console.error('Error saving article', err);
      handleFirestoreError(err, OperationType.WRITE, `articles/${id}`);
    }
  };

  const publishDraft = async (id: string) => {
    try {
       await setDoc(doc(db, 'articles', id), { isDraft: false }, { merge: true });
       setPosts(posts.map(p => p.id === id ? { ...p, isDraft: false } : p));
    } catch(err) {
       console.error(err);
       handleFirestoreError(err, OperationType.UPDATE, `articles/${id}`);
    }
  };

  const openEditModal = (post: Post) => {
    setNewPost({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content.join('\n\n'),
      categoryId: post.categoryId,
      authorName: post.author.name,
      authorRole: post.author.role,
      authorAvatar: post.author.avatar,
      imageUrl: post.imageUrl
    });
    setEditingPostId(post.id);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setEditingPostId(null);
    setNewPost({ title: '', excerpt: '', content: '', categoryId: 'ai', authorName: 'Peter', authorRole: 'Editor', authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', imageUrl: '' });
  };

  const deletePost = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteDoc(doc(db, 'articles', id));
        setPosts(posts.filter(p => p.id !== id));
      } catch (err) {
        console.error(err);
        handleFirestoreError(err, OperationType.DELETE, `articles/${id}`);
      }
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPostId) {
      // Editable logic
      const postIndex = posts.findIndex(p => p.id === editingPostId);
      if (postIndex !== -1) {
        const oldPost = posts[postIndex];
        const updatedPost: Post = {
          ...oldPost,
          title: newPost.title,
          excerpt: newPost.excerpt,
          content: newPost.content.split('\n\n'),
          categoryId: newPost.categoryId as CategoryId,
        };
        try {
          await setDoc(doc(db, 'articles', editingPostId), updatedPost, { merge: true });
          const newPosts = [...posts];
          newPosts[postIndex] = updatedPost;
          setPosts(newPosts);
          setShowCreateModal(false);
          setEditingPostId(null);
          setNewPost({ title: '', excerpt: '', content: '', categoryId: 'ai', authorName: 'Peter', authorRole: 'Editor', authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', imageUrl: '' });
        } catch (err) {
          console.error(err);
          handleFirestoreError(err, OperationType.UPDATE, `articles/${editingPostId}`);
        }
      }
      return;
    }

    const id = newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const fullPost: Post = {
      id,
      title: newPost.title,
      excerpt: newPost.excerpt,
      content: newPost.content.split('\n\n'),
      categoryId: newPost.categoryId as CategoryId,
      author: {
        id: 'author-1',
        name: newPost.authorName,
        avatar: newPost.authorAvatar,
        role: newPost.authorRole
      },
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: Math.max(1, Math.ceil(newPost.content.split(' ').length / 200)),
      imageUrl: newPost.imageUrl || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200',
      featured: false,
      trending: false,
      likesCount: 0
    };
    try {
      await setDoc(doc(db, 'articles', id), fullPost);
      setPosts([fullPost, ...posts]);
      setShowCreateModal(false);
      setNewPost({ title: '', excerpt: '', content: '', categoryId: 'ai', authorName: 'Peter', authorRole: 'Editor', authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', imageUrl: '' });
    } catch (err) {
      console.error('Error creating post', err);
      handleFirestoreError(err, OperationType.WRITE, `articles/${id}`);
    }
  };

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 rounded-full border-t-2 border-indigo-600 animate-spin"></div>
     </div>;
  }

  if (!user || user.email !== 'petedianotech@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 text-center">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Access</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Please sign in with your authorized admin account to access the dashboard.</p>
          <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-medium transition-colors cursor-pointer">
            Sign In with Google
          </button>
          {user && user.email !== 'petedianotech@gmail.com' && (
            <p className="text-rose-500 text-xs mt-4">Account {user.email} is not authorized.</p>
          )}
        </motion.div>
      </div>
    );
  }

  // Calculate totals
  const totalLikes = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
  
  // Chart Data calculation
  // Group posts by date locally
  const processChartData = () => {
    const publishedPosts = posts.filter(p => !p.isDraft);
    const dateMap: Record<string, { views: number, likes: number, comments: number }> = {};
    
    // Initialize the last 7 days with 0s
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // Format as "Feb 10" or similar based on toLocaleDateString
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dateMap[dateStr] = { views: 0, likes: 0, comments: 0 };
    }
    
    for (const post of publishedPosts) {
      // Parse post date into matching format
      const postDate = new Date(post.date);
      const postDateStr = postDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      if (dateMap[postDateStr]) {
        dateMap[postDateStr].views += (post.viewsCount || 0);
        dateMap[postDateStr].likes += (post.likesCount || 0);
        dateMap[postDateStr].comments += (post.commentsCount || 0);
      }
    }
    
    return Object.keys(dateMap).map(dateStr => ({
      name: dateStr,
      ...dateMap[dateStr]
    }));
  };
  
  const chartData = processChartData();

  return (
    <div className="min-h-screen bg-[#060610] text-[#f1f1f6] flex flex-col md:flex-row transition-colors selection:bg-indigo-500/30 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.06),transparent_50%)] pointer-events-none" />
      {/* Sidebar Menu */}
      <div className="w-full md:w-64 bg-gradient-to-b from-[#0a0a16] via-[#100f2e] to-[#0a0a16] border-r border-indigo-900/30 p-6 flex flex-col text-white shadow-xl relative overflow-hidden shrink-0">
        <div className="absolute inset-x-0 top-0 h-64 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="flex items-center gap-3 mb-10 text-indigo-400 relative z-10">
          <LayoutDashboard className="w-6 h-6" />
          <span className="font-display font-bold text-xl text-white">Admin Hub</span>
        </div>
        
        <nav className="flex-1 space-y-2 relative z-10">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeTab === 'overview' ? 'bg-indigo-500/20 text-indigo-300 border-l-2 border-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button onClick={() => setActiveTab('ai-writer')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeTab === 'ai-writer' ? 'bg-indigo-500/20 text-indigo-300 border-l-2 border-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <MessageSquare className="w-4 h-4" /> AI Writer
          </button>
          <button onClick={() => setActiveTab('posts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeTab === 'posts' ? 'bg-indigo-500/20 text-indigo-300 border-l-2 border-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <FileText className="w-4 h-4" /> Articles
          </button>
          
          <div className="pt-6 mt-6 border-t border-white/10 uppercase text-[10px] tracking-widest font-bold text-indigo-200/50 mb-2 px-2">
            Quick Panels
          </div>
          <button onClick={() => setActiveTab('posts')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-gray-400 hover:bg-white/5 hover:text-white`}>
             <span className="w-2 h-2 rounded-full bg-emerald-400" /> Finance Sector
          </button>
          <button onClick={() => setActiveTab('posts')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-gray-400 hover:bg-white/5 hover:text-white`}>
             <span className="w-2 h-2 rounded-full bg-blue-400" /> Technology Hub
          </button>
          <button onClick={() => setActiveTab('posts')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-gray-400 hover:bg-white/5 hover:text-white`}>
             <span className="w-2 h-2 rounded-full bg-purple-400" /> AI Systems
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-rose-400 transition-colors cursor-pointer relative z-10">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto relative z-10 bg-[#060610]/50 backdrop-blur-3xl">
        <div className="absolute inset-0 bg-[#060610] h-full pointer-events-none -z-10" />
        <div className="absolute inset-x-0 -top-40 h-80 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
        
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-indigo-950/45">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> Live Administration
            </div>
            <h2 className="text-3xl font-display font-extrabold text-white tracking-tight capitalize">{activeTab}</h2>
            <p className="text-indigo-200/60 mt-1 text-sm">Welcome back, Peter Damiano. Your creative engine is fully synchronized.</p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/25 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 shadow-sm shadow-indigo-500/5">
            <span>Secure Cloud Access</span>
          </div>
        </header>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#0c0b24] to-[#04040e] p-6 rounded-2xl border border-indigo-900/40 shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full" />
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20"><FileText className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-indigo-300/60 font-bold">Total Articles</p>
                    <p className="text-3xl font-display font-extrabold text-white mt-1">{posts.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-[#0c0b24] to-[#04040e] p-6 rounded-2xl border border-indigo-900/40 shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-2xl rounded-full" />
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20"><MessageSquare className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-purple-300/60 font-bold">Total Likes</p>
                    <p className="text-3xl font-display font-extrabold text-white mt-1">{totalLikes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#0c0b24] to-[#04040e] p-6 rounded-2xl border border-indigo-900/40 shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300 sm:col-span-2 md:col-span-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl rounded-full" />
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20"><Users className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-emerald-300/60 font-bold">Creator Profile</p>
                    <p className="text-lg font-display font-bold text-white mt-2 truncate">Peter Damiano</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0c0b24] to-[#04040e] p-6 rounded-2xl border border-indigo-900/40 shadow-xl w-full h-[400px] relative overflow-hidden">
              <div className="absolute inset-x-0 -top-32 h-64 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
              <div className="flex items-center justify-between mb-6 z-10 relative">
                <div>
                  <h3 className="text-lg font-bold text-white">Insight Operations</h3>
                  <p className="text-xs text-indigo-200/50">Tracking reader sentiment & engagement metrics</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-indigo-400"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Views</span>
                  <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Likes</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="75%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1b4b" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#657491" fontSize={11} tickLine={false} />
                  <YAxis stroke="#657491" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0c0b24', borderColor: '#2e2a75', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#E2E8F0' }}
                  />
                  <Line type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, stroke: '#6366f1', strokeWidth: 1 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="likes" stroke="#10b981" strokeWidth={3} dot={{ r: 4, stroke: '#10b981', strokeWidth: 1 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {activeTab === 'ai-writer' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-gradient-to-br from-[#0c0b24] to-[#04040e] p-8 rounded-2xl border border-indigo-900/40 shadow-xl max-w-4xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full" />
              <h3 className="text-xl font-display font-bold mb-6 text-white flex items-center gap-2">
                <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20"><MessageSquare className="w-5 h-5" /></span>
                AI Creative Studio
              </h3>
              {!generatedDraft ? (
                <form onSubmit={handleGenerateAI} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-indigo-300/70 uppercase tracking-wider mb-2">Topic / Title Theme</label>
                      <input type="text" required value={aiForm.topic} onChange={e => setAiForm({...aiForm, topic: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-indigo-950 bg-[#060610]/80 text-white placeholder-indigo-300/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all outline-none" placeholder="e.g. Future of Generative AI" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-indigo-300/70 uppercase tracking-wider mb-2">Primary SEO Keyword</label>
                      <input type="text" required value={aiForm.keyword} onChange={e => setAiForm({...aiForm, keyword: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-indigo-950 bg-[#060610]/80 text-white placeholder-indigo-300/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all outline-none" placeholder="generative ai trends 2026" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-indigo-300/70 uppercase tracking-wider mb-2">Channel Category</label>
                      <select value={aiForm.categoryId} onChange={e => setAiForm({...aiForm, categoryId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-indigo-950 bg-[#060610]/80 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all outline-none">
                        <option value="finance">Finance</option>
                        <option value="technology">Technology</option>
                        <option value="mmo">Make Money</option>
                        <option value="ai">AI</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-indigo-300/70 uppercase tracking-wider mb-2">Editorial Tone</label>
                      <input type="text" value={aiForm.tone} onChange={e => setAiForm({...aiForm, tone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-indigo-950 bg-[#060610]/80 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-indigo-300/70 uppercase tracking-wider mb-2">Target Article Length</label>
                      <input type="text" value={aiForm.length} onChange={e => setAiForm({...aiForm, length: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-indigo-950 bg-[#060610]/80 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-indigo-300/70 uppercase tracking-wider mb-3">Cover Art Selection Protocol</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${aiForm.imageType === 'stock' ? 'border-indigo-500 bg-indigo-500/10' : 'border-indigo-950 bg-[#060610]/40 hover:bg-white/5 text-gray-300'}`}>
                          <input type="radio" name="imageType" value="stock" checked={aiForm.imageType === 'stock'} onChange={() => setAiForm({...aiForm, imageType: 'stock'})} className="text-indigo-600 focus:ring-indigo-500" />
                          <div>
                            <span className="block font-semibold text-sm text-white">AI Search Stock Images</span>
                            <span className="block text-xs text-indigo-200/50 mt-0.5">Blazing fast, real-time handpicked matching stock photos</span>
                          </div>
                        </label>
                        <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${aiForm.imageType === 'ai' ? 'border-indigo-500 bg-indigo-500/10' : 'border-indigo-950 bg-[#060610]/40 hover:bg-white/5 text-gray-300'}`}>
                          <input type="radio" name="imageType" value="ai" checked={aiForm.imageType === 'ai'} onChange={() => setAiForm({...aiForm, imageType: 'ai'})} className="text-indigo-600 focus:ring-indigo-500" />
                          <div>
                            <span className="block font-semibold text-sm text-white">Custom Imagen 4.0 Art</span>
                            <span className="block text-xs text-indigo-200/50 mt-0.5">Unique generative AI designs tailored to topic</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-indigo-950/45">
                    {isGenerating && (
                      <div className="text-xs font-semibold text-indigo-400 animate-pulse flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
                        Synthesizing premium editorial content drafts and executing search engine crawl grounding...
                      </div>
                    )}
                    <button type="submit" disabled={isGenerating} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold tracking-wide transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] flex items-center gap-2 ml-auto cursor-pointer">
                       {isGenerating ? (
                         <>
                           <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                           <span>Creating Draft...</span>
                         </>
                       ) : 'Generate Blog Post'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 relative z-10">
                  <div className="bg-[#060610]/80 p-5 rounded-2xl text-xs text-indigo-200/80 font-mono overflow-auto max-h-40 border border-indigo-900/30 leading-relaxed">
                    <strong className="text-indigo-300 text-[10px] uppercase tracking-wider font-sans block mb-1.5">Deep Research Grounding Synopsis:</strong>
                    {generatedDraft.researchSummary}
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 px-2.5 py-1 rounded-full font-bold">Unreleased Draft</span>
                      <h1 className="text-3xl font-display font-extrabold mb-4 text-white mt-3 tracking-tight">{generatedDraft.title}</h1>
                      
                      {generatedDraft.images && generatedDraft.images.length > 0 && (
                        <div className="mb-6 space-y-3">
                          <label className="block text-xs font-bold text-indigo-300/60 uppercase tracking-wider">Select Primary Cover / Featured Artwork</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {generatedDraft.images.map((imgUrl: string, idx: number) => {
                              const isSelected = activeCoverIndex === idx;
                              return (
                                <div 
                                  key={idx} 
                                  onClick={() => setActiveCoverIndex(idx)}
                                  className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 group ${
                                    isSelected ? "border-indigo-500 scale-[1.02] shadow-xl shadow-indigo-500/20" : "border-indigo-950 opacity-60 hover:opacity-100 hover:border-indigo-800"
                                  }`}
                                >
                                  <img referrerPolicy="no-referrer" src={imgUrl} alt={`Cover option ${idx + 1}`} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                                    <span className="text-[10px] text-white font-semibold">Select Design Mockup {idx + 1}</span>
                                  </div>
                                  {isSelected && (
                                    <div className="absolute top-2 left-2 bg-indigo-500 text-white rounded-lg p-1 text-[9px] uppercase font-bold tracking-wider px-2 shadow">Active Layout</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-indigo-300/60 uppercase tracking-wider mb-2">Editorial Prose Preview</label>
                        <div className="prose dark:prose-invert max-w-none text-sm border p-6 rounded-2xl bg-[#060610]/80 border-indigo-950 text-indigo-100/90 h-96 overflow-y-auto leading-relaxed" dangerouslySetInnerHTML={{ __html: generatedDraft.content }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-indigo-950/40 pt-5">
                     <button onClick={() => setGeneratedDraft(null)} className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer text-sm font-medium">Discard</button>
                     <button onClick={() => saveAiDraft(false)} className="px-5 py-2.5 border border-indigo-550/30 text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-all cursor-pointer text-sm font-medium">Save Offline Draft</button>
                     <button onClick={() => saveAiDraft(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer text-sm">Publish to Live Feed</button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'posts' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Articles Database</h3>
                <p className="text-xs text-indigo-200/50 mt-0.5">Manage and organize your published content and offline drafts</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-indigo-650 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Article
              </button>
            </div>
            
            <div className="bg-gradient-to-b from-[#0c0b24] to-[#04040e] rounded-2xl border border-indigo-900/40 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#0b0a21] border-b border-indigo-900/40">
                    <tr>
                      <th className="p-4 text-xs font-bold text-indigo-300/70 uppercase tracking-widest">Title</th>
                      <th className="p-4 text-xs font-bold text-indigo-300/70 uppercase tracking-widest">Status</th>
                      <th className="p-4 text-xs font-bold text-indigo-300/70 uppercase tracking-widest">Category</th>
                      <th className="p-4 text-xs font-bold text-indigo-300/70 uppercase tracking-widest">Date</th>
                      <th className="p-4 text-xs font-bold text-indigo-300/70 uppercase tracking-widest">Views</th>
                      <th className="p-4 text-xs font-bold text-indigo-300/70 uppercase tracking-widest">Likes</th>
                      <th className="p-4 text-xs font-bold text-indigo-300/70 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-950/40">
                    {posts.map(post => (
                      <tr key={post.id} className="hover:bg-indigo-500/5 transition-colors">
                        <td className="p-4 text-sm font-semibold text-white">
                          <div className="flex items-center gap-3">
                            <img src={post.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-indigo-900/40" />
                            <span className="truncate max-w-[240px] block text-white font-medium hover:text-indigo-400 transition-colors">{post.title}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm whitespace-nowrap">
                          {post.isDraft ? 
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/15 rounded-full text-xs font-bold tracking-wide">Draft</span>
                          :
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-full text-xs font-bold tracking-wide">Published</span>
                          }
                        </td>
                        <td className="p-4 text-xs text-gray-500">
                          <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/15 text-indigo-300 rounded-md text-[11px] font-bold uppercase tracking-wider">{post.categoryId}</span>
                        </td>
                        <td className="p-4 text-sm text-indigo-200/60 font-medium">{post.date}</td>
                        <td className="p-4 text-sm text-indigo-200/60 font-mono font-bold">{post.viewsCount || 0}</td>
                        <td className="p-4 text-sm text-indigo-200/60 font-mono font-bold">{post.likesCount || 0}</td>
                        <td className="p-4 text-sm text-right">
                          <div className="flex items-center justify-end gap-1">
                            {post.isDraft && (
                              <button onClick={() => publishDraft(post.id)} className="text-emerald-400 hover:text-white hover:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all duration-200 cursor-pointer">Publish</button>
                            )}
                            <button onClick={() => openEditModal(post)} className="text-indigo-400 hover:text-white hover:bg-indigo-500/10 p-2 rounded-lg cursor-pointer transition-all duration-200" title="Edit Article"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deletePost(post.id)} className="text-rose-400 hover:text-white hover:bg-rose-500/10 p-2 rounded-lg cursor-pointer transition-all duration-200" title="Delete Article"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {posts.length === 0 && (
                      <tr><td colSpan={7} className="p-12 text-center text-indigo-300/40 font-medium">No articles in your pipeline yet. Sync active records, or generate fresh assets in the AI Creator studio!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0e0d28] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-indigo-900/40 flex flex-col max-h-[90vh]">
                  <div className="flex items-center justify-between p-6 border-b border-indigo-950/40">
                    <h3 className="text-xl font-display font-extrabold text-white tracking-tight">{editingPostId ? 'Edit Article Asset' : 'Generate New Custom Article'}</h3>
                    <button onClick={closeCreateModal} className="text-gray-400 hover:text-white hover:bg-white/5 p-1.5 rounded-xl transition-all cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    <form id="create-post-form" onSubmit={handleCreatePost} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-indigo-300/70 uppercase tracking-wider mb-2">Title Profile</label>
                        <input type="text" required value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-indigo-950 bg-[#060610]/80 text-white placeholder-indigo-300/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-indigo-300/70 uppercase tracking-wider mb-2">Channel Category Destination</label>
                        <select value={newPost.categoryId} onChange={e => setNewPost({...newPost, categoryId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-indigo-950 bg-[#060610]/80 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none">
                          <option value="finance">Finance</option>
                          <option value="technology">Technology</option>
                          <option value="mmo">Make Money</option>
                          <option value="ai">AI</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-indigo-300/70 uppercase tracking-wider mb-2">Précis / Article Excerpt</label>
                        <textarea required rows={2} value={newPost.excerpt} onChange={e => setNewPost({...newPost, excerpt: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-indigo-950 bg-[#060610]/80 text-white placeholder-indigo-300/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition-all outline-none resize-none"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-indigo-300/70 uppercase tracking-wider mb-2">Core Article Body (Double return spacing for paragraphs)</label>
                        <textarea required rows={8} value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-indigo-950 bg-[#060610]/80 text-white placeholder-indigo-300/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition-all outline-none resize-none font-sans leading-relaxed"></textarea>
                      </div>
                    </form>
                  </div>
                  <div className="p-6 border-t border-indigo-950/40 flex justify-end gap-3 bg-[#0a091f]">
                    <button onClick={closeCreateModal} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">Cancel</button>
                    <button type="submit" form="create-post-form" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white tracking-wide transition-all shadow-lg hover:shadow-indigo-500/10 cursor-pointer">{editingPostId ? 'Save Edits' : 'Publish Asset'}</button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
