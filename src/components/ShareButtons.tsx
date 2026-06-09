import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Share2 } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const platforms = [
    {
      name: 'WhatsApp',
      color: 'bg-[#25D366] hover:bg-[#20ba5a] text-white',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      shareUrl: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`
    },
    {
      name: 'Telegram',
      color: 'bg-[#0088cc] hover:bg-[#0077b5] text-white',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.022c.24-.213-.054-.33-.373-.117L9.815 12.6l-2.96-.924c-.643-.201-.656-.643.135-.953l11.57-4.46c.536-.196.99.117.834.958z" />
        </svg>
      ),
      shareUrl: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
    },
    {
      name: 'X',
      color: 'bg-black hover:bg-neutral-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      shareUrl: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
    },
    {
      name: 'LinkedIn',
      color: 'bg-[#0077b5] hover:bg-[#005987] text-white',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    },
    {
      name: 'Facebook',
      color: 'bg-[#1877f2] hover:bg-[#166fe5] text-white',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      name: 'Reddit',
      color: 'bg-[#ff4500] hover:bg-[#e03d00] text-white',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.28-1.72l1.32-4.14 4.26.91c.04.89.78 1.61 1.7 1.61 1.1 0 2-.9 2-2s-.9-2-2-2c-.88 0-1.62.58-1.89 1.38L13 2.1c-.13-.03-.27.02-.34.12l-1.5 4.7c-2.52.05-4.82.72-6.5 1.74C4.1 7.9 3.2 7.4 2.2 7.4c-1.65 0-3 1.35-3 3 0 .96.48 1.86 1.24 2.42-.09.38-.14.77-.14 1.18 0 3.75 4.5 6.8 10.1 6.8 5.6 0 10.1-3.05 10.1-6.8 0-.41-.05-.8-.14-1.18.76-.56 1.24-1.46 1.24-2.42zm-18 2c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5zm11.23 3.63c-.88.88-2.53.95-3.23.95-.7 0-2.35-.07-3.23-.95-.12-.12-.12-.32 0-.44s.32-.12.44 0c.66.66 1.95.74 2.79.74.84 0 2.13-.08 2.79-.74.12-.12.32-.12.44 0s.12.32 0 .44zM16.5 15c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
      ),
      shareUrl: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`
    }
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all">
      <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
        <Share2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="font-display font-medium text-sm">Share this insights article</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {platforms.map((platform) => (
          <a
            key={platform.name}
            href={platform.shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-xs cursor-pointer transition-all ${platform.color}`}
            >
              {platform.icon}
              <span>{platform.name}</span>
            </motion.div>
          </a>
        ))}
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[70%]">
          {url}
        </span>
        <motion.button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold cursor-pointer py-1 px-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
          whileTap={{ scale: 0.95 }}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy link</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
