import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Menu, Sparkles, Heart, Wallet, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn, CATEGORIES } from '../lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { useBlog } from '../lib/BlogContext';

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { posts } = useBlog();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Finance', path: '/finance' },
    { name: 'Technology', path: '/technology' },
    { name: 'Make Money', path: '/mmo' },
    { name: 'AI', path: '/ai' },
    { name: 'Premium Vault', path: '/vault' },
  ];

  const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
  const matchedPosts = queryWords.length > 0
    ? posts.filter(post => {
        const title = post.title.toLowerCase();
        const excerpt = post.excerpt.toLowerCase();
        const content = post.content.join(' ').toLowerCase();
        return queryWords.every(word => 
          title.includes(word) || 
          excerpt.includes(word) || 
          content.includes(word)
        );
      }).slice(0, 5)
    : [];

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-500",
      isScrolled ? "py-2" : "py-4"
    )}>
      <div className={cn(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-500",
        isScrolled ? "w-full sm:w-[95%] lg:w-[85%]" : "w-full"
      )}>
        <div className={cn(
          "flex justify-between items-center transition-all duration-500 rounded-full",
          isScrolled 
            ? "bg-[#121216]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-6 py-2" 
            : "bg-transparent px-2 py-2"
        )}>
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3 relative group">
            <div className="absolute inset-0 bg-brand-cyan/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <img 
              src="/oinone_blog_icon.jpg" 
              alt="Oinone Premium Logo" 
              className="h-9 w-9 rounded-xl shadow-lg border border-white/20 object-cover relative z-10 hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <span className="font-display font-black text-2xl tracking-tighter text-white uppercase relative z-10">
              Oinone<span className="text-brand-cyan glow-effect">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "relative px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors rounded-full",
                    isActive ? "text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/10 border border-white/20 rounded-full -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <div className={cn(
                "flex items-center bg-black/40 border transition-all duration-300 rounded-full pl-4 pr-2 py-1.5",
                isSearchFocused 
                  ? "border-brand-purple/50 ring-1 ring-brand-purple/50 w-64 shadow-[0_0_15px_rgba(110,86,207,0.3)]" 
                  : "border-white/10 w-48 hover:border-white/20 hover:bg-black/60"
              )}>
                <Search className={cn("h-3.5 w-3.5 flex-shrink-0 transition-colors", isSearchFocused ? "text-brand-purple" : "text-gray-500")} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-500 w-full ml-2 font-medium tracking-wide"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchQuery('')}
                      className="text-gray-500 hover:text-white cursor-pointer ml-1 bg-white/10 rounded-full p-1 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Results */}
              <AnimatePresence>
                {isSearchFocused && searchQuery.trim() && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute right-0 mt-4 w-96 bg-[#121216] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 z-50 max-h-[28rem] overflow-y-auto glass-panel"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4 px-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-purple">Search Results</span>
                      <span className="text-[10px] font-mono text-gray-500">{matchedPosts.length} hits</span>
                    </div>
                    
                    {matchedPosts.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {matchedPosts.map(post => {
                          const category = CATEGORIES[post.categoryId];
                          return (
                            <Link
                              key={post.id}
                              to={`/article/${post.id}`}
                              onClick={() => {
                                setSearchQuery('');
                                setIsSearchFocused(false);
                              }}
                              className="flex gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group relative"
                            >
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-brand-cyan rounded-r-full transition-all group-hover:h-1/2" />
                              <img src={post.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                              <div className="min-w-0 flex-1 flex flex-col justify-center">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-brand-purple mb-1 truncate">
                                  {category?.name || post.categoryId}
                                </span>
                                <h4 className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors truncate leading-tight">
                                  {post.title}
                                </h4>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-full border border-white/10 bg-black/40 flex items-center justify-center mx-auto mb-3">
                          <Search className="h-5 w-5 text-gray-600" />
                        </div>
                        <p className="text-xs text-gray-400 font-medium tracking-wide">
                          No internal logs found for "<span className="text-white">{searchQuery}</span>"
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Premium Button Trigger */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="relative group px-5 py-2 rounded-full overflow-hidden border border-brand-purple/50 bg-black hover:border-brand-purple transition-all duration-300 shadow-[0_0_15px_rgba(110,86,207,0.3)] hover:shadow-[0_0_25px_rgba(110,86,207,0.6)] cursor-pointer hidden md:block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-display font-bold text-xs uppercase tracking-widest text-white relative z-10 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-cyan" /> Premium
              </span>
            </button>
          </div>

          <div className="flex items-center space-x-4 md:hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="relative group px-4 py-1.5 rounded-full overflow-hidden border border-brand-purple/50 bg-black transition-all shadow-[0_0_15px_rgba(110,86,207,0.3)] cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-display font-bold text-[10px] uppercase tracking-widest text-white relative z-10 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-brand-cyan" /> Premium
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#0a0a0c] border-l border-white/10 z-[101] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 blur-[50px] pointer-events-none" />
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-purple" />
                  <span className="font-display font-bold text-lg text-white tracking-widest uppercase">Premium Access</span>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-full bg-black/40 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="glass-panel p-5 rounded-2xl border border-brand-purple/20 relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 to-brand-cyan/10" />
                   <h4 className="font-display font-bold text-white mb-2 relative z-10">Oinone Premium</h4>
                   <p className="text-sm font-medium text-gray-400 mb-4 relative z-10">Unlock exclusive financial strategies, private tools, and premium insights.</p>
                   <Link to="/vault" onClick={() => setIsSidebarOpen(false)} className="inline-block w-full py-3 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-gray-200 transition-colors text-center relative z-10">
                     Enter the Vault
                   </Link>
                </div>

                <div className="space-y-3">
                  <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Navigation</span>
                  <div className="flex flex-col gap-1">
                    {links.map((link) => (
                      <Link 
                        key={link.name} 
                        to={link.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className="px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold text-gray-300 hover:text-white transition-colors border border-transparent hover:border-white/5"
                      >
                        {link.name}
                      </Link>
                    ))}

                  </div>
                </div>

                {/* Sponsor direct link ad */}
                <a 
                  href="https://omg10.com/4/11136040" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group relative p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/15 overflow-hidden hover:border-emerald-300 transition-all text-left"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />
                  <div className="relative z-10 space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-500/25 text-[8px] font-extrabold uppercase tracking-widest text-emerald-400">
                      PARTNER AIRDROP
                    </div>
                    <h5 className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                      Claim $1,500 Reward & MMO Toolkits
                    </h5>
                    <p className="text-[10px] text-gray-400 font-medium leading-normal">
                      Access verified direct-payment systems, complete monetization courses and premium digital toolsets now.
                    </p>
                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider pt-1 justify-between">
                      <span>ACTIVATE PROTOCOL</span>
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </a>
                
                <div className="mt-auto pt-6">
                  <div className="p-5 rounded-2xl border border-white/5 bg-[#121216]">
                    <h5 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
                       <Heart className="w-4 h-4 text-rose-500" /> Support the Author
                    </h5>
                    <p className="text-xs text-gray-400 mb-4 font-medium leading-relaxed">
                      If you find these insights valuable, consider supporting the continuous research.
                    </p>
                    <div className="flex flex-col gap-2">
                      <a href="#" className="flex items-center justify-center gap-2 bg-[#0070ba] hover:bg-[#003087] transition-colors py-2.5 rounded-xl font-bold text-white text-xs">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 brightness-0 invert" />
                        Donate
                      </a>
                      <a href="#" className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 border border-white/10 hover:border-white/30 transition-colors py-2.5 rounded-xl font-bold text-white text-xs">
                        <Wallet className="w-4 h-4" /> Paychangu
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
