import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function Terms() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight mb-3">Terms of Service</h1>
        <p className="text-sm text-zinc-500 mb-10">Last updated: November 21, 2026</p>

        <div className="space-y-8 text-[15px] leading-relaxed text-zinc-700">
          <p>
            These Terms govern your access to https://oinone.co operated by Peter Damiano.
            By using the site, you agree to these Terms.
          </p>
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">1. Use of the Site</h2>
            <p>You may use Oinone for personal, non-commercial reading. Do not misuse the site, scrape content at scale, or use it unlawfully.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">2. Content & Intellectual Property</h2>
            <p>Articles and design are owned by Peter Damiano. You may share links and short excerpts with attribution. Do not republish full articles without permission.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">3. No Professional Advice</h2>
            <p>Content is informational only — not financial, legal, or investment advice. Consult qualified professionals before decisions.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">4. Advertising</h2>
            <p>The site may display third-party ads including Google AdSense. Your interactions with advertisers are between you and them.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">5. Contact</h2>
            <p>
              <a href="mailto:peterleodamiano@gmail.com" className="text-indigo-600 hover:underline">peterleodamiano@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
