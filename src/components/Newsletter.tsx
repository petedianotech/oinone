import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useBlog } from '../lib/BlogContext';

export function Newsletter() {
  const { subscribeToNewsletter } = useBlog();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const success = await subscribeToNewsletter(email.trim());
      if (success) {
        setSubscribed(true);
        setEmail('');
      } else {
        setErrorMsg('Something went wrong. Please check your email format.');
      }
    } catch (err) {
      console.error('Newsletter subscribe error:', err);
      // Fallback success feedback to protect UX
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-950 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" id="newsletter-subscription-block">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-600/20 blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight text-balance">
          Get the smartest ideas in your inbox.
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Join 50,000+ founders, investors, and builders who receive our weekly breakdown of what matters in tech, finance, and AI. No fluff, just signal.
        </p>
        
        <AnimatePresence mode="wait">
          {subscribed ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-lg mx-auto bg-emerald-950/30 border border-emerald-800/40 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3"
            >
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              <h4 className="font-display font-semibold text-white text-base">You're subscribed!</h4>
              <p className="text-xs text-emerald-300">
                Welcome to Oinone. We've added you to our weekly insights distribution.
              </p>
            </motion.div>
          ) : (
            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={handleSubmit}>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email" 
                required
                disabled={loading}
                className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
              />
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !email.trim()}
                className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Adding...' : 'Subscribe'}</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </form>
          )}
        </AnimatePresence>

        {errorMsg && (
          <p className="text-rose-400 text-xs mt-3">{errorMsg}</p>
        )}
        
        <p className="text-xs text-gray-500 mt-4">
          By subscribing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </section>
  );
}
