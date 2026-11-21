import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function Disclaimer() {
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

        <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-3">
          Disclaimer
        </h1>
        <p className="text-sm text-zinc-500 mb-10">Last updated: November 21, 2026</p>

        <div className="space-y-8 text-[15px] leading-relaxed text-zinc-300">
          <p>
            The information on Oinone is provided for general informational and educational
            purposes only. It should not be relied upon as professional advice.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Financial & Investment Content</h2>
            <p>
              Articles about markets, investing, personal finance, or making money online are
              not financial, investment, tax, or legal advice. Past performance does not
              guarantee future results. You are solely responsible for your financial decisions.
              Consult a licensed advisor before investing or changing your financial plans.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Technology & AI Content</h2>
            <p>
              Technical explanations, product discussions, and AI-related content reflect the
              author’s understanding at the time of writing. Technology changes quickly. Always
              verify details against official documentation and current best practices before
              implementing anything in production.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Affiliate & Advertising</h2>
            <p>
              Oinone may contain affiliate links or third-party advertisements (including Google
              AdSense). We may earn a commission or revenue if you click or purchase through
              those links. This does not affect the price you pay. We aim for honest coverage
              and disclose relationships where appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">External Links</h2>
            <p>
              The site may link to external websites. We are not responsible for the content,
              accuracy, or practices of third-party sites. Visiting them is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">No Warranties</h2>
            <p>
              Content is provided "as is" without warranties of completeness, accuracy, or
              fitness for a particular purpose. Oinone and Peter Damiano accept no liability for
              any loss or damage arising from use of or reliance on the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>
              Questions:{' '}
              <a
                href="mailto:peterleodamiano@gmail.com"
                className="text-indigo-400 hover:underline"
              >
                peterleodamiano@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
