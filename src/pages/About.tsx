import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Globe } from 'lucide-react';

export function About() {
  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="flex flex-col sm:flex-row gap-8 items-start mb-12">
          <img
            src="https://i.ibb.co/cXpLmLVC/20260516-210805.jpg"
            alt="Peter Damiano"
            className="w-28 h-28 rounded-full object-cover border border-zinc-800"
            width={112}
            height={112}
          />
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
              Peter Damiano
            </h1>
            <p className="text-indigo-400 font-medium mb-1">Founder & Editor, Oinone</p>
            <p className="text-sm text-zinc-500 mb-4">
              Developer, product builder, and writer focused on practical technology, finance, and online business.
            </p>
            <div className="flex gap-3">
              <a
                href="https://peterdamiano.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4" /> Portfolio
              </a>
              <a
                href="mailto:peterleodamiano@gmail.com"
                className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" /> Contact
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-[15px] leading-relaxed text-zinc-300">
          <p>
            Oinone is a focused publication on finance, technology, artificial intelligence, and building online.
            The goal is clear, useful writing — not hype.
          </p>
          <p>
            Articles are written for builders, operators, and readers who want practical frameworks they can apply.
            Topics range from personal finance systems and investing psychology to production AI, web performance, and digital product strategy.
          </p>
          <p>
            The site is independently operated. For inquiries, partnerships, or corrections, email{' '}
            <a href="mailto:peterleodamiano@gmail.com" className="text-indigo-400 hover:underline">
              peterleodamiano@gmail.com
            </a>.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-4">On this site</h2>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>
              <Link to="/finance" className="hover:text-white transition-colors">Finance</Link>
              {' — '}systems, investing basics, and money habits
            </li>
            <li>
              <Link to="/technology" className="hover:text-white transition-colors">Technology</Link>
              {' — '}engineering practices and product infrastructure
            </li>
            <li>
              <Link to="/ai" className="hover:text-white transition-colors">Artificial Intelligence</Link>
              {' — '}practical AI for product and engineering teams
            </li>
            <li>
              <Link to="/mmo" className="hover:text-white transition-colors">Online Business</Link>
              {' — '}pricing, content, and product-led growth
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
