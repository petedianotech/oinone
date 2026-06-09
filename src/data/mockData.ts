import { CategoryId, Post } from '../types';

export const AUTHORS = {
  alex: {
    id: 'alex',
    name: 'Peter Damiano',
    avatar: 'https://i.ibb.co/cXpLmLVC/20260516-210805.jpg',
    role: 'Senior Tech Editor'
  },
  sarah: {
    id: 'sarah',
    name: 'Peter Damiano',
    avatar: 'https://i.ibb.co/cXpLmLVC/20260516-210805.jpg',
    role: 'AI Research Director'
  },
  marcus: {
    id: 'marcus',
    name: 'Peter Damiano',
    avatar: 'https://i.ibb.co/cXpLmLVC/20260516-210805.jpg',
    role: 'Senior Financial Analyst'
  },
  elena: {
    id: 'elena',
    name: 'Peter Damiano',
    avatar: 'https://i.ibb.co/cXpLmLVC/20260516-210805.jpg',
    role: 'Digital Entrepreneur'
  }
};

const sampleContent = [
  "In today's rapidly evolving digital landscape, staying ahead of the curve is no longer optional—it's a requirement for survival. As we navigate through unprecedented technological shifts, we're seeing patterns emerge that will define the next decade of innovation.",
  "Consider the foundational changes we're witnessing. Traditional models are being disrupted not just by new technology, but by entirely new ways of thinking about problem-solving. This isn't just an iteration; it's a paradigm shift.",
  "The implications are profound. Organizations that adapt are finding themselves with distinct competitive advantages, while those that hesitate are struggling to maintain relevance in an increasingly fast-paced environment.",
  "Looking ahead, the successful entities will be those that embrace continuous learning and remain agile. We'll be closely monitoring these developments as they unfold."
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'ai-future-gpt5',
    title: 'The Road to AGI: What GPT-5 Means for the Global Economy',
    excerpt: 'As organizations rush to integrate generative capabilities, the next iteration of foundational models promises to shift paradigms across every sector.',
    categoryId: 'ai',
    author: AUTHORS.sarah,
    date: 'Oct 12, 2024',
    readTime: 8,
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1600&auto=format&fit=crop',
    featured: true,
    trending: true,
    content: [
      "The whispers in Silicon Valley have grown into a roar. The next generation of foundational AI models is closer than we anticipated, and its implications extend far beyond simple text generation or coding assistance.",
      "Experts suggest that models exhibiting sparks of artificial general intelligence (AGI) could fundamentally reorganize global knowledge work within the next 36 months.",
      ...sampleContent
    ]
  },
  {
    id: 'tech-quantum-computing',
    title: 'Quantum Advantage: Navigating the Next Computing Era',
    excerpt: 'A deep dive into how near-term quantum processors will revolutionize cryptography, logistics, and material science.',
    categoryId: 'technology',
    author: AUTHORS.alex,
    date: 'Oct 14, 2024',
    readTime: 12,
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1600&auto=format&fit=crop',
    featured: true,
    content: [
      "For decades, quantum computing has been the technology of 'tomorrow'. But recent breakthroughs in error correction suggest tomorrow is finally arriving.",
      "Traditional RSA encryption, the bedrock of internet security, faces an existential threat. But more exciting is the potential for discovering new molecules and optimizing global supply chains.",
      ...sampleContent
    ]
  },
  {
    id: 'finance-interest-rates',
    title: 'Navigating the New Normal: High Interest Rates and Tech Valuations',
    excerpt: 'How the shift away from zero-interest-rate policy is forcing startups and giants alike to fundamentally change their business models.',
    categoryId: 'finance',
    author: AUTHORS.marcus,
    date: 'Oct 10, 2024',
    readTime: 6,
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1600&auto=format&fit=crop',
    trending: true,
    content: [
      "The era of 'growth at all costs' has officially concluded. As central banks maintain higher rates to combat stubborn inflation, the cost of capital has normalized, changing the startup playbook overnight.",
      "Founders are now pivoting aggressively toward profitability, unit economics, and sustainable growth. The days of subsidizing user acquisition with endless venture capital are behind us.",
      ...sampleContent
    ]
  },
  {
    id: 'mmo-newsletter-empire',
    title: 'Building a Million-Dollar Media Empire with Just a Newsletter',
    excerpt: 'The step-by-step framework used by independent writers to build highly profitable, lean media businesses leveraging minimal technology.',
    categoryId: 'mmo',
    author: AUTHORS.elena,
    date: 'Oct 15, 2024',
    readTime: 7,
    imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1600&auto=format&fit=crop',
    featured: true,
    trending: true,
    content: [
      "The most lucrative asset on the internet right now isn't an app or a complex SaaS product—it's attention. And the most direct line to attention is the inbox.",
      "We analyzed 50 of the top-earning independent newsletters. The surprising conclusion? Technical sophistication correlates inversely with revenue. Simplicity is scaling.",
      ...sampleContent
    ]
  },
  {
    id: 'ai-enterprise-adoption',
    title: 'Why Enterprise AI Adoption is Failing (And How to Fix It)',
    excerpt: 'Companies are spending millions on AI initiatives with little to show for it. Here is the operational missing link.',
    categoryId: 'ai',
    author: AUTHORS.sarah,
    date: 'Oct 08, 2024',
    readTime: 9,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop',
    trending: true,
    content: [
      "Every Fortune 500 board is mandating 'AI strategy'. But injecting LLMs into legacy enterprise workflows is proving significantly harder than running a flashy demo.",
      "The issue isn't the technology—it's the data infrastructure architecture and the extreme cultural friction of changing how employees work.",
      ...sampleContent
    ]
  },
  {
    id: 'finance-etf-boom',
    title: 'The Rise of Active ETFs: A Threat to Traditional Mutual Funds?',
    excerpt: 'An analysis of market flows from legacy mutual fund structures to the more tax-efficient and liquid ETF vehicles.',
    categoryId: 'finance',
    author: AUTHORS.marcus,
    date: 'Oct 05, 2024',
    readTime: 5,
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1600&auto=format&fit=crop',
    content: [
      "The massive migration of wealth out of mutual funds and into ETFs is accelerating. What began as a shift toward passive index tracking has evolved.",
      "Now, active managers are wrapping their strategies in the ETF structure, offering investors the holy grail: active management with intraday liquidity and minimal capital gains friction.",
      ...sampleContent
    ]
  },
  {
    id: 'mmo-saas-micro',
    title: 'The Micro-SaaS Playbook: $10k MRR as a Solo Developer',
    excerpt: 'How developers are abandoning the venture path to build focused, profitable B2B tools for specific niches.',
    categoryId: 'mmo',
    author: AUTHORS.elena,
    date: 'Oct 02, 2024',
    readTime: 10,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1600&auto=format&fit=crop',
    content: [
      "The dream of building the next unicorn is being replaced by a more pragmatic goal: independent wealth through Micro-SaaS.",
      "By focusing on ultra-specific niche problems—like scheduling software for pet groomers, or invoicing for freelance designers—solo founders are building highly profitable machines.",
      ...sampleContent
    ]
  },
  {
    id: 'tech-spatial-computing',
    title: 'Beyond the Screen: The Next Generation of Spatial Computing',
    excerpt: 'Augmented reality is finally growing up. How new hardware is shifting us from mobile-first to environment-first design.',
    categoryId: 'technology',
    author: AUTHORS.alex,
    date: 'Sep 28, 2024',
    readTime: 11,
    imageUrl: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?q=80&w=1600&auto=format&fit=crop',
    content: [
      "We've spent the last two decades looking down at rectangles of glass. The next computing paradigm aims to integrate digital information seamlessly into our physical environment.",
      "Advances in eye-tracking, passthrough cameras, and micro-OLED displays have effectively solved the hardware bottleneck. The race is now on the software layer.",
      ...sampleContent
    ]
  }
];

export const getPost = (id: string) => MOCK_POSTS.find(p => p.id === id);
export const getCategoryPosts = (categoryId: CategoryId) => MOCK_POSTS.filter(p => p.categoryId === categoryId);
export const getFeaturedPosts = () => MOCK_POSTS.filter(p => p.featured);
export const getTrendingPosts = () => MOCK_POSTS.filter(p => p.trending);
