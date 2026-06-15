import React, { useEffect, useState, useRef } from 'react';
import { Heart, Globe2, Server } from 'lucide-react';
import { motion } from 'motion/react';

declare global {
  interface Window {
    paypal?: any;
  }
}

export function Support() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const renderAttemptedRef = useRef(false);

  useEffect(() => {
    // Load the PayPal SDK script
    const scriptId = 'paypal-sdk-script';
    
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.paypal.com/sdk/js?client-id=BAAL-FifzsZeAnSfH0vuzCmO_pPcST2YkMOogM3Uur9NJZk4De2Wuruds1TjDX-y6zQ2AMHph7qawuaoU8&components=hosted-buttons&disable-funding=venmo&currency=USD';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (scriptLoaded && window.paypal && window.paypal.HostedButtons && !renderAttemptedRef.current) {
      // Delay rendering slightly to ensure Framer Motion animations are finished
      // and the DOM element is fully sized before PayPal measures it.
      const timer = setTimeout(() => {
        try {
          const container = document.getElementById("paypal-container-QULNHX6CX92EG");
          if (container) {
            container.innerHTML = ""; // Clear any partial/stale builds
            window.paypal.HostedButtons({
              hostedButtonId: "QULNHX6CX92EG"
            }).render("#paypal-container-QULNHX6CX92EG");
            renderAttemptedRef.current = true;
          }
        } catch (err) {
          console.error("Failed to render PayPal button:", err);
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [scriptLoaded]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] pt-28 pb-20 px-6 sm:px-12 relative overflow-hidden transition-colors duration-200">
      {/* Background aesthetics */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-purple/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-6 tracking-tight">
            Support The Mission
          </h1>
          <p className="text-xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto">
            I'm Peter Leo Damiano, a 19-year-old creator from Malawi. Your support keeps this platform alive.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Story & Context */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="prose prose-lg prose-invert prose-p:text-gray-400 prose-p:leading-relaxed">
              <p>
                My goal is to build a platform that educates, empowers, and helps others navigate the world of technology, finance, and online business. 
              </p>
              <p>
                As a young developer building this from Malawi, maintaining cutting-edge infrastructure—like high-speed hosting, AI tool integrations, and secure databases—is challenging to fund independently.
              </p>
              <p>
                Any amount you contribute goes directly towards server costs, domain renewals, and improving the experience for everyone. It pushes me to keep building and sharing knowledge freely. 
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-none">
                <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5 text-brand-cyan" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Hosting</h4>
                  <p className="text-xs text-gray-400">Server & infrastructure</p>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-none">
                <div className="w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center shrink-0">
                  <Globe2 className="w-5 h-5 text-brand-purple" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Access</h4>
                  <p className="text-xs text-gray-400">Keeping content free</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Thank you for believing in my vision.</span>
            </div>
          </motion.div>

          {/* Payment Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 rounded-full blur-[80px]" />
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Make a Contribution</h3>
                <p className="text-gray-400 text-sm mb-8">
                  Choose a custom amount that feels right to you. Securely processed by PayPal.
                </p>

                {/* PayPal Container */}
                <div className="min-h-[150px] bg-black/20 rounded-2xl border border-white/5 p-6 relative z-20">
                  <div 
                    id="paypal-container-QULNHX6CX92EG" 
                    className="w-full relative z-20 block" 
                  />
                </div>

                {/* Additional Paychangu link for regional options */}
                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                  <p className="text-xs text-gray-400 mb-3">Or support via local channels:</p>
                  <a 
                    href="https://give.paychangu.com/dc-wnczzv" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-bold text-white border border-white/5 cursor-pointer"
                  >
                    Support via Paychangu
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 max-w-2xl mx-auto"
        >
          <h3 className="text-2xl font-display font-bold text-white mb-8 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-none">
              <h4 className="font-bold text-white mb-2">Is my payment secure?</h4>
              <p className="text-sm text-gray-400">Yes, all payments are securely processed by PayPal. We don't store or see any of your credit card details or financial information.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-none">
              <h4 className="font-bold text-white mb-2">Can I make a one-time donation?</h4>
              <p className="text-sm text-gray-400">Yes! The payment portal allows you to make a one-time contribution of your chosen amount.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-none">
              <h4 className="font-bold text-white mb-2">How exactly is the money used?</h4>
              <p className="text-sm text-gray-400">Contributions go directly toward server costs, database maintenance, premium tool subscriptions, and general operations to keep the content accessible.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-none">
              <h4 className="font-bold text-white mb-2">Are there other ways to support?</h4>
              <p className="text-sm text-gray-400">Absolutely! Sharing the blog with your network, engaging with the content, and joining the community are incredible ways to show support.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
