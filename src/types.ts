export type CategoryId = 'technology' | 'finance' | 'ai' | 'mmo';

export interface Author {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  summary?: string;
  content: string[]; // Simple string array for paragraphs for mock purpose
  categoryId: CategoryId;
  author: Author;
  date: string;
  readTime: number;
  imageUrl: string;
  images?: string[];
  featured?: boolean;
  trending?: boolean;
  likesCount?: number;
  viewsCount?: number;
  commentsCount?: number;
  isDraft?: boolean;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  provider: string; // e.g., MyLead
  payout: string;
  badgeText: string;
  clicksCount: number;
  viewsCount: number;
  status: 'active' | 'paused';
  createdAt: number;
}

export interface Category {

  id: CategoryId;
  name: string;
  description: string;
  color: string;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  status: 'active' | 'inactive';
  createdAt: number;
}
