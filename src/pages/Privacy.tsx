import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function Privacy() {
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
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-500 mb-10">Last updated: November 21, 2026</p>

        <div className="space-y-8 text-[15px] leading-relaxed text-zinc-300">
          <p>
            Oinone ("we", "our", or "us"), operated by Peter Damiano, respects your privacy.
            This Privacy Policy explains how we collect, use, and protect information when you
            visit https://oinone.co and use our services.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p className="mb-3">We may collect:</p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>Information you provide (e.g. name or email when contacting us or commenting)</li>
              <li>Usage data such as pages viewed, time on site, and referring URLs</li>
              <li>Device and browser information, IP address, and approximate location</li>
              <li>Cookies and similar technologies used for analytics and advertising</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Information</h2>
            <p className="mb-3">We use information to:</p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>Operate and improve the website and content</li>
              <li>Respond to inquiries and moderate comments</li>
              <li>Measure traffic and performance with analytics tools</li>
              <li>Display relevant advertising, including through Google AdSense</li>
              <li>Protect against abuse and ensure site security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Advertising & Cookies</h2>
            <p className="mb-3">
              We use Google AdSense and related Google advertising services to show ads.
              Google and its partners may use cookies and device identifiers to serve ads based
              on your prior visits to this and other websites.
            </p>
            <p className="mb-3">
              You can learn how Google uses data when you use partners’ sites here:{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline"
              >
                https://policies.google.com/technologies/partner-sites
              </a>
              .
            </p>
            <p className="mb-3">
              You can manage ad personalization settings at{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline"
              >
                https://adssettings.google.com
              </a>
              . You may also control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Third-Party Services</h2>
            <p>
              We use services such as Google Analytics, Google AdSense, Firebase, and hosting
              providers. These services have their own privacy policies governing the data they
              process.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention & Security</h2>
            <p>
              We retain information only as long as needed for the purposes described in this
              policy or as required by law. We apply reasonable technical and organizational
              measures to protect data, but no method of transmission or storage is completely
              secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Children’s Privacy</h2>
            <p>
              Oinone is not directed at children under 13. We do not knowingly collect personal
              information from children under 13. If you believe we have collected such
              information, please contact us so we can delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Your Choices</h2>
            <p>
              You may request access to, correction of, or deletion of personal information we
              hold about you by emailing us. You can also disable cookies in your browser,
              though some site features may not work fully.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Contact</h2>
            <p>
              For privacy questions or requests, contact:{' '}
              <a
                href="mailto:peterleodamiano@gmail.com"
                className="text-indigo-400 hover:underline"
              >
                peterleodamiano@gmail.com
              </a>
            </p>
            <p className="mt-2 text-zinc-500">
              Site operator: Peter Damiano · https://oinone.co
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Changes</h2>
            <p>
              We may update this Privacy Policy from time to time. The “Last updated” date at
              the top will reflect the latest revision. Continued use of the site after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
