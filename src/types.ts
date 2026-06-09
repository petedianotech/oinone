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
  content: string[]; // Simple string array for paragraphs for mock purpose
  categoryId: CategoryId;
  author: Author;
  date: string;
  readTime: number;
  imageUrl: string;
  featured?: boolean;
  trending?: boolean;
}

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  color: string;
}
