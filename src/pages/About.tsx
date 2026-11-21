import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Globe } from 'lucide-react';

export function About() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="flex flex-col sm:flex-row gap-8 items-start mb-12">
          <img
            src="https://i.ibb.co/cXpLmLVC/20260516-210805.jpg"
            alt="Peter Damiano"
            className="w-28 h-28 rounded-full object-cover border border-zinc-200"
            width={112}
            height={112}
          />
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight mb-2">Peter Damiano</h1>
            <p className="text-indigo-600 font-medium mb-1">Founder & Editor, Oinone</p>
            <p className="text-sm text-zinc-500 mb-4">
              Developer and writer focused on practical technology, finance, and online business.
            </p>
            <div className="flex gap-4">
              <a href="https://peterdamiano.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900">
                <Globe className="w-4 h-4" /> Portfolio
              </a>
              <a href="mailto:peterleodamiano@gmail.com" className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900">
                <Mail className="w-4 h-4" /> Contact
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-[15px] leading-relaxed text-zinc-700">
          <p>
            Oinone is a focused publication on finance, technology, AI, and building online.
            The goal is clear, useful writing — not hype.
          </p>
          <p>
            For inquiries: {' '}
            <a href="mailto:peterleodamiano@gmail.com" className="text-indigo-600 hover:underline">
              peterleodamiano@gmail.com
            </a>
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">On this site</h2>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li><Link to="/finance" className="text-indigo-600 hover:underline">Finance</Link> — systems, investing basics, money habits</li>
            <li><Link to="/technology" className="text-indigo-600 hover:underline">Technology</Link> — engineering practices and infrastructure</li>
            <li><Link to="/ai" className="text-indigo-600 hover:underline">AI</Link> — practical AI for product and engineering teams</li>
            <li><Link to="/mmo" className="text-indigo-600 hover:underline">Online Business</Link> — pricing, content, and growth</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
