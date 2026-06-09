import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Lock, LayoutDashboard, Users, MessageSquare, LogOut, FileText, Trash2, Plus, X } from 'lucide-react';
import { Post, CategoryId } from '../../types';

export function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'subscribers' | 'comments'>('overview');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // New Post Form State
  const [newPost, setNewPost] = useState({
    title: '', excerpt: '', content: '', categoryId: 'ai', authorName: 'Peter', authorRole: 'Editor', authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', imageUrl: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
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

      const subsSnap = await getDocs(collection(db, 'subscribers'));
      const subsData = subsSnap.docs.map(doc => doc.data());
      setSubscribers(subsData);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error('Login failed', e);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const deletePost = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      await deleteDoc(doc(db, 'articles', id));
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
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
      alert('Failed to create post. Check console.');
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
  
  // Fake chart data based on subscribers over time (mocked for visual)
  const chartData = [
    { name: 'Mon', views: 400, likes: 240 },
    { name: 'Tue', views: 300, likes: 139 },
    { name: 'Wed', views: 200, likes: 980 },
    { name: 'Thu', views: 278, likes: 390 },
    { name: 'Fri', views: 189, likes: 480 },
    { name: 'Sat', views: 239, likes: 380 },
    { name: 'Sun', views: 349, likes: 430 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row transition-colors">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10 text-indigo-600 dark:text-indigo-400">
          <LayoutDashboard className="w-6 h-6" />
          <span className="font-display font-bold text-xl text-gray-900 dark:text-white">Admin</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeTab === 'overview' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button onClick={() => setActiveTab('posts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeTab === 'posts' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <FileText className="w-4 h-4" /> Articles
          </button>
          <button onClick={() => setActiveTab('subscribers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeTab === 'subscribers' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <Users className="w-4 h-4" /> Subscribers
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-rose-500 transition-colors cursor-pointer">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl"><Users className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Subscribers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{subscribers.length}</p>
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
                </LineChart>
              </ResponsiveContainer>
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
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Likes</th>
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
                      <td className="p-4 text-sm text-gray-500 dark:text-gray-400"><span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">{post.categoryId}</span></td>
                      <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{post.date}</td>
                      <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{post.likesCount}</td>
                      <td className="p-4 text-sm text-right">
                        <button onClick={() => deletePost(post.id)} className="text-rose-500 hover:text-rose-700 p-2 cursor-pointer transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No articles found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Create New Article</h3>
                    <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer">
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
                    <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">Cancel</button>
                    <button type="submit" form="create-post-form" className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer">Publish Article</button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'subscribers' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
             <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {subscribers.map((sub, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{sub.email}</td>
                    <td className="p-4 text-sm"><span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded text-xs uppercase tracking-wider font-bold">Active</span></td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {subscribers.length === 0 && (
                  <tr><td colSpan={3} className="p-8 text-center text-gray-500">No subscribers yet.</td></tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
}
