import { Link } from 'react-router-dom';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800 bg-[#0a0a0b]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-1.5">
              <span className="font-semibold text-lg tracking-tight text-white">
                Oinone
              </span>
            </Link>
            <p className="mt-4 text-sm text-zinc-500 leading-relaxed max-w-xs">
              Clear, practical writing on finance, technology, AI, and building online.
            </p>
          </div>

          {/* Topics */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Topics
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/finance" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Finance
                </Link>
              </li>
              <li>
                <Link to="/technology" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Technology
                </Link>
              </li>
              <li>
                <Link to="/ai" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Artificial Intelligence
                </Link>
              </li>
              <li>
                <Link to="/mmo" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Online Business
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a
                  href="https://peterdamiano.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  Creator
                </a>
              </li>
              <li>
                <Link to="/support" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <a
                  href="mailto:peterleodamiano@gmail.com"
                  className="text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy-policy" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600">
            © {year} Oinone. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">
            Built for clarity and depth.
          </p>
        </div>
      </div>
    </footer>
  );
}
