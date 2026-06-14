import { useEffect, useState } from 'react';
import { WifiOff, Wifi, CloudLightning, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function OfflineNotification() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'offline' | 'online' | 'none'>('none');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setToastType('online');
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setToastType('offline');
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check: if already offline at load
    if (!navigator.onLine) {
      setToastType('offline');
      setShowToast(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showToast) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.3 }}
        className="fixed top-24 right-6 left-6 md:left-auto md:w-80 z-50 p-4 rounded-2xl shadow-xl backdrop-blur-md border text-xs"
        id="offline-state-notification"
        style={{
          backgroundColor: toastType === 'offline' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          borderColor: toastType === 'offline' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
          color: toastType === 'offline' ? '#fca5a5' : '#a7f3d0'
        }}
      >
        <div className="flex gap-3 justify-between items-start">
          <div className="flex gap-2.5 items-start">
            <div className="mt-0.5 shrink-0">
              {toastType === 'offline' ? (
                <WifiOff className="h-4 w-4 text-red-450" />
              ) : (
                <Wifi className="h-4 w-4 text-emerald-450" />
              )}
            </div>
            <div>
              <p className="font-bold text-gray-150 dark:text-gray-100 flex items-center gap-1">
                {toastType === 'offline' ? 'Browsing Offline Safely' : 'Back Online!'}
              </p>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                {toastType === 'offline' 
                  ? "Your connection went sleep. Oinone's local caching keeps our full analytical vault loaded and instantly responsive."
                  : "Excellent! Real-time state synchronization has resumed successfully with Firestore cloud backend servers."
                }
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowToast(false)}
            className="text-gray-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
