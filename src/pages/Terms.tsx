import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function Terms() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-zinc-500 mb-10">Last updated: November 21, 2026</p>

        <div className="space-y-8 text-[15px] leading-relaxed text-zinc-300">
          <p>
            These Terms of Service ("Terms") govern your access to and use of https://oinone.co
            and related services operated by Peter Damiano ("Oinone", "we", "us"). By using the
            site, you agree to these Terms.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Use of the Site</h2>
            <p>
              You may use Oinone for personal, non-commercial reading and learning. You agree
              not to misuse the site, attempt to disrupt it, scrape content at scale, or use it
              for any unlawful purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Content & Intellectual Property</h2>
            <p>
              Articles, design, logos, and other materials on Oinone are owned by Peter Damiano
              or licensed to us. You may share links and short excerpts with attribution. You may
              not copy, republish, or commercially exploit full articles without written
              permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. No Professional Advice</h2>
            <p>
              Content on finance, investing, technology, AI, and online business is for
              informational and educational purposes only. It is not financial, legal, tax, or
              investment advice. Always consult qualified professionals before making decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. User Contributions</h2>
            <p>
              If you post comments or other content, you grant us a non-exclusive license to
              display and moderate that content. You are responsible for what you post. We may
              remove content that is abusive, spam, or unlawful.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Advertising</h2>
            <p>
              The site may display third-party advertisements, including Google AdSense. Ads are
              provided by third parties and we do not control their content. Your interactions
              with advertisers are solely between you and them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Disclaimer of Warranties</h2>
            <p>
              The site is provided "as is" without warranties of any kind, express or implied.
              We do not guarantee uninterrupted or error-free operation, or that content is
              always accurate or complete.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Oinone and Peter Damiano shall not be
              liable for any indirect, incidental, special, or consequential damages arising from
              your use of the site or reliance on its content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Changes</h2>
            <p>
              We may update these Terms from time to time. Continued use after changes means you
              accept the updated Terms. The "Last updated" date will reflect the latest version.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Contact</h2>
            <p>
              Questions about these Terms:{' '}
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
