import { motion } from 'motion/react';

export function Disclaimer() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 bg-gray-50 dark:bg-gray-950 transition-colors"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-display text-4xl font-bold text-gray-950 dark:text-white mb-4">Disclaimer</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Last updated: June 9, 2026</p>
        
        <div className="prose prose-indigo dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
          <p>
            Oinone, a platform created and developed exclusively by Peter Damiano, offers educational content. 
            All content generated, including AI-assisted materials, are provided for informational and educational purposes only.
          </p>

          <h2 className="font-display text-xl font-bold text-gray-950 dark:text-white mt-8 mb-2">1. No Professional Advice</h2>
          <p>
            The content on this website does not constitute financial, investment, legal, or other professional advice. 
            Always seek the guidance of a qualified professional regarding financial decisions or any subject matter discussed on Oinone.
          </p>

          <h2 className="font-display text-xl font-bold text-gray-950 dark:text-white mt-8 mb-2">2. AI-Generated Content</h2>
          <p>
            Some articles and visual content on Oinone may be generated or assisted by artificial intelligence. While Peter Damiano reviews all content before publication to ensure quality and relevance, we make no representations or warranties of any kind regarding the absolute accuracy or completeness of such content.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
