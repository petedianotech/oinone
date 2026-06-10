import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function Privacy() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 bg-gray-50 dark:bg-gray-950 transition-colors"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back navigation */}
        <div className="mb-6 flex justify-start">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back Home</span>
          </Link>
        </div>

        <h1 className="font-display text-4xl font-bold text-gray-950 dark:text-white mb-4">Privacy Policy</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Last updated: June 9, 2026</p>
        
        <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
          <p>
            Welcome to Oinone ("we," "our," or "us"), created and developed by Peter Damiano. We respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy describes how we collect, use, and safeguard your information when you visit our website (oinone.com) and read our specialized publications across technology, artificial intelligence, finance, and online monetization.
          </p>

          <h2 className="font-display text-xl font-bold text-gray-950 dark:text-white mt-8 mb-2">1. Information We Collect</h2>
          <p>
            We may collect information you provide directly, such as your email address when you register for our newsletter, download guides, or contact us. We also automatically collect telemetry details via browser cookies, analytics tools, and safe logging layers to keep the site optimized and performant.
          </p>

          <h2 className="font-display text-xl font-bold text-gray-950 dark:text-white mt-8 mb-2">2. How We Use Your Information</h2>
          <p>
            We use collected data to deliver top-quality editorial content, manage subscription rosters, optimize advertisement relevance, prevent system abnormalities, and study user interaction waves so we can improve Oinone's overall experience daily.
          </p>

          <h2 className="font-display text-xl font-bold text-gray-950 dark:text-white mt-8 mb-2">3. Third-Party Integrations & Cookies</h2>
          <p>
            Oinone might leverage advanced trackers like Google Analytics or monetization utilities. These providers may use cookies and web beacons to capture anonymous engagement signals. You can toggle cookies off directly inside your individual browser settings.
          </p>

          <h2 className="font-display text-xl font-bold text-gray-950 dark:text-white mt-8 mb-2">4. Contact Information</h2>
          <p>
            For privacy inquiries or personal dataset removal requests, reach out directly at: <span className="font-semibold text-indigo-600 dark:text-indigo-400">peterleodamiano@gmail.com</span>.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
