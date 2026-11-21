import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function Disclaimer() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight mb-3">Disclaimer</h1>
        <p className="text-sm text-zinc-500 mb-10">Last updated: November 21, 2026</p>

        <div className="space-y-8 text-[15px] leading-relaxed text-zinc-700">
          <p>Information on Oinone is for general informational and educational purposes only.</p>
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Financial content</h2>
            <p>Not financial, investment, tax, or legal advice. Consult a licensed advisor before investing.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Affiliate & advertising</h2>
            <p>We may earn from affiliate links or ads (including Google AdSense). This does not change the price you pay.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Contact</h2>
            <p>
              <a href="mailto:peterleodamiano@gmail.com" className="text-indigo-600 hover:underline">peterleodamiano@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
