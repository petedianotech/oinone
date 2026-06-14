import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORIES = {
  technology: { id: 'technology', name: 'Technology', color: 'bg-blue-500 text-blue-50', description: 'The latest in software, hardware, and tech culture.' },
  finance: { id: 'finance', name: 'Finance', color: 'bg-emerald-500 text-emerald-50', description: 'Markets, personal finance, and economic trends.' },
  ai: { id: 'ai', name: 'Artificial Intelligence', color: 'bg-indigo-500 text-indigo-50', description: 'Machine learning, generative AI, and the future of work.' },
  mmo: { id: 'mmo', name: 'Make Money Online', color: 'bg-amber-500 text-amber-50', description: 'Digital entrepreneurship, side hustles, and e-commerce.' },
} as const;

export function getCategory(id: string) {
  return CATEGORIES[id as keyof typeof CATEGORIES] || CATEGORIES.technology;
}

export function optimizeImageUrl(url: string | undefined, width = 800): string {
  if (!url) return '';
  
  // 1. Unsplash optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('auto', 'format');
      parsedUrl.searchParams.set('q', '80');
      parsedUrl.searchParams.set('w', width.toString());
      parsedUrl.searchParams.set('fit', 'crop');
      return parsedUrl.toString();
    } catch (e) {
      if (url.includes('?')) {
        return `${url}&auto=format&q=80&w=${width}&fit=crop`;
      }
      return `${url}?auto=format&q=80&w=${width}&fit=crop`;
    }
  }
  
  // 2. Cloudinary optimization
  if (url.includes('res.cloudinary.com')) {
    if (url.includes('/upload/')) {
      return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
    }
  }

  // 3. Fallback to original URL
  return url;
}

