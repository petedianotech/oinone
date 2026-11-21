import { Link, useLocation } from 'react-router-dom';
import { Search, X, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn, CATEGORIES } from '../lib/utils';
import { useBlog } from '../lib/BlogContext';

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { posts } = useBlog();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const links = [
    { name: 'Finance', path: '/finance' },
    { name: 'Technology', path: '/technology' },
    { name: 'AI', path: '/ai' },
    { name: 'Business', path: '/mmo' },
  ];

  const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
  const matchedPosts =
    queryWords.length > 0
      ? posts
          .filter((post) => {
            const title = post.title.toLowerCase();
            const excerpt = post.excerpt.toLowerCase();
            return queryWords.every(
              (word) => title.includes(word) || excerpt.includes(word)
            );
          })
          .slice(0, 5)
      : [];

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-200',
        isScrolled
          ? 'bg-[#0a0a0b]/90 backdrop-blur-md border-b border-zinc-800'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center gap-2 font-semibold text-white tracking-tight"
          >
            <img
              src="/logo.svg"
              alt="Oinone"
              className="h-7 w-7 rounded-md"
              width={28}
              height={28}
            />
            <span className="text-lg">Oinone</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive =
                location.pathname === link.path ||
                location.pathname.startsWith(link.path + '/');
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'text-white bg-zinc-800'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Search + actions */}
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <div
                className={cn(
                  'flex items-center border rounded-lg pl-3 pr-2 py-1.5 transition-colors',
                  isSearchFocused
                    ? 'border-indigo-500 bg-zinc-900'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                )}
              >
                <Search className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 180)}
                  className="bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500 w-36 lg:w-48 ml-2"
                  aria-label="Search articles"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-zinc-500 hover:text-white p-0.5"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Search results dropdown */}
              {isSearchFocused && searchQuery.trim() && (
                <div className="absolute right-0 mt-2 w-80 bg-[#111113] border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-zinc-800 flex justify-between items-center">
                    <span className="text-xs font-medium text-zinc-500">
                      Results
                    </span>
                    <span className="text-xs text-zinc-600">
                      {matchedPosts.length}
                    </span>
                  </div>
                  {matchedPosts.length > 0 ? (
                    <div className="max-h-72 overflow-y-auto py-1">
                      {matchedPosts.map((post) => {
                        const category = CATEGORIES[post.categoryId];
                        return (
                          <Link
                            key={post.id}
                            to={`/article/${post.id}`}
                            onClick={() => {
                              setSearchQuery('');
                              setIsSearchFocused(false);
                            }}
                            className="flex gap-3 px-3 py-2.5 hover:bg-zinc-900 transition-colors"
                          >
                            <img
                              src={post.imageUrl}
                              alt=""
                              className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] text-indigo-400 font-medium truncate">
                                {category?.name || post.categoryId}
                              </p>
                              <p className="text-sm font-medium text-white truncate">
                                {post.title}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-zinc-500">
                      No articles found
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/support"
              className="hidden lg:inline-flex items-center px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors"
            >
              Support
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[60] md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-xs bg-[#0a0a0b] border-l border-zinc-800 z-[70] flex flex-col md:hidden">
            <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-800">
              <span className="font-semibold text-white">Menu</span>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 text-zinc-400 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg"
              >
                Home
              </Link>
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/vault"
                className="block px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg"
              >
                Premium Vault
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg"
              >
                About
              </Link>
              <Link
                to="/support"
                className="block px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg"
              >
                Support
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
