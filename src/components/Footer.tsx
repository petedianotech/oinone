import { Link } from 'react-router-dom';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-1.5">
              <span className="font-semibold text-lg tracking-tight text-zinc-900">
                Oinone
              </span>
            </Link>
            <p className="mt-4 text-sm text-zinc-500 leading-relaxed max-w-xs">
              Clear writing on finance, technology, AI, and building online.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Topics
            </h3>
            <ul className="space-y-3">
              <li><Link to="/finance" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Finance</Link></li>
              <li><Link to="/technology" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Technology</Link></li>
              <li><Link to="/ai" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Artificial Intelligence</Link></li>
              <li><Link to="/mmo" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Online Business</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">About</Link></li>
              <li>
                <a href="https://peterdamiano.vercel.app" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                  Creator
                </a>
              </li>
              <li><Link to="/support" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Support</Link></li>
              <li>
                <a href="mailto:peterleodamiano@gmail.com" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li><Link to="/privacy-policy" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Terms of Service</Link></li>
              <li><Link to="/disclaimer" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-400">© {year} Oinone. All rights reserved.</p>
          <p className="text-xs text-zinc-400">Built for clarity and depth.</p>
        </div>
      </div>
    </footer>
  );
}
