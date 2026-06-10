import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pb-12 pt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 inline-block">
              <span className="font-display font-bold text-2xl tracking-tighter text-gray-950 dark:text-white">
                Oinone<span className="text-indigo-600">.</span>
              </span>
            </Link>
             <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              A premium space for deep dives into Finance, Technology, AI, and the creator economy. 
              The all-in-one resource for the modern builder.
            </p>
          </div>
          
          <div>
            <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Sections</h3>
            <ul className="space-y-3">
              <li><Link to="/finance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Finance & Markets</Link></li>
              <li><Link to="/technology" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Technology</Link></li>
              <li><Link to="/ai" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Artificial Intelligence</Link></li>
              <li><Link to="/mmo" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Online Business</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">About Us</Link></li>
              <li><a href="https://peterdamiano.vercel.app" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Creator Portfolio</a></li>
              <li><Link to="/admin" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Admin</Link></li>
              <li><a href="mailto:petedianotech@gmail.com" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Contact</a></li>
            </ul>
          </div>
        </div>
        
        {/* Centered Premium Admin Command Console Access Button at bottom */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-center">
          <Link 
            to="/admin" 
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-505 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-indigo-500/10"
          >
            <Shield className="w-4 h-4 text-indigo-200" />
            <span>Secure Admin Command Center</span>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Oinone Media. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Terms of Service</Link>
            <Link to="/disclaimer" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
