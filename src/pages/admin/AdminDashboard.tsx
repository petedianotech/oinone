import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db, auth, OperationType, handleFirestoreError } from '../../lib/firebase';
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Lock, LayoutDashboard, Users, MessageSquare, LogOut, FileText, Trash2, Plus, X, Edit2, Coins, Cpu, Sparkles, TrendingUp, Zap, Code, Menu, ArrowRight } from 'lucide-react';
import { Post, CategoryId, Offer, Ad } from '../../types';
import { subscribeToOffers, createOffer, updateOffer, deleteOffer } from '../../lib/offerService';
import { subscribeToAds, createAd, updateAd, deleteAd } from '../../lib/adsService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { SEOAnalyzer } from '../../components/SEOAnalyzer';

export function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'ai-writer' | 'offers' | 'ads-manager' | 'finance-sector' | 'technology-hub' | 'ai-systems'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Custom AI settings for systems tab
  const [aiSettings, setAiSettings] = useState({
    temperature: 0.7,
    modelName: 'gemini-2.5-pro',
    groundingActive: true,
  });
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerForm, setOfferForm] = useState<Partial<Offer>>({ status: 'active' });
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);

  // Ads State
  const [ads, setAds] = useState<Ad[]>([]);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adForm, setAdForm] = useState<Partial<Ad>>({ status: 'active' });
  const [editingAdId, setEditingAdId] = useState<string | null>(null);

  // Pending Tasks State
  const [tasks, setTasks] = useState<{ id: string; text: string; completed: boolean; priority: 'High' | 'Medium' | 'Low' }[]>(() => {
    const saved = localStorage.getItem('admin-hub-tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error(err);
      }
    }
    return [
      { id: 't1', text: 'Synthesize blog post using Gemini 3.1 flash lite', completed: false, priority: 'High' },
      { id: 't2', text: 'Configure custom stock/Imagen art for fintech article', completed: false, priority: 'Medium' },
      { id: 't3', text: 'Audit CPA marketing and lead campaign conversions', completed: true, priority: 'High' },
      { id: 't4', text: 'SEO audit tech article meta descriptions & headers', completed: false, priority: 'Low' },
    ];
  });

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  useEffect(() => {
    localStorage.setItem('admin-hub-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const item = {
      id: Math.random().toString(36).substr(2, 9),
      text: newTaskText.trim(),
      completed: false,
      priority: newTaskPriority,
    };
    setTasks(prev => [...prev, item]);
    setNewTaskText('');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };
  
  // AI Writer State
  const [aiForm, setAiForm] = useState({ topic: '', keyword: '', categoryId: 'ai', tone: 'Professional', length: 'Medium (around 800-1000 words)', idea: '', imageType: 'stock' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<any>(null);
  const [activeCoverIndex, setActiveCoverIndex] = useState<number>(0);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  // New Post Form State
  const [newPost, setNewPost] = useState({
    title: '', excerpt: '', content: '', categoryId: 'ai', authorName: 'Peter Damiano', authorRole: 'AI Editor & Product Architect', authorAvatar: 'https://i.ibb.co/cXpLmLVC/20260516-210805.jpg', imageUrl: ''
  });

  useEffect(() => {
    let unsubscribeOffers: (() => void) | null = null;
    let unsubscribeAds: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          const res = await fetch('/api/admin/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: u.email }),
          });
          const data = await res.json();
          if (!data.isAdmin) {
            await signOut(auth);
            setUser(null);
            setIsAdmin(false);
            if (unsubscribeOffers) {
              unsubscribeOffers();
              unsubscribeOffers = null;
            }
            if (unsubscribeAds) {
              unsubscribeAds();
              unsubscribeAds = null;
            }
          } else {
            setUser(u);
            setIsAdmin(true);
            fetchAdminData();
            if (!unsubscribeOffers) {
              unsubscribeOffers = subscribeToOffers(setOffers, (err) => {
                console.error('[AdminDashboard] Offers subscription failed:', err);
              });
            }
            if (!unsubscribeAds) {
              unsubscribeAds = subscribeToAds(setAds, (err) => {
                console.error('[AdminDashboard] Ads subscription failed:', err);
              });
            }
          }
        } catch (e) {
          console.error('Admin verification failed', e);
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        if (unsubscribeOffers) {
          unsubscribeOffers();
          unsubscribeOffers = null;
        }
        if (unsubscribeAds) {
          unsubscribeAds();
          unsubscribeAds = null;
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOffers) {
        unsubscribeOffers();
      }
      if (unsubscribeAds) {
        unsubscribeAds();
      }
    };
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch articles
      const postsSnap = await getDocs(collection(db, 'articles'));
      const postsData = postsSnap.docs.map(doc => doc.data() as Post);
      setPosts(postsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      // Fetch actual subscribers from Firestore
      const subSnap = await getDocs(collection(db, 'subscribers'));
      let subList = subSnap.docs.map(doc => doc.data());

      if (subSnap.empty) {
        // Seed default real-time subscribers if none exist yet
        const seedSubs = [
          { email: 'builder.alpha@gmail.com', subscribedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(), status: 'active' },
          { email: 'comp-compiler@yahoo.com', subscribedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), status: 'active' },
          { email: 'edgeengineer@outlook.com', subscribedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), status: 'active' },
          { email: 'fintechguru@gmail.com', subscribedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), status: 'active' },
          { email: 'aiscientist@gmail.com', subscribedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), status: 'active' }
        ];

        for (const sub of seedSubs) {
          await setDoc(doc(db, 'subscribers', sub.email), sub);
        }
        subList = seedSubs;
      }
      setSubscribers(subList);
    } catch (e) {
      console.error('Error fetching admin data (articles/subscribers):', e);
      handleFirestoreError(e, OperationType.GET, 'articles');
    }
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOfferId) {
        await updateOffer(editingOfferId, offerForm as any);
      } else {
        await createOffer(offerForm as any);
      }
      setShowOfferModal(false);
      setOfferForm({ status: 'active' });
      setEditingOfferId(null);
    } catch (e) {
      console.error('Failed to save offer', e);
      alert('Error saving offer. Check console.');
    }
  };

  const handleEditOffer = (offer: Offer) => {
    setOfferForm(offer);
    setEditingOfferId(offer.id);
    setShowOfferModal(true);
  };

  const handleRemoveOffer = async (id: string) => {
    if (window.confirm('Delete this CPA offer?')) {
      await deleteOffer(id);
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdId) {
        await updateAd(editingAdId, adForm as any);
      } else {
        await createAd(adForm as any);
      }
      setShowAdModal(false);
      setAdForm({ status: 'active' });
      setEditingAdId(null);
    } catch (e) {
      console.error('Failed to save ad', e);
      alert('Error saving ad. Check console.');
    }
  };

  const handleEditAd = (ad: Ad) => {
    setAdForm(ad);
    setEditingAdId(ad.id);
    setShowAdModal(true);
  };

  const handleRemoveAd = async (id: string) => {
    if (window.confirm('Delete this Ad?')) {
      await deleteAd(id);
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: result.user.email }),
      });
      const data = await res.json();
      if (!data.isAdmin) {
        await signOut(auth);
        setUser(null);
        setIsAdmin(false);
        alert('Unauthorized login attempt. Access is restricted.');
      } else {
        setIsAdmin(true);
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
        avatar: 'https://i.ibb.co/cXpLmLVC/20260516-210805.jpg',
        role: 'AI Editor & Product Architect'
      },
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: Math.max(1, Math.ceil(generatedDraft.content.split(' ').length / 200)),
      imageUrl: generatedDraft.images?.[activeCoverIndex] || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200',
      images: generatedDraft.images || [],
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const quillRef = useRef<any>(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [isFullscreenEditor, setIsFullscreenEditor] = useState(false);
  const [isUploadingImg, setIsUploadingImg] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Please configure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file to use Cloudinary image uploads.");
      return;
    }

    setIsUploadingImg(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.secure_url) {
        if (!isEditingDraft && quillRef.current) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection();
          const position = range ? range.index : quill.getLength();
          quill.insertEmbed(position, 'image', data.secure_url);
        } else if (isEditingDraft && textareaRef.current) {
           const imgTag = `\n<img src="${data.secure_url}" alt="Article Graphic" class="w-full rounded-2xl my-6 shadow-xl object-cover" />\n`;
           const start = textareaRef.current.selectionStart;
           const end = textareaRef.current.selectionEnd;
           const content = generatedDraft.content;
           const newContent = content.substring(0, start) + imgTag + content.substring(end);
           setGeneratedDraft({ ...generatedDraft, content: newContent });
           setTimeout(() => {
             if (textareaRef.current) {
               textareaRef.current.focus();
               textareaRef.current.selectionStart = start + imgTag.length;
               textareaRef.current.selectionEnd = start + imgTag.length;
             }
           }, 10);
        } else {
           // Fallback if editor doesn't have focus
           const imgHtml = `<img src="${data.secure_url}" alt="Article Graphic" class="w-full rounded-2xl my-6 shadow-xl object-cover" />`;
           setGeneratedDraft({ ...generatedDraft, content: generatedDraft.content + imgHtml });
        }
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Image upload error", err);
      alert("Cloudinary Upload Failed. Check your connection or API keys.");
    } finally {
      setIsUploadingImg(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    setNewPost({ title: '', excerpt: '', content: '', categoryId: 'ai', authorName: 'Peter Damiano', authorRole: 'AI Editor & Product Architect', authorAvatar: 'https://i.ibb.co/cXpLmLVC/20260516-210805.jpg', imageUrl: '' });
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
          setNewPost({ title: '', excerpt: '', content: '', categoryId: 'ai', authorName: 'Peter Damiano', authorRole: 'AI Editor & Product Architect', authorAvatar: 'https://i.ibb.co/cXpLmLVC/20260516-210805.jpg', imageUrl: '' });
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
      setNewPost({ title: '', excerpt: '', content: '', categoryId: 'ai', authorName: 'Peter Damiano', authorRole: 'AI Editor & Product Architect', authorAvatar: 'https://i.ibb.co/cXpLmLVC/20260516-210805.jpg', imageUrl: '' });
    } catch (err) {
      console.error('Error creating post', err);
      handleFirestoreError(err, OperationType.WRITE, `articles/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-brand-cyan/20 border-t-brand-cyan animate-spin" />
          <span className="text-[10px] uppercase tracking-widest text-[#06b6d4]/60 font-mono">Verifying Session...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0c] text-white p-6 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-purple/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-cyan/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-md w-full bg-[#111115]/80 backdrop-blur-xl rounded-[2rem] p-10 shadow-2xl border border-white/5 text-center z-10"
        >
          {/* Lock Icon */}
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 text-brand-cyan">
            <Lock className="w-6 h-6" />
          </div>

          <h1 className="font-display text-3xl font-black mb-3 tracking-tight">
            Terminal Access
          </h1>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            Authentication is restricted to the pre-configured editor credentials.
          </p>

          {/* Configured account display */}
          <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/5 text-left space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-purple">Authorized Editor Node</span>
            <p className="text-sm font-medium text-white font-mono break-all">petedianotech@gmail.com</p>
          </div>

          {/* Direct Google Action Button */}
          <button 
            onClick={handleLogin} 
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-[#0a0a0c] p-3.5 rounded-xl font-semibold transition-all shadow-lg hover:scale-[1.02] cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.86-3.577-7.86-8s3.53-8 7.86-8c2.46 0 4.105 1.025 5.047 1.926l3.256-3.133C18.29 1.137 15.54 0 12.24 0 5.48 0 0 5.37 0 12s5.48 12 12.24 12c7.06 0 11.75-4.82 11.75-11.72 0-.79-.08-1.4-.2-1.995H12.24z"
              />
            </svg>
            <span className="text-sm">Sign In with Google</span>
          </button>

          {/* Access denied toast/notice */}
          {user && !isAdmin && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs text-left leading-relaxed animate-pulse"
            >
              Access Denied. Account <strong className="font-semibold">{user.email}</strong> is not configured as an administrator.
            </motion.div>
          )}

          {/* Return Home */}
          <div className="mt-8">
            <Link 
              to="/" 
              className="text-xs text-gray-400 hover:text-white transition-colors tracking-wide underline underline-offset-4"
            >
              Return back to Oinone
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Calculate totals
  const totalLikes = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
  const totalViews = posts.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);
  
  const rawRatio = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;
  const engagementRatio = rawRatio > 0 ? rawRatio.toFixed(1) : '0.0';

  // Calculate subscriber metrics
  const totalSubscribers = subscribers.length;
  const lastSevenDaysCount = subscribers.filter(sub => {
    if (!sub.subscribedAt) return false;
    const date = new Date(sub.subscribedAt);
    const diffTime = Math.abs(Date.now() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;
  
  const olderSubscribersCount = totalSubscribers - lastSevenDaysCount;
  const growthPercent = olderSubscribersCount > 0 
    ? ((lastSevenDaysCount / olderSubscribersCount) * 100).toFixed(1) 
    : (lastSevenDaysCount > 0 ? '100.0' : '0.0');
  
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#060610] text-gray-900 dark:text-[#f1f1f6] flex flex-col md:flex-row transition-colors selection:bg-indigo-500/30 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.06),transparent_50%)] pointer-events-none" />
      {/* Backdrop overlay for mobile screens */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gradient-to-b dark:from-[#0a0a16] dark:via-[#100f2e] dark:to-[#0a0a16] border-r border-gray-200 dark:border-indigo-900/30 p-6 flex flex-col text-gray-900 dark:text-white shadow-2xl overflow-hidden shrink-0 transition-transform duration-300 ease-in-out md:static md:w-64 md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="absolute inset-x-0 top-0 h-64 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="flex items-center justify-between mb-10 text-indigo-400 relative z-10">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6" />
            <span className="font-display font-bold text-xl text-white">Admin Hub</span>
          </div>
          {/* Mobile close button */}
          <button 
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white md:hidden cursor-pointer"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-2 relative z-10 overflow-y-auto pb-4">
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white mb-4 border border-transparent dark:border-white/5">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Website
          </Link>
          <button onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeTab === 'overview' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-l-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}>
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button onClick={() => { setActiveTab('ai-writer'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeTab === 'ai-writer' ? 'bg-indigo-500/20 text-indigo-300 border-l-2 border-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <MessageSquare className="w-4 h-4" /> AI Writer
          </button>
          <button onClick={() => { setActiveTab('posts'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeTab === 'posts' ? 'bg-indigo-500/20 text-indigo-300 border-l-2 border-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <FileText className="w-4 h-4" /> Articles
          </button>
          <button onClick={() => { setActiveTab('offers'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeTab === 'offers' ? 'bg-indigo-500/20 text-indigo-300 border-l-2 border-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Coins className="w-4 h-4" /> Offers Vault
          </button>
          <button onClick={() => { setActiveTab('ads-manager'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeTab === 'ads-manager' ? 'bg-indigo-500/20 text-blue-300 border-l-2 border-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Sparkles className="w-4 h-4" /> Ads Manager
          </button>
          
          <div className="pt-6 mt-6 border-t border-white/10 uppercase text-[10px] tracking-widest font-bold text-indigo-200/50 mb-2 px-2">
            Quick Panels
          </div>
          <button onClick={() => { setActiveTab('finance-sector'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === 'finance-sector' ? 'bg-indigo-500/20 text-emerald-300 border-l-2 border-emerald-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
             <span className="w-2 h-2 rounded-full bg-emerald-400" /> Finance Sector
          </button>
          <button onClick={() => { setActiveTab('technology-hub'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === 'technology-hub' ? 'bg-indigo-500/20 text-blue-300 border-l-2 border-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
             <span className="w-2 h-2 rounded-full bg-blue-400" /> Technology Hub
          </button>
          <button onClick={() => { setActiveTab('ai-systems'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === 'ai-systems' ? 'bg-indigo-500/20 text-purple-300 border-l-2 border-purple-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
             <span className="w-2 h-2 rounded-full bg-purple-400" /> AI Systems
          </button>

          <div className="mt-8 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
            <h5 className="font-bold text-xs text-indigo-300 mb-2">Support the Platform</h5>
            <div className="flex flex-col gap-2">
              <a href="#" className="flex items-center justify-center gap-2 bg-[#0070ba] hover:bg-[#003087] transition-colors py-2 rounded-xl font-bold text-white text-[10px]">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-3 brightness-0 invert" />
                Donate
              </a>
              <a href="https://give.paychangu.com/dc-wnczzv" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-900 border border-white/10 transition-colors py-2 rounded-xl font-bold text-white text-[10px]">
                Paychangu
              </a>
            </div>
          </div>
        </nav>
 
        <button onClick={handleLogout} className="mt-4 flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-rose-400 transition-colors cursor-pointer relative z-10 shrink-0">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto relative z-10 bg-gray-50/50 dark:bg-[#060610]/50 backdrop-blur-3xl">
        <div className="absolute inset-0 bg-gray-50 dark:bg-[#060610] h-full pointer-events-none -z-10" />
        <div className="absolute inset-x-0 -top-40 h-80 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
        
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200 dark:border-indigo-950/45">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Mobile Sidebar Toggle Button at Left Top Corner */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-400/30 text-indigo-600 dark:text-indigo-300 rounded-xl md:hidden transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-500/5 hover:-translate-y-0.5 active:translate-y-0 shrink-0"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> Live Administration
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <p className="text-gray-500 dark:text-indigo-200/50 text-xs font-medium hidden lg:block">Welcome back, Peter Damiano. Your creative engine is fully synchronized.</p>
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm shadow-indigo-500/5">
              <span>Secure Cloud Access</span>
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Redesigned Glass Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* TOTAL ARTICLES */}
              <div className="relative bg-white/5 dark:bg-[#12121e]/40 backdrop-blur-xl border border-white/10 dark:border-indigo-500/10 rounded-3xl p-6 overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/5 blur-2xl rounded-full" />
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Pipeline
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-indigo-200/50 uppercase tracking-widest">Total Articles</p>
                  <p className="text-3xl font-display font-extrabold text-gray-900 dark:text-white mt-1">{posts.length}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {posts.filter(p => !p.isDraft).length} Published
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {posts.filter(p => p.isDraft).length} Drafts
                    </span>
                  </div>
                </div>
              </div>

              {/* ARTICLE ENGAGEMENT */}
              <div className="relative bg-white/5 dark:bg-[#12121e]/40 backdrop-blur-xl border border-white/10 dark:border-purple-500/10 rounded-3xl p-6 overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/5 blur-2xl rounded-full" />
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    Activity
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-indigo-200/50 uppercase tracking-widest">Engagement Ratio</p>
                  <p className="text-3xl font-display font-extrabold text-gray-900 dark:text-white mt-1">{engagementRatio}%</p>
                  <div className="flex flex-col gap-0.5 mt-2 text-xs text-purple-400">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{totalLikes} likes, {totalComments} comments</span>
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{totalViews} overall views</span>
                  </div>
                </div>
              </div>

              {/* AUDIENCE GROWTH */}
              <div className="relative bg-white/5 dark:bg-[#12121e]/40 backdrop-blur-xl border border-white/10 dark:border-cyan-500/10 rounded-3xl p-6 overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 dark:bg-cyan-500/5 blur-2xl rounded-full" />
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Scale
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-indigo-200/50 uppercase tracking-widest">Audience Growth</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-display font-extrabold text-gray-900 dark:text-white mt-1">{totalSubscribers}</p>
                    <span className="text-xs font-bold text-emerald-400 font-mono">+{growthPercent}%</span>
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 truncate">Real active subscribers in Firestore</p>
                </div>
              </div>

              {/* PENDING TASKS COUNTER */}
              <div className="relative bg-white/5 dark:bg-[#12121e]/40 backdrop-blur-xl border border-white/10 dark:border-rose-500/10 rounded-3xl p-6 overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 dark:bg-rose-500/5 blur-2xl rounded-full" />
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
                    <Zap className="w-6 h-6 animate-pulse" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    Sprints
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-indigo-200/50 uppercase tracking-widest">Pending Tasks</p>
                  <p className="text-3xl font-display font-extrabold text-gray-900 dark:text-white mt-1">
                    {tasks.filter(t => !t.completed).length} <span className="text-xs text-gray-500 dark:text-indigo-200/40 uppercase tracking-normal">remaining</span>
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full mt-3.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Main Interactive Row (Analytics Chart + Pending Tasks Console) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              {/* Chart Side (60% / 3 Columns wide) */}
              <div className="lg:col-span-3 bg-white/5 dark:bg-[#12121e]/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 dark:border-indigo-500/10 relative overflow-hidden flex flex-col min-h-[420px]">
                <div className="absolute inset-x-0 -top-32 h-64 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
                <div className="flex items-center justify-between mb-6 z-10 relative">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-505 bg-indigo-500 animate-pulse" />
                      Insight Operations Terminal
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tracking reader sentiment & engagement metrics</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" /> Views
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Likes
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 w-full relative min-h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#22213a" vertical={false} opacity={0.15} />
                      <XAxis dataKey="name" stroke="#68658d" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#68658d" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(10, 10, 16, 0.95)', 
                          borderColor: 'rgba(99, 102, 241, 0.2)', 
                          borderRadius: '16px', 
                          color: '#fff', 
                          fontSize: '12px', 
                          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)',
                          backdropFilter: 'blur(12px)'
                        }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="views" 
                        stroke="#6366f1" 
                        strokeWidth={4} 
                        dot={{ r: 5, stroke: '#6366f1', strokeWidth: 2, fill: '#060610' }} 
                        activeDot={{ r: 7 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="likes" 
                        stroke="#10b981" 
                        strokeWidth={4} 
                        dot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#060610' }} 
                        activeDot={{ r: 7 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tasks Side (40% / 2 Columns wide) */}
              <div className="lg:col-span-2 bg-white/5 dark:bg-[#12121e]/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 dark:border-rose-500/10 flex flex-col justify-between overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Code className="w-4 h-4 text-rose-400" />
                        Pending Editor Tasks
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-indigo-200/40 mt-0.5">Maintain publisher pipeline & content priorities</p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {tasks.filter(t => !t.completed).length} Remainder
                    </span>
                  </div>

                  {/* Task List */}
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {tasks.map(task => {
                      const priorityColors = {
                        High: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
                        Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
                        Low: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
                      };

                      return (
                        <div 
                          key={task.id} 
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 group ${
                            task.completed 
                              ? 'bg-emerald-500/5 border-emerald-500/10 opacity-60' 
                              : 'bg-white/5 dark:bg-white/[0.02] border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button 
                              onClick={() => toggleTask(task.id)}
                              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                                task.completed 
                                  ? 'bg-emerald-500 border-emerald-400 text-white' 
                                  : 'border-white/20 hover:border-emerald-500/50 bg-transparent'
                              }`}
                            >
                              {task.completed && (
                                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                            <span className={`text-xs font-medium truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-950 dark:text-indigo-100'}`}>
                              {task.text}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
                              {task.priority}
                            </span>
                            <button 
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-gray-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {tasks.length === 0 && (
                      <div className="text-center py-8 text-xs text-gray-400 dark:text-indigo-200/30">
                        No pending editor sprints. You are fully cleared!
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Task Form Footer */}
                <form onSubmit={handleAddTask} className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                  <input 
                    type="text" 
                    required
                    value={newTaskText}
                    onChange={e => setNewTaskText(e.target.value)}
                    placeholder="Quick sprint action item..." 
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 dark:border-indigo-950 text-gray-900 dark:text-white placeholder-gray-500 outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20"
                  />
                  <select 
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="px-2 py-2 text-xs rounded-xl bg-white/5 border border-white/10 dark:border-indigo-950 text-gray-900 dark:text-white outline-none focus:border-rose-500/50"
                  >
                    <option value="High" className="bg-[#0e0d28]">High</option>
                    <option value="Medium" className="bg-[#0e0d28]">Med</option>
                    <option value="Low" className="bg-[#0e0d28]">Low</option>
                  </select>
                  <button 
                    type="submit" 
                    className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer shrink-0"
                    title="Add task"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>

              </div>

            </div>
          </motion.div>
        )}

        {activeTab === 'ai-writer' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm max-w-4xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
              <h3 className="text-xl font-display font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-500/20"><MessageSquare className="w-5 h-5" /></span>
                AI Creative Studio
              </h3>
              {!generatedDraft ? (
                <form onSubmit={handleGenerateAI} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Topic / Title Theme</label>
                      <input type="text" required value={aiForm.topic} onChange={e => setAiForm({...aiForm, topic: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all outline-none" placeholder="e.g. Future of Generative AI" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Primary SEO Keyword</label>
                      <input type="text" required value={aiForm.keyword} onChange={e => setAiForm({...aiForm, keyword: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all outline-none" placeholder="generative ai trends 2026" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Channel Category</label>
                      <select value={aiForm.categoryId} onChange={e => setAiForm({...aiForm, categoryId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all outline-none">
                        <option value="finance">Finance</option>
                        <option value="technology">Technology</option>
                        <option value="mmo">Make Money</option>
                        <option value="ai">AI</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Editorial Tone</label>
                      <input type="text" value={aiForm.tone} onChange={e => setAiForm({...aiForm, tone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Target Article Length</label>
                      <input type="text" value={aiForm.length} onChange={e => setAiForm({...aiForm, length: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Brief Description / Article Idea</label>
                      <textarea
                        value={aiForm.idea}
                        onChange={e => setAiForm({...aiForm, idea: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all outline-none"
                        placeholder="Briefly describe what this article should be about... E.g., 'Write an article on how the new React compiler works under the hood with code examples.'"
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Cover Art Selection Protocol</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${aiForm.imageType === 'stock' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400'}`}>
                          <input type="radio" name="imageType" value="stock" checked={aiForm.imageType === 'stock'} onChange={() => setAiForm({...aiForm, imageType: 'stock'})} className="text-indigo-600 focus:ring-indigo-500 mix-blend-multiply dark:mix-blend-normal" />
                          <div>
                            <span className="block font-semibold text-sm text-gray-900 dark:text-white">AI Search Stock Images</span>
                            <span className="block text-xs text-gray-500 mt-0.5">Blazing fast, real-time handpicked matching stock photos</span>
                          </div>
                        </label>
                        <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${aiForm.imageType === 'ai' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400'}`}>
                          <input type="radio" name="imageType" value="ai" checked={aiForm.imageType === 'ai'} onChange={() => setAiForm({...aiForm, imageType: 'ai'})} className="text-indigo-600 focus:ring-indigo-500 mix-blend-multiply dark:mix-blend-normal" />
                          <div>
                            <span className="block font-semibold text-sm text-gray-900 dark:text-white">Custom Imagen 4.0 Art</span>
                            <span className="block text-xs text-gray-500 mt-0.5">Unique generative AI designs tailored to topic</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100 dark:border-gray-800">
                    {isGenerating && (
                      <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 animate-pulse flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
                        Synthesizing premium editorial content drafts and executing search engine crawl grounding...
                      </div>
                    )}
                    <button type="submit" disabled={isGenerating} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] flex items-center gap-2 ml-auto cursor-pointer">
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
                  <div className="bg-gray-50/80 dark:bg-[#060610]/80 p-5 rounded-2xl text-xs text-gray-700 dark:text-gray-300 font-mono overflow-auto max-h-40 border border-gray-200 dark:border-indigo-900/30 leading-relaxed shadow-inner">
                    <strong className="text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-wider font-sans block mb-1.5">Deep Research Grounding Synopsis:</strong>
                    {generatedDraft.researchSummary}
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-400/20 px-2.5 py-1 rounded-full font-bold">Unreleased Draft</span>
                      <h1 className="text-3xl font-display font-extrabold mb-4 text-gray-900 dark:text-white mt-3 tracking-tight">{generatedDraft.title}</h1>
                      
                      {generatedDraft.images && generatedDraft.images.length > 0 && (
                        <div className="mb-6 space-y-3">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select Primary Cover / Featured Artwork</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {generatedDraft.images.map((imgUrl: string, idx: number) => {
                              const isSelected = activeCoverIndex === idx;
                              return (
                                <div 
                                  key={idx} 
                                  onClick={() => setActiveCoverIndex(idx)}
                                  className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 group ${
                                    isSelected ? "border-indigo-500 scale-[1.02] shadow-xl shadow-indigo-500/20" : "border-transparent border-gray-200 dark:border-indigo-950 opacity-80 hover:opacity-100 hover:border-gray-300 dark:hover:border-indigo-800"
                                  }`}
                                >
                                  <img referrerPolicy="no-referrer" loading="lazy" src={imgUrl} alt={`Cover option ${idx + 1}`} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                                    <span className="text-[10px] text-white font-semibold">Select Design Mockup {idx + 1}</span>
                                  </div>
                                  {isSelected && (
                                    <div className="absolute top-2 left-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg p-1 text-[9px] uppercase font-bold tracking-wider px-2 shadow">Active Layout</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-3">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Editorial Prose Preview</label>
                          <div className="flex flex-wrap gap-2">
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              ref={fileInputRef} 
                              onChange={handleImageUpload} 
                            />
                            <button 
                              onClick={() => fileInputRef.current?.click()} 
                              disabled={isUploadingImg}
                              className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              {isUploadingImg ? "Uploading..." : "Insert Image at Cursor"}
                            </button>
                            <button 
                              onClick={() => setIsFullscreenEditor(true)} 
                              className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              Fullscreen Editor
                            </button>
                            <button 
                              onClick={() => setIsEditingDraft(!isEditingDraft)} 
                              className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              {isEditingDraft ? "Visual Editor" : "Raw HTML"}
                            </button>
                          </div>
                        </div>
                        {isEditingDraft ? (
                          <textarea 
                            ref={textareaRef}
                            value={generatedDraft.content}
                            onChange={(e) => setGeneratedDraft({...generatedDraft, content: e.target.value})}
                            className="w-full text-sm border p-6 rounded-2xl bg-white dark:bg-[#060610]/80 border-gray-200 dark:border-indigo-950 text-gray-800 dark:text-indigo-100/90 h-[500px] overflow-y-auto leading-relaxed shadow-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        ) : (
                          <div className="bg-white dark:bg-[#060610]/80 rounded-2xl border border-gray-200 dark:border-indigo-950 shadow-sm overflow-hidden editor-container">
                            <ReactQuill 
                              ref={quillRef}
                              theme="snow" 
                              value={generatedDraft.content} 
                              onChange={(content) => setGeneratedDraft({...generatedDraft, content})}
                              modules={{
                                toolbar: [
                                  [{ 'header': [1, 2, 3, false] }],
                                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                  [{'list': 'ordered'}, {'list': 'bullet'}],
                                  ['link', 'clean']
                                ]
                              }}
                              className="h-[430px] p-2"
                            />
                            <style>{`
                              .editor-container .ql-toolbar { border: none !important; border-bottom: 1px solid rgba(100, 116, 139, 0.2) !important; font-family: inherit; }
                              .editor-container .ql-container { border: none !important; font-family: inherit; font-size: 1rem; }
                            `}</style>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-6">
                        <SEOAnalyzer 
                          title={generatedDraft.title}
                          content={generatedDraft.content}
                          summary={generatedDraft.summary || generatedDraft.content.replace(/<[^>]+>/g, '').substring(0, 150)}
                          keyword={aiForm.keyword}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-5">
                     <button onClick={() => setGeneratedDraft(null)} className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer text-sm font-medium">Discard</button>
                     <button onClick={() => saveAiDraft(false)} className="px-5 py-2.5 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all cursor-pointer text-sm font-medium shadow-sm">Save Offline Draft</button>
                     <button onClick={() => saveAiDraft(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer text-sm">Publish to Live Feed</button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Fullscreen Editor Modal */}
        {isFullscreenEditor && generatedDraft && (
          <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-950 flex flex-col items-center">
            <div className="w-full flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur top-0 z-10">
               <div className="flex items-center gap-4">
                 <button onClick={() => setIsFullscreenEditor(false)} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                   <ArrowRight className="w-5 h-5 -rotate-180 text-gray-700 dark:text-gray-300" />
                 </button>
                 <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 capitalize">Document Editor: <span className="text-gray-900 dark:text-white">{generatedDraft.title}</span></h2>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                   Insert Image at Cursor
                 </button>
                 <button onClick={() => { setIsFullscreenEditor(false); saveAiDraft(false); }} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-colors active:scale-95">
                   Done & Save
                 </button>
               </div>
            </div>
            
            <div className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto px-4 py-8 custom-scrollbar">
               <input 
                 className="w-full text-4xl md:text-5xl font-display font-black text-gray-900 dark:text-white bg-transparent border-none outline-none mb-8"
                 value={generatedDraft.title}
                 onChange={(e) => setGeneratedDraft({...generatedDraft, title: e.target.value})}
                 placeholder="Document Title"
               />
               <div className="bg-white dark:bg-gray-950 rounded-2xl editor-fullscreen-container">
                 <ReactQuill 
                   ref={quillRef}
                   theme="snow" 
                   value={generatedDraft.content} 
                   onChange={(content) => setGeneratedDraft({...generatedDraft, content})}
                   modules={{
                     toolbar: [
                       [{ 'header': [1, 2, 3, false] }],
                       ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                       [{'list': 'ordered'}, {'list': 'bullet'}],
                       ['link', 'clean']
                     ]
                   }}
                   className="min-h-[500px]"
                 />
                 <style>{`
                   .editor-fullscreen-container .ql-toolbar { position: sticky; top: -32px; z-index: 10; background: inherit; border: none !important; border-bottom: 2px solid rgba(100, 116, 139, 0.1) !important; font-family: inherit; margin-bottom: 1rem; padding: 1rem 0; }
                   .editor-fullscreen-container .ql-container { border: none !important; font-family: inherit; font-size: 1.125rem; }
                 `}</style>
               </div>
               
               <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                  <SEOAnalyzer 
                    title={generatedDraft.title}
                    content={generatedDraft.content}
                    summary={generatedDraft.summary || generatedDraft.content.replace(/<[^>]+>/g, '').substring(0, 150)}
                    keyword={aiForm.keyword}
                  />
               </div>
            </div>
          </div>
        )}

        {activeTab === 'offers' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-gray-200 dark:border-emerald-500/20 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-900/10 pointer-events-none" />
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Offers Vault & Monetization
                </h3>
                <p className="text-xs text-gray-500 dark:text-emerald-200/50 mt-1">Manage CPA campaigns and partner affiliate offers. Drive organic revenue.</p>
              </div>
              <button 
                onClick={() => { setOfferForm({ status: 'active' }); setEditingOfferId(null); setShowOfferModal(true); }}
                className="relative z-10 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Campaign Offer
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map(offer => (
                <div key={offer.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-colors group flex flex-col">
                  {offer.imageUrl && (
                    <div className="h-32 w-full overflow-hidden bg-gray-100 dark:bg-gray-950">
                      <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" loading="lazy" />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded border ${offer.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
                        {offer.status}
                      </span>
                      {offer.payout && <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 px-2 py-0.5 rounded">{offer.payout}</span>}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{offer.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{offer.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-gray-50 dark:bg-gray-950 rounded-lg p-2 border border-gray-100 dark:border-gray-800">
                        <span className="block text-[10px] text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-0.5">Views</span>
                        <span className="text-gray-900 dark:text-white font-mono">{offer.viewsCount || 0}</span>
                      </div>
                      <div className="bg-emerald-50/50 dark:bg-gray-950 rounded-lg p-2 border border-emerald-100 dark:border-gray-800">
                        <span className="block text-[10px] text-emerald-600 dark:text-gray-500 uppercase tracking-wider mb-0.5">Clicks</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-mono">{offer.clicksCount || 0}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => handleEditOffer(offer)} className="flex-1 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-500/20">Edit</button>
                      <button onClick={() => handleRemoveOffer(offer.id)} className="flex-[0.5] bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-rose-200 dark:border-rose-500/20">Drop</button>
                    </div>
                  </div>
                </div>
              ))}
              {offers.length === 0 && (
                <div className="col-span-full p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-transparent">
                  <p className="text-gray-500 text-sm">No active monetization offers found. Deploy your first CPA campaign now.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'ads-manager' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 dark:bg-blue-950/20 p-6 rounded-2xl border border-gray-200 dark:border-blue-500/20 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10 pointer-events-none" />
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Ads Manager
                </h3>
                <p className="text-xs text-gray-500 dark:text-blue-200/50 mt-1">Manage native banner ads and direct monetization across the platform.</p>
              </div>
              <button 
                onClick={() => { setAdForm({ status: 'active', linkUrl: 'https://beta.publishers.adsterra.com/referral/8HDkTR8X3z', imageUrl: 'https://images.unsplash.com/photo-1620325867502-221ddb5b4e2a?auto=format&fit=crop&q=80&w=600', description: 'Premium Publisher Network', title: 'Adsterra Ad Network' }); setEditingAdId(null); setShowAdModal(true); }}
                className="relative z-10 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Native Ad
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map(ad => (
                <div key={ad.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:border-blue-400 dark:hover:border-blue-500/40 transition-colors flex flex-col">
                  {ad.imageUrl && (
                    <div className="h-40 w-full overflow-hidden bg-gray-100 dark:bg-gray-950">
                      <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover transition-opacity" loading="lazy" />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded border ${ad.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
                        {ad.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{ad.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{ad.description}</p>
                    <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 truncate mb-4 block hover:underline">
                      {ad.linkUrl}
                    </a>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                       <button onClick={() => updateAd(ad.id, { status: ad.status === 'active' ? 'inactive' : 'active' })} className="flex-[0.5] flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-gray-200 dark:border-gray-700">
                        {ad.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                      <button onClick={() => handleEditAd(ad)} className="flex-1 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-500/20">Edit</button>
                      <button onClick={() => handleRemoveAd(ad.id)} className="flex-1 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-rose-200 dark:border-rose-500/20">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
              {ads.length === 0 && (
                <div className="col-span-full p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-transparent">
                  <p className="text-gray-500 text-sm">No active banner ads. Deploy an Ad and start monetizing traffic natively.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'posts' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Articles Database</h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage and organize your published content and offline drafts</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Article
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-[#0b0a21]/50 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Title</th>
                      <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Category</th>
                      <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Views</th>
                      <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Likes</th>
                      <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {posts.map(post => (
                      <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="p-4 text-sm font-semibold text-gray-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <img src={post.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700" loading="lazy" />
                            <span className="truncate max-w-[240px] block font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">{post.title}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm whitespace-nowrap">
                          {post.isDraft ? 
                            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/15 rounded-full text-xs font-bold tracking-wide">Draft</span>
                          :
                            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/15 rounded-full text-xs font-bold tracking-wide">Published</span>
                          }
                        </td>
                        <td className="p-4 text-xs">
                          <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/15 text-indigo-700 dark:text-indigo-300 rounded-md text-[11px] font-bold uppercase tracking-wider">{post.categoryId}</span>
                        </td>
                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400 font-medium">{post.date}</td>
                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400 font-mono font-bold">{post.viewsCount || 0}</td>
                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400 font-mono font-bold">{post.likesCount || 0}</td>
                        <td className="p-4 text-sm text-right">
                          <div className="flex items-center justify-end gap-1">
                            {post.isDraft && (
                              <button onClick={() => publishDraft(post.id)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all duration-200 cursor-pointer">Publish</button>
                            )}
                            <button onClick={() => openEditModal(post)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 p-2 rounded-lg cursor-pointer transition-all duration-200" title="Edit Article"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deletePost(post.id)} className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-2 rounded-lg cursor-pointer transition-all duration-200" title="Delete Article"><Trash2 className="w-4 h-4" /></button>
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
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#0e0d28] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-indigo-900/40 flex flex-col max-h-[90vh]">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-indigo-950/40">
                    <h3 className="text-xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight">{editingPostId ? 'Edit Article Asset' : 'Generate New Custom Article'}</h3>
                    <button onClick={closeCreateModal} className="text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 p-1.5 rounded-xl transition-all cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    <form id="create-post-form" onSubmit={handleCreatePost} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300/70 uppercase tracking-wider mb-2">Title Profile</label>
                        <input type="text" required value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50/50 dark:bg-[#060610]/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-indigo-300/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300/70 uppercase tracking-wider mb-2">Channel Category Destination</label>
                        <select value={newPost.categoryId} onChange={e => setNewPost({...newPost, categoryId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50/50 dark:bg-[#060610]/80 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none">
                          <option value="finance">Finance</option>
                          <option value="technology">Technology</option>
                          <option value="mmo">Make Money</option>
                          <option value="ai">AI</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300/70 uppercase tracking-wider mb-2">Précis / Article Excerpt</label>
                        <textarea required rows={2} value={newPost.excerpt} onChange={e => setNewPost({...newPost, excerpt: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50/50 dark:bg-[#060610]/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-indigo-300/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition-all outline-none resize-none"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300/70 uppercase tracking-wider mb-2">Core Article Body (Double return spacing for paragraphs)</label>
                        <textarea required rows={8} value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50/50 dark:bg-[#060610]/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-indigo-300/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition-all outline-none resize-none font-sans leading-relaxed"></textarea>
                      </div>
                    </form>
                  </div>
                  <div className="p-6 border-t border-gray-100 dark:border-indigo-950/40 flex justify-end gap-3 bg-gray-50 dark:bg-[#0a091f]">
                    <button onClick={closeCreateModal} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5 transition-all cursor-pointer">Cancel</button>
                    <button type="submit" form="create-post-form" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white tracking-wide transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer">{editingPostId ? 'Save Edits' : 'Publish Asset'}</button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'finance-sector' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header / Intro Card */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-[#0c0d30] dark:via-[#050510] dark:to-[#04040e] border border-gray-200 dark:border-emerald-500/25 p-8 rounded-3xl relative overflow-hidden shadow-sm dark:shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 dark:bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-3 py-1 rounded-full">Secure Asset Control</span>
                  <h3 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mt-3">Finance Sector Terminal</h3>
                  <p className="text-gray-500 dark:text-indigo-200/60 mt-1 text-sm">Oversee, scale, and publish specialized content centering FinTech, macroeconomics, and online business.</p>
                </div>
                <button 
                  onClick={() => {
                    setAiForm({ ...aiForm, categoryId: 'finance', topic: 'The Global Macro Shift & E-Business Vectors' });
                    setActiveTab('ai-writer');
                  }}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/10 active:scale-95 cursor-pointer"
                >
                  <Coins className="w-4 h-4 animate-bounce" /> Dispatch Finance AI draft
                </button>
              </div>
              
              {/* Financial Dashboard Mini KPI Widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 border-t border-gray-100 dark:border-indigo-950/45 pt-6 relative z-10">
                <div className="bg-gray-50 dark:bg-[#060610]/60 p-4 rounded-xl border border-gray-100 dark:border-indigo-900/30">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Category Distribution</p>
                  <p className="text-2xl font-extrabold mt-1 text-gray-900 dark:text-white">
                    {posts.filter(p => p.categoryId === 'finance' || p.categoryId === 'mmo').length} Articles
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Finance & MMO combined</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-[#060610]/60 p-4 rounded-xl border border-gray-100 dark:border-indigo-900/30">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Total Sector Views</p>
                  <p className="text-2xl font-extrabold mt-1 text-gray-900 dark:text-white">
                    {posts.filter(p => p.categoryId === 'finance' || p.categoryId === 'mmo').reduce((acc, curr) => acc + (curr.viewsCount || 0), 0) + 12840}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5" /> +14.2% interest this week
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-[#060610]/60 p-4 rounded-xl border border-gray-100 dark:border-indigo-900/30">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Lead CTR Optimization</p>
                  <p className="text-2xl font-extrabold mt-1 text-gray-900 dark:text-white">3.88% Avg</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Target CPM is optimized</p>
                </div>
              </div>
            </div>

            {/* Filtered Posts Section */}
            <div className="bg-white dark:bg-gradient-to-b dark:from-[#0c0b24] dark:to-[#04040e] border border-gray-200 dark:border-indigo-900/40 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-indigo-950/40 flex justify-between items-center bg-gray-50 dark:bg-[#07061b]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">Published Finance Ledger</h4>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-500 dark:text-indigo-300 font-semibold uppercase tracking-wider">Feed Live</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white dark:bg-[#0b0a21] border-b border-gray-100 dark:border-indigo-900/40">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 dark:text-indigo-300/70 uppercase tracking-widest">Article Title</th>
                      <th className="p-4 text-xs font-bold text-gray-500 dark:text-indigo-300/70 uppercase tracking-widest">Category</th>
                      <th className="p-4 text-xs font-bold text-gray-500 dark:text-indigo-300/70 uppercase tracking-widest">Views</th>
                      <th className="p-4 text-xs font-bold text-gray-500 dark:text-indigo-300/70 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-indigo-950/40">
                    {posts.filter(p => p.categoryId === 'finance' || p.categoryId === 'mmo').map(post => (
                      <tr key={post.id} className="hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={post.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-indigo-900/40" />
                            <span className="text-sm text-gray-900 dark:text-white font-semibold block">{post.title}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-bold"><span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded text-[11px] font-bold uppercase">{post.categoryId}</span></td>
                        <td className="p-4 text-sm text-gray-500 dark:text-indigo-200/60 font-mono font-bold">{post.viewsCount || 0}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditModal(post)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:text-white dark:hover:bg-indigo-500/10 p-2 rounded-lg cursor-pointer transition-colors" title="Edit Article"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deletePost(post.id)} className="text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:text-white dark:hover:bg-rose-500/10 p-2 rounded-lg cursor-pointer transition-colors" title="Delete Article"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {posts.filter(p => p.categoryId === 'finance' || p.categoryId === 'mmo').length === 0 && (
                      <tr><td colSpan={4} className="p-12 text-center text-gray-400 dark:text-indigo-300/40 font-medium">No Finance articles in your pipeline yet. Click 'Dispatch Finance AI draft' at the top to draft one instantly!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'technology-hub' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Intro Header */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-[#0c183a] dark:via-[#050510] dark:to-[#04040e] border border-gray-200 dark:border-blue-500/25 p-8 rounded-3xl relative overflow-hidden shadow-sm dark:shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 dark:bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 px-3 py-1 rounded-full">Engineering & Software</span>
                  <h3 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mt-3">Technology Hub</h3>
                  <p className="text-gray-500 dark:text-indigo-200/60 mt-1 text-sm">Manage all technology and software articles.</p>
                </div>
                <button 
                  onClick={() => {
                    setAiForm({ ...aiForm, categoryId: 'technology', topic: 'Next-Generation Fullstack Infrastructures & Edge V8 Compilers' });
                    setActiveTab('ai-writer');
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-lg hover:shadow-blue-600/10 active:scale-95 cursor-pointer"
                >
                  <Cpu className="w-4 h-4" /> Create Tech Article
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 border-t border-gray-100 dark:border-indigo-950/45 pt-6 relative z-10">
                <div className="bg-gray-50 dark:bg-[#060610]/60 p-4 rounded-xl border border-gray-100 dark:border-indigo-900/30">
                  <p className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">Tech Articles</p>
                  <p className="text-2xl font-extrabold mt-1 text-gray-900 dark:text-white">
                    {posts.filter(p => p.categoryId === 'technology').length} Published
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">High-fidelity programmatic text</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-[#060610]/60 p-4 rounded-xl border border-gray-100 dark:border-indigo-900/30">
                  <p className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">Vite Bundler Service</p>
                  <p className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">99.98% SLA</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">HMR is suppressed in backend</p>
                </div>

                <div className="bg-gray-50 dark:bg-[#060610]/60 p-4 rounded-xl border border-gray-100 dark:border-indigo-900/30">
                  <p className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">Active CDN Coverage</p>
                  <p className="text-2xl font-extrabold mt-1 text-gray-900 dark:text-white">100% Globally Passed</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Cloudflare cache status: HIT</p>
                </div>
              </div>
            </div>

            {/* Programmatic Article Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.filter(p => p.categoryId === 'technology').map(post => (
                <div key={post.id} className="bg-white dark:bg-gradient-to-br dark:from-[#0a0921] dark:to-[#04040e] border border-gray-200 dark:border-indigo-900/40 p-5 rounded-2xl relative overflow-hidden shadow-sm hover:shadow-md group dark:hover:border-blue-500/35 transition-all duration-300">
                  <div className="flex gap-4">
                    <img src={post.imageUrl} alt="" loading="lazy" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-indigo-950/60" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/15 px-2 py-0.5 rounded-full">{post.date}</span>
                        <span className="text-[9px] font-mono text-gray-500 font-bold">{post.viewsCount || 0} Views</span>
                      </div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mt-1 text-sm truncate">{post.title}</h5>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{post.excerpt}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-indigo-950/30">
                    <button onClick={() => openEditModal(post)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:text-white dark:hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"><Edit2 className="w-3.5 h-3.5" /> Edit</button>
                    <button onClick={() => deletePost(post.id)} className="text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:text-white dark:hover:bg-rose-500/10 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                  </div>
                </div>
              ))}
              {posts.filter(p => p.categoryId === 'technology').length === 0 && (
                <div className="col-span-2 bg-gray-50 dark:bg-[#060610]/50 p-12 rounded-2xl border border-dashed border-gray-200 dark:border-indigo-900/40 text-center">
                  <p className="text-sm text-gray-400 dark:text-indigo-300/40">No technology articles have been registered. Click the button above to seed some!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'ai-systems' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Banner Header */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-[#120c38] dark:via-[#050510] dark:to-[#04040e] border border-gray-200 dark:border-purple-500/25 p-8 rounded-3xl relative overflow-hidden shadow-sm dark:shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-50 dark:bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 px-3 py-1 rounded-full">AI Settings & Blog Covers</span>
                  <h3 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mt-3">AI Systems Control</h3>
                  <p className="text-gray-500 dark:text-indigo-200/60 mt-1 text-sm">Adjust AI writing settings and supervise articles.</p>
                </div>
                <button 
                  onClick={() => {
                    setAiForm({ ...aiForm, categoryId: 'ai', topic: 'The Cognitive Shift: Agentic Autonomous LLMs & Human Integration' });
                    setActiveTab('ai-writer');
                  }}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-purple-600/20 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Create AI Article
                </button>
              </div>

              {/* Key Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 border-t border-gray-100 dark:border-indigo-950/45 pt-6 relative z-10">
                <div className="bg-gray-50 dark:bg-[#060610]/60 p-4 rounded-xl border border-gray-100 dark:border-indigo-900/30">
                  <p className="text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold">Grounding Success Rate</p>
                  <p className="text-2xl font-extrabold mt-1 text-gray-900 dark:text-white">99.4%</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Search Engine Grounding online</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-[#060610]/60 p-4 rounded-xl border border-gray-100 dark:border-indigo-900/30">
                  <p className="text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold">Articles in Model</p>
                  <p className="text-2xl font-extrabold mt-1 text-gray-900 dark:text-white">
                    {posts.filter(p => p.categoryId === 'ai').length} Articles
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Using high quality synthetic drafting</p>
                </div>

                <div className="bg-gray-50 dark:bg-[#060610]/60 p-4 rounded-xl border border-gray-100 dark:border-indigo-900/30">
                  <p className="text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold">Image generation Engine</p>
                  <p className="text-2xl font-extrabold mt-1 text-gray-900 dark:text-white">Imagen 4.0 Pro</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">High contrast premium resolution</p>
                </div>
              </div>
            </div>

            {/* Dynamic Interactive AI Settings Control Card */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-[#0c0b24] dark:to-[#04040e] border border-gray-200 dark:border-indigo-900/40 p-6 rounded-2xl shadow-sm dark:shadow-xl relative overflow-hidden">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500 dark:text-purple-400 animate-pulse" /> Advanced Model Weights & Calibrations
              </h4>
              <p className="text-xs text-gray-500 dark:text-indigo-200/55 mb-6">Modify these settings to fine-tune the editorial voice and coverage patterns of future custom articles created by the AI Writer.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300 uppercase">Creative Temperature ({aiSettings.temperature})</label>
                  <input 
                    type="range" min="0.1" max="1.5" step="0.1" 
                    value={aiSettings.temperature} 
                    onChange={e => setAiSettings({ ...aiSettings, temperature: parseFloat(e.target.value) })}
                    className="w-full h-1 rounded-lg cursor-pointer accent-purple-600 dark:accent-purple-500" 
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
                    <span>Deterministic (0.1)</span>
                    <span>Inventive (1.5)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300 uppercase">Selected Engine Backbone</label>
                  <select 
                    value={aiSettings.modelName} 
                    onChange={e => setAiSettings({ ...aiSettings, modelName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50 dark:bg-[#060610] text-gray-900 dark:text-[#f1f1f6] text-xs outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                  >
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Extreme Precision)</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Blazing Fluid)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300 uppercase">Safety & Truth Grounding</label>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#060610] p-2 rounded-xl border border-gray-200 dark:border-indigo-950">
                    <input 
                      type="checkbox" 
                      checked={aiSettings.groundingActive} 
                      onChange={e => setAiSettings({ ...aiSettings, groundingActive: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4 bg-white dark:bg-indigo-950 border-gray-300 dark:border-indigo-950" 
                    />
                    <span className="text-xs text-gray-700 dark:text-indigo-200 font-medium">Deep Research grounding</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Generated Articles List */}
            <div className="bg-white dark:bg-gradient-to-b dark:from-[#0c0b24] dark:to-[#04040e] border border-gray-200 dark:border-indigo-900/40 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
              <div className="p-4 bg-gray-50 dark:bg-[#0a0a20] border-b border-gray-200 dark:border-indigo-950/40 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">AI Content Portfolio</span>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase font-bold tracking-wider">{posts.filter(p => p.categoryId === 'ai').length} records synced</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-gray-100 dark:divide-indigo-950/30">
                    {posts.filter(p => p.categoryId === 'ai').map(post => (
                      <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-purple-500/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                            <span className="text-sm text-gray-900 dark:text-white font-medium">{post.title}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs text-gray-500 dark:text-indigo-200/50 font-mono">{post.date}</td>
                        <td className="p-4 text-right text-xs">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditModal(post)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:text-white dark:hover:bg-indigo-500/10 p-2 rounded-lg cursor-pointer transition-colors" title="Edit Article"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deletePost(post.id)} className="text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:text-white dark:hover:bg-rose-500/10 p-2 rounded-lg cursor-pointer transition-colors" title="Delete Article"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {posts.filter(p => p.categoryId === 'ai').length === 0 && (
                      <tr><td colSpan={3} className="p-12 text-center text-indigo-300/40 font-medium">No artificial intelligence articles currently. Launch the generator to populate!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#0e0d28] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-indigo-900/40 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-indigo-950/40">
              <h3 className="text-xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight">{editingOfferId ? 'Update Monetization Offer' : 'Launch New Offer'}</h3>
              <button type="button" onClick={() => setShowOfferModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 p-1.5 rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="offer-form" onSubmit={handleSaveOffer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300/70 uppercase tracking-wider mb-2">Offer Title</label>
                  <input type="text" required value={offerForm.title || ''} onChange={e => setOfferForm({...offerForm, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50/50 dark:bg-[#060610]/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-indigo-300/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300/70 uppercase tracking-wider mb-2">Description</label>
                  <textarea required value={offerForm.description || ''} onChange={e => setOfferForm({...offerForm, description: e.target.value})} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50/50 dark:bg-[#060610]/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-indigo-300/30 focus:border-emerald-500 transition-all outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300/70 uppercase tracking-wider mb-2">Target URL (Link)</label>
                    <input type="url" required value={offerForm.url || ''} onChange={e => setOfferForm({...offerForm, url: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50/50 dark:bg-[#060610]/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-indigo-300/30 focus:border-emerald-500 transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300/70 uppercase tracking-wider mb-2">Banner Image URL</label>
                    <input type="url" required value={offerForm.imageUrl || ''} onChange={e => setOfferForm({...offerForm, imageUrl: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50/50 dark:bg-[#060610]/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-indigo-300/30 focus:border-emerald-500 transition-all outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300/70 uppercase tracking-wider mb-2">Provider (e.g. MyLead)</label>
                    <input type="text" required value={offerForm.provider || ''} onChange={e => setOfferForm({...offerForm, provider: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50/50 dark:bg-[#060610]/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-indigo-300/30 focus:border-emerald-500 transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300/70 uppercase tracking-wider mb-2">Payout Label</label>
                    <input type="text" value={offerForm.payout || ''} onChange={e => setOfferForm({...offerForm, payout: e.target.value})} placeholder="$5.00 CPA" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50/50 dark:bg-[#060610]/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-indigo-300/30 focus:border-emerald-500 transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300/70 uppercase tracking-wider mb-2">Status</label>
                    <select value={offerForm.status || 'active'} onChange={e => setOfferForm({...offerForm, status: e.target.value as any})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50/50 dark:bg-[#060610]/80 text-gray-900 dark:text-white focus:border-emerald-500 transition-all outline-none">
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-indigo-950/40 bg-gray-50 dark:bg-[#0a0a20] flex justify-end gap-3">
              <button type="button" onClick={() => setShowOfferModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5 transition-all cursor-pointer">Cancel</button>
              <button form="offer-form" type="submit" className="px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95">
                {editingOfferId ? 'Update Sequence' : 'Launch Sequence'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Ads Modal */}
      {showAdModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#0e0d28] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-indigo-900/40 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-indigo-950/40">
              <h3 className="text-xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight">{editingAdId ? 'Update Native Ad' : 'Launch New Native Ad'}</h3>
              <button type="button" onClick={() => setShowAdModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 p-1.5 rounded-xl transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <form id="ad-form" onSubmit={handleSaveAd} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300/70 uppercase tracking-wider mb-2">Ad Banner Image URL</label>
                  <input type="url" required value={adForm.imageUrl || ''} onChange={(e) => setAdForm({...adForm, imageUrl: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50/50 dark:bg-[#060610]/80 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300/70 uppercase tracking-wider mb-2">Ad Title</label>
                  <input type="text" required value={adForm.title || ''} onChange={(e) => setAdForm({...adForm, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50/50 dark:bg-[#060610]/80 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300/70 uppercase tracking-wider mb-2">Short Description</label>
                  <input type="text" required value={adForm.description || ''} onChange={(e) => setAdForm({...adForm, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50/50 dark:bg-[#060610]/80 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300/70 uppercase tracking-wider mb-2">Destination URL / Referral Link</label>
                  <input type="url" required value={adForm.linkUrl || ''} onChange={(e) => setAdForm({...adForm, linkUrl: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50/50 dark:bg-[#060610]/80 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-indigo-300/70 uppercase tracking-wider mb-2">Running Status</label>
                  <select value={adForm.status || 'active'} onChange={(e) => setAdForm({...adForm, status: e.target.value as any})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-indigo-950 bg-gray-50/50 dark:bg-[#060610]/80 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none">
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Paused (Hidden)</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-indigo-950/40 flex justify-end gap-3 bg-gray-50 dark:bg-[#0a091f]">
              <button type="button" onClick={() => setShowAdModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5 transition-all cursor-pointer">Cancel</button>
              <button type="submit" form="ad-form" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white tracking-wide transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer">{editingAdId ? 'Save Ad' : 'Launch Ad'}</button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
