import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: 'Finance', path: '/finance' },
    { name: 'Technology', path: '/technology' },
    { name: 'Make Money Online', path: '/mmo' },
    { name: 'AI', path: '/ai' },
    { name: 'About Us', path: '/about' },
  ];

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
          <nav className="hidden md:flex space-x-8">
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
            <button className="text-gray-400 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer">
              <Search className="h-5 w-5" />
            </button>
            
            <ThemeToggle />

            <button className="bg-gray-950 text-white dark:bg-white dark:text-gray-950 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors cursor-pointer">
              Subscribe
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-3 md:hidden">
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

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-lg"
        >
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {link.name}
            </Link>
          ))}
          <div className="px-3 py-4">
            <button className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md text-base font-medium hover:bg-indigo-700">
              Subscribe to Newsletter
            </button>
          </div>
        </motion.div>
      )}
    </header>
  );
}
