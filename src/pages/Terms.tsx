import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function Terms() {
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

        <h1 className="font-display text-4xl font-bold text-gray-950 dark:text-white mb-4">Terms of Service</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Last updated: June 9, 2026</p>
        
        <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
          <p>
            Welcome to Oinone. These Terms of Service ("Terms") govern your access to and general usage of the blog platforms, sub-domain routes (including /finance, /technology, /ai, /mmo), email bulletins, and systems provided by Oinone. By reading our content, you accept and agree to be bound by these Terms completely.
          </p>

          <h2 className="font-display text-xl font-bold text-gray-950 dark:text-white mt-8 mb-2">1. Intellectual Property & License</h2>
          <p>
            All text guides, vector logos, and design coordinates are the exclusive property of Oinone and Peter Damiano (petediano). You are granted a limited, personal, non-commercial, revocable privilege to view our articles. You are strictly forbidden from scraping or redistributing copy without explicit sign-off from Peter.
          </p>

          <h2 className="font-display text-xl font-bold text-gray-950 dark:text-white mt-8 mb-2">2. Accuracy of Financial & Technical Information</h2>
          <p>
            Articles covering Finance and Make Money Online are published strictly for creative, analytical, and illustrative educational purposes. None of our articles compile official financial, investing, taxation, or legal advice. Consult certified authorities before executing investments or critical system overrides.
          </p>

          <h2 className="font-display text-xl font-bold text-gray-950 dark:text-white mt-8 mb-2">3. Limitation of Liability</h2>
          <p>
            In no scenario shall Oinone or its parent architects be liable for actions taken based on our market reports, research, or product recommendations. Oinone is provided on an "as-is" baseline without implicit warrants or uptime guarantees.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
