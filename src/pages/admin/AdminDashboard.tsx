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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row transition-colors">
      {/* Sidebar Menu */}
      <div className="w-full md:w-64 bg-gradient-to-b from-[#0a0a16] via-[#100f2e] to-[#0a0a16] border-r border-indigo-900/30 p-6 flex flex-col text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-64 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="flex items-center gap-3 mb-10 text-indigo-400 relative z-10">
          <LayoutDashboard className="w-6 h-6" />
          <span className="font-display font-bold text-xl text-white">Admin Hub</span>
        </div>
        
        <nav className="flex-1 space-y-2 relative z-10">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeTab === 'overview' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button onClick={() => setActiveTab('ai-writer')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeTab === 'ai-writer' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <MessageSquare className="w-4 h-4" /> AI Writer
          </button>
          <button onClick={() => setActiveTab('posts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeTab === 'posts' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <FileText className="w-4 h-4" /> Articles
          </button>
          
          <div className="pt-6 mt-6 border-t border-white/10 uppercase text-[10px] tracking-widest font-bold text-indigo-200/50 mb-2 px-2">
            Features
          </div>
          <button onClick={() => setActiveTab('posts')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-gray-400 hover:bg-white/5 hover:text-white`}>
             <span className="w-2 h-2 rounded-full bg-emerald-400" /> Finance
          </button>
          <button onClick={() => setActiveTab('posts')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-gray-400 hover:bg-white/5 hover:text-white`}>
             <span className="w-2 h-2 rounded-full bg-blue-400" /> Technology
          </button>
          <button onClick={() => setActiveTab('posts')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-gray-400 hover:bg-white/5 hover:text-white`}>
             <span className="w-2 h-2 rounded-full bg-purple-400" /> AI
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-rose-400 transition-colors cursor-pointer relative z-10">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white capitalize">{activeTab}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Welcome back, Peter. Here's what's happening.</p>
          </div>
        </header>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><FileText className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Articles</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{posts.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl"><MessageSquare className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Likes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLikes}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm w-full h-[400px]">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Traffic & Engagement Overview</h3>
              <ResponsiveContainer width="100%" height="80%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#E5E7EB' }}
                  />
                  <Line type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="likes" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="comments" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {activeTab === 'ai-writer' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm max-w-4xl">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">AI Content Generation</h3>
              {!generatedDraft ? (
                <form onSubmit={handleGenerateAI} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic</label>
                      <input type="text" required value={aiForm.topic} onChange={e => setAiForm({...aiForm, topic: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white" placeholder="e.g. Future of Generative AI" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Keyword</label>
                      <input type="text" required value={aiForm.keyword} onChange={e => setAiForm({...aiForm, keyword: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white" placeholder="generative ai trends 2026" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                      <select value={aiForm.categoryId} onChange={e => setAiForm({...aiForm, categoryId: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
                        <option value="ai">AI</option>
                        <option value="crypto">Crypto</option>
                        <option value="startups">Startups</option>
                        <option value="markets">Markets</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tone</label>
                      <input type="text" value={aiForm.tone} onChange={e => setAiForm({...aiForm, tone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Length / Style</label>
                      <input type="text" value={aiForm.length} onChange={e => setAiForm({...aiForm, length: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Selection Strategy</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${aiForm.imageType === 'stock' ? 'border-indigo-600 bg-indigo-500/5' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-900'}`}>
                          <input type="radio" name="imageType" value="stock" checked={aiForm.imageType === 'stock'} onChange={() => setAiForm({...aiForm, imageType: 'stock'})} className="text-indigo-600 focus:ring-indigo-500" />
                          <div>
                            <span className="block font-medium text-sm text-gray-900 dark:text-white">AI Search Stock Images</span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">Blazing fast (1-2s), real-time Unsplash query matches</span>
                          </div>
                        </label>
                        <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${aiForm.imageType === 'ai' ? 'border-indigo-600 bg-indigo-500/5' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-900'}`}>
                          <input type="radio" name="imageType" value="ai" checked={aiForm.imageType === 'ai'} onChange={() => setAiForm({...aiForm, imageType: 'ai'})} className="text-indigo-600 focus:ring-indigo-500" />
                          <div>
                            <span className="block font-medium text-sm text-gray-900 dark:text-white">Custom Imagen 4.0 Art</span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">Unique generative AI visual designs (parallel, ~8s)</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100 dark:border-gray-800">
                    {isGenerating && (
                      <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 animate-pulse flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-650 animate-ping"></div>
                        Generating premium draft, conducting SEO lookup, and securing {aiForm.imageType === 'stock' ? 'stock matching covers' : 'custom AI graphics'}...
                      </div>
                    )}
                    <button type="submit" disabled={isGenerating} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center gap-2 ml-auto cursor-pointer">
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
                <div className="space-y-6">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-sm text-indigo-900 dark:text-indigo-200 font-mono overflow-auto max-h-40 border border-indigo-100 dark:border-indigo-800">
                    <strong>Research Grounding Summary:</strong><br/>{generatedDraft.researchSummary}
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-3xl font-display font-bold mb-4 text-gray-900 dark:text-white">{generatedDraft.title}</h1>
                      
                      {generatedDraft.images && generatedDraft.images.length > 0 && (
                        <div className="mb-6 space-y-3">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Select Cover / Featured Image</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {generatedDraft.images.map((imgUrl: string, idx: number) => {
                              const isSelected = activeCoverIndex === idx;
                              return (
                                <div 
                                  key={idx} 
                                  onClick={() => setActiveCoverIndex(idx)}
                                  className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 group ${
                                    isSelected ? "border-indigo-600 scale-[1.02] shadow-md shadow-indigo-600/10" : "border-gray-200 dark:border-gray-800 hover:border-indigo-300 opacity-80 hover:opacity-100"
                                  }`}
                                >
                                  <img referrerPolicy="no-referrer" src={imgUrl} alt={`Cover option ${idx + 1}`} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                    <span className="text-[10px] text-white font-medium">Use layout #{idx + 1}</span>
                                  </div>
                                  {isSelected && (
                                    <div className="absolute top-2 left-2 bg-indigo-600 text-white rounded-lg p-1 text-[10px] uppercase font-bold tracking-wider px-2 shadow">Active Cover</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Content Preview</label>
                        <div className="prose dark:prose-invert max-w-none text-sm border p-6 rounded-2xl bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 h-96 overflow-y-auto" dangerouslySetInnerHTML={{ __html: generatedDraft.content }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                     <button onClick={() => setGeneratedDraft(null)} className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer text-sm font-medium">Discard</button>
                     <button onClick={() => saveAiDraft(false)} className="px-5 py-2.5 border border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors cursor-pointer text-sm font-medium">Save as Draft</button>
                     <button onClick={() => saveAiDraft(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors cursor-pointer text-sm font-medium">Publish Now</button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'posts' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-end">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Article
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Likes</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Comments</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {posts.map(post => (
                    <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <img src={post.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <span className="truncate max-w-[200px] block">{post.title}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm whitespace-nowrap">
                        {post.isDraft ? 
                          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs uppercase font-bold tracking-wider">Draft</span>
                        :
                          <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs uppercase font-bold tracking-wider">Published</span>
                        }
                      </td>
                      <td className="p-4 text-sm text-gray-500 dark:text-gray-400"><span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">{post.categoryId}</span></td>
                      <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{post.date}</td>
                      <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{post.viewsCount || 0}</td>
                      <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{post.likesCount || 0}</td>
                      <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{post.commentsCount || 0}</td>
                      <td className="p-4 text-sm text-right">
                        {post.isDraft && (
                          <button onClick={() => publishDraft(post.id)} className="text-indigo-600 hover:text-indigo-800 p-2 text-xs font-bold uppercase transition-colors">Publish</button>
                        )}
                        <button onClick={() => openEditModal(post)} className="text-indigo-600 hover:text-indigo-800 p-2 cursor-pointer transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deletePost(post.id)} className="text-rose-500 hover:text-rose-700 p-2 cursor-pointer transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center text-gray-500">No articles found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">{editingPostId ? 'Edit Article' : 'Create New Article'}</h3>
                    <button onClick={closeCreateModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1">
                    <form id="create-post-form" onSubmit={handleCreatePost} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input type="text" required value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category ID</label>
                        <select value={newPost.categoryId} onChange={e => setNewPost({...newPost, categoryId: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all">
                          <option value="ai">AI</option>
                          <option value="crypto">Crypto</option>
                          <option value="startups">Startups</option>
                          <option value="markets">Markets</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt</label>
                        <textarea required rows={2} value={newPost.excerpt} onChange={e => setNewPost({...newPost, excerpt: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all resize-none"></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content (Use double newlines for paragraphs)</label>
                        <textarea required rows={8} value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all resize-none"></textarea>
                      </div>
                    </form>
                  </div>
                  <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
                    <button onClick={closeCreateModal} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">Cancel</button>
                    <button type="submit" form="create-post-form" className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer">{editingPostId ? 'Save Changes' : 'Publish Article'}</button>
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
