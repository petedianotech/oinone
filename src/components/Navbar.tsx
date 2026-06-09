import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';
import { cn, CATEGORIES } from '../lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { useBlog } from '../lib/BlogContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { posts } = useBlog();
  const location = useLocation();

  const links = [
    { name: 'Finance', path: '/finance' },
    { name: 'Technology', path: '/technology' },
    { name: 'Make Money Online', path: '/mmo' },
    { name: 'AI', path: '/ai' },
    { name: 'About Us', path: '/about' },
  ];

  // Client-side fuzzy search on title or content (joining content array)
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
    <header className="fixed top-0 inset-x-0 z-50 glass-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2.5">
            <img 
              src="/app_icon.png" 
              alt="Oinone Premium Logo" 
              className="h-8 w-8 rounded-lg shadow-md border border-gray-100 dark:border-gray-800 object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="font-display font-bold text-2xl tracking-tighter text-gray-950 dark:text-white">
              Oinone<span className="text-indigo-600">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex space-x-8">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400",
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-600 dark:text-gray-300"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Desktop Fuzzy Search Input and Dropdown */}
            <div className="relative">
              <div className="flex items-center bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-600/30 focus-within:border-indigo-600/50 transition-all duration-300 w-44 focus-within:w-60">
                <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="bg-transparent border-none outline-none text-xs text-gray-950 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 w-full"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-650 dark:hover:text-gray-250 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Fuzzy Search Results Dropdown overlay */}
              {isSearchFocused && searchQuery.trim() && (
                <div 
                  className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-4 z-50 max-h-96 overflow-y-auto"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800 mb-3 text-xs text-gray-400 font-medium">
                    <span>Search Results ({matchedPosts.length})</span>
                  </div>
                  {matchedPosts.length > 0 ? (
                    <div className="flex flex-col gap-3">
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
                            className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group text-left text-inherit no-underline"
                          >
                            <img src={post.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className={cn("inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase tracking-wider mb-0.5", category.color)}>
                                {category.name}
                              </span>
                              <h4 className="text-xs font-semibold text-gray-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate leading-tight">
                                {post.title}
                              </h4>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-gray-500">
                      No matches found for &apos;<strong>{searchQuery}</strong>&apos;
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <ThemeToggle />

            {/* Admin access button on desktop navbar header as well */}
            <Link 
              to="/admin" 
              className="text-gray-500 hover:text-indigo-600 dark:text-gray-450 dark:hover:text-indigo-400 transition-colors p-1.5 rounded-lg flex items-center" 
              title="Admin Access"
            >
              <Shield className="h-5 w-5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-3 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sidebar Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar drawer containing mobile search and admin credentials */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-[#0a0a16] dark:via-[#100f2e] dark:to-[#04040d] p-6 shadow-2xl flex flex-col lg:hidden border-l border-indigo-200 dark:border-indigo-500/20"
          >
            <div className="flex justify-between items-center pb-6 border-b border-gray-100 dark:border-gray-800">
              <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                <img 
                  src="/app_icon.png" 
                  alt="Oinone Premium Logo" 
                  className="h-8 w-8 rounded-lg shadow-md object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="font-display font-bold text-xl tracking-tighter text-gray-950 dark:text-white">
                  Oinone<span className="text-indigo-600">.</span>
                </span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Bar in Mobile Sidebar */}
            <div className="my-6">
              <div className="flex items-center bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-xl px-3 py-2">
                <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-gray-950 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 w-full"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Instant results inside Mobile Sidebar */}
              {searchQuery.trim() && (
                <div className="mt-2 max-h-48 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl p-2">
                  {matchedPosts.length > 0 ? (
                    matchedPosts.map(post => {
                      const category = CATEGORIES[post.categoryId];
                      return (
                        <Link
                          key={post.id}
                          to={`/article/${post.id}`}
                          onClick={() => {
                            setSearchQuery('');
                            setIsOpen(false);
                          }}
                          className="flex gap-3 p-2 hover:bg-white dark:hover:bg-gray-905 rounded-lg transition-colors group text-left"
                        >
                          <img src={post.imageUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className={cn("inline-block px-1 py-0.2 rounded text-[8px] font-semibold uppercase tracking-wider mb-0.5", category.color)}>
                              {category.name}
                            </span>
                            <h4 className="text-[11px] font-semibold text-gray-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                              {post.title}
                            </h4>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-[11px] text-gray-500 dark:text-gray-400">
                      No matches found for &apos;<strong>{searchQuery}</strong>&apos;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation links in Mobile Sidebar */}
            <nav className="flex-1 space-y-2 overflow-y-auto mb-6">
              {links.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-gray-55 dark:hover:bg-gray-800/50",
                      isActive 
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold" 
                        : "text-gray-700 dark:text-gray-350 hover:text-gray-950 dark:hover:text-white"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="space-y-4 pt-6 mt-auto border-t border-gray-100 dark:border-gray-800">
              {/* Admin Access Button in Mobile Side Menu Drawer */}
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-medium p-3 rounded-xl text-sm transition-all shadow-sm border border-gray-150 dark:border-gray-850 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <Shield className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                <span>Admin Access</span>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </header>
  );
}

