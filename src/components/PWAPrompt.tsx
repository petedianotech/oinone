import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, HardDrive, X, Share, Plus, CheckCircle, Smartphone } from 'lucide-react';

export function PWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showiOSGuide, setShowiOSGuide] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission | 'not-supported' | 'checking'>('checking');
  const [inAppStatus, setInAppStatus] = useState<'idle' | 'success'>('idle');

  useEffect(() => {
    // 1. Check if first visit
    const isFirstVisit = !localStorage.getItem('oinone_prompt_v2_dismissed');
    if (isFirstVisit) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1500); // Exquisite transition delay
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // 2. Detect iOS Device
    const detectIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIOSDevice);
    };
    detectIOS();

    // 3. Listen for browser PWA candidate event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Initial notification support check
    if (!('Notification' in window)) {
      setNotificationStatus('not-supported');
    } else {
      setNotificationStatus(Notification.permission);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowiOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback guide if prompt not received but they clicked install manually
      alert("Instructions: To install Oinone, select 'Add to Home screen' or 'Install' from your browser settings.");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the Oinone install prompt.');
      setIsInstallable(false);
      setDeferredPrompt(null);
      // Automatically record dismissed State as they completed action
      localStorage.setItem('oinone_prompt_v2_dismissed', 'true');
      setShowPrompt(false);
    }
  };

  const handleNotificationRequest = async () => {
    if (!('Notification' in window)) {
      setInAppStatus('success');
      setTimeout(() => setInAppStatus('idle'), 4000);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === 'granted') {
        const _notification = new Notification("Oinone Insights Enabled!", {
          body: "You're all set! You will now receive premium technology, AI, and finance publications immediately.",
          icon: "/oinone_blog_icon.jpg"
        });
      }
      setInAppStatus('success');
      setTimeout(() => setInAppStatus('idle'), 4000);
    } catch (err) {
      console.warn('Native notification request failed, setting fallback active.', err);
      setInAppStatus('success');
      setTimeout(() => setInAppStatus('idle'), 4000);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('oinone_prompt_v2_dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 z-50 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl backdrop-blur-lg"
        id="pwa-notification-prompt"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Dismiss Notification"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <img
              src="/oinone_blog_icon.jpg"
              alt="Oinone App Logo"
              className="h-12 w-12 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h4 className="font-display font-semibold text-base text-gray-950 dark:text-white leading-tight">
              Get Oinone App & Alerts
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Install our premium blog directly to your home screen for easy offline access and unlock real-time post notifications!
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 space-y-2.5">
          {/* 1. Install Action */}
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <HardDrive className="h-4 w-4" />
            Install on Mobile / Desktop
          </button>

          {/* 2. Notification Action */}
          <button
            onClick={handleNotificationRequest}
            disabled={notificationStatus === 'granted' || inAppStatus === 'success'}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
              notificationStatus === 'granted' || inAppStatus === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-750 border-gray-200 dark:border-gray-750 text-gray-700 dark:text-gray-350 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            {notificationStatus === 'granted' || inAppStatus === 'success' ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Notifications Enabled!
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                Subscribe to Post Alerts
              </>
            )}
          </button>
        </div>

        {/* Subtitle / Bottom Info */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800/60 pt-3">
          <span className="text-[10px] uppercase tracking-wider font-mono text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <Smartphone className="h-3 w-3" /> Progressive Web App
          </span>
          <button
            onClick={() => setShowiOSGuide(!showiOSGuide)}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
          >
            iOS Guide
          </button>
        </div>

        {/* iOS Step-by-Step Installation Guide Drawer */}
        {(showiOSGuide || showPrompt && isIOS && !showiOSGuide) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden mt-3 bg-gray-50 dark:bg-gray-950 rounded-xl p-3 border border-gray-100 dark:border-gray-850"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-gray-850 dark:text-gray-200 uppercase tracking-wide">
                iOS Safari Setup:
              </span>
              <button 
                onClick={() => setShowiOSGuide(false)} 
                className="text-gray-400 hover:text-gray-600 text-[10px] cursor-pointer"
              >
                Hide Guide
              </button>
            </div>
            <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 list-none pl-0">
              <li className="flex items-center gap-2">
                <span className="flex items-center justify-center h-4.5 w-4.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-350 text-[10px] font-bold">1</span>
                <span>Open browser options panel</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex items-center justify-center h-4.5 w-4.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-350 text-[10px] font-bold">2</span>
                <span className="inline-flex items-center gap-1">
                  Tap the sharing button <Share className="h-3 w-3 inline text-gray-500" />
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex items-center justify-center h-4.5 w-4.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-350 text-[10px] font-bold">3</span>
                <span className="inline-flex items-center gap-1">
                  Scroll down and choose <Plus className="h-3 w-3 inline text-gray-600" /> <strong>Add to Home Screen</strong>
                </span>
              </li>
            </ol>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
