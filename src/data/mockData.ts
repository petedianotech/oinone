import { CategoryId, Post } from '../types';

export const AUTHORS = {
  peter: {
    id: 'peter-admin',
    name: 'Peter Damiano',
    avatar: 'https://i.ibb.co/cXpLmLVC/20260516-210805.jpg',
    role: 'AI Editor & Product Architect'
  }
};

export const MOCK_POSTS: Post[] = [
  {
    id: 'gemini-xprize-hackathon',
    title: 'Architecting the Future: Inside the Google Gemini x XPRIZE Hackathon',
    excerpt: 'Exploring the frontier of multi-modal native reasoning as global developers unite under the XPRIZE framework to tackle humanity’s grandest challenges using Gemini 2.5.',
    categoryId: 'ai',
    author: AUTHORS.peter,
    date: 'Jun 10, 2026',
    readTime: 12,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
    featured: true,
    trending: true,
    content: [
      "The alignment of global grand challenges with frontier artificial intelligence marks an unprecedented milestone in human ingenuity. The Google Gemini x XPRIZE Hackathon has emerged not merely as a competition of speed or clever engineering, but as an intellectual foundry where the boundaries of what is possible are relentlessly renegotiated. Under the banners of environmental restoration, education democratization, and deep-space biological resilience, the world's most visionary architects have gathered to harness the sovereign capabilities of Google's native multi-modal model family.",
      "At the absolute core of this technological convergence lies Gemini's state-of-the-art native multi-modality. Unlike previous generation architectures that relied on disparate, disjointed subnetworks, Gemini synthesizes visual matrices, real-time auditory telemetry, and complex structured codebases concurrently. Hackathon engineers are leveraging this unique capability to build cohesive, self-improving agents that parse live geographic satellite images alongside complex agricultural datasets to predict micro-climate shifts with absolute precision. By mapping high-context reasoning directly onto physical data streams, these systems bypass standard processing bottlenecks, illustrating a quantum leap in cognitive computing.",
      "Consider the planetary carbon sequestration diagnostic engines built on this core paradigm. Competitors have successfully trained autonomous multi-modal workflows to evaluate complex marine biodiversity reports and spectral oceanographic imagery in real-time. By utilizing the ultra-long context window of Gemini Pro and Flash models, these agents ingest decades of research papers, raw temperature sheets, and coastal visual logs within seconds, establishing accurate, localized carbon models that were previously thought to require weeks of distributed cluster processing. This fusion of monumental context capacity with multi-modal intuition establishes a brand-new playbook for environmental protection.",
      "The architectural elegance of these systems is matched only by their democratic potential. In education, developers have engineered highly personalized AI mentors that interpret handwritten mathematical derivations, spoken dialects, and visual geometry sketches on low-cost devices. These micro-models, boosted by Gemini's extreme code-generation efficiency, assemble specialized dynamic lesson programs on the fly, adapting to the student's unique cognitive pacing and cultural background. In a sector hungry for true systemic equity, the Gemini-powered XPRIZE prototypes provide a shining light of universal high-fidelity education.",
      "As these autonomous systems transition from sandbox trials to real-world deployment, they trigger a profound cognitive shift. We are moving beyond simple natural language generators and static text-completion tools. The future belongs to agentic, multi-modal cognitive loops—systems that do not just process commands, but actively observe their environments, formulate high-impact hypotheses, and execute precise plans across global APIs. This is the ultimate promise of the Gemini design paradigm, a sovereign intelligence layer running alongside humanity to unlock solutions to the crises of our century.",
      "Peter Damiano, senior tech director and lead architect of Oinone, notes that this transition represents a fundamental democratization of technological leverage. 'By using Gemini to reduce the latency between observation and implementation, we are empowering individuals and small collectives to solve institutional problems at a fraction of the cost,' he comments. The Google Gemini x XPRIZE Hackathon is more than a triumph of code; it is a testament to the unyielding potential of collaborative human-AI synthesis."
    ]
  }
];

export const getPost = (id: string) => MOCK_POSTS.find(p => p.id === id);
export const getCategoryPosts = (categoryId: CategoryId) => MOCK_POSTS.filter(p => p.categoryId === categoryId);
export const getFeaturedPosts = () => MOCK_POSTS.filter(p => p.featured);
export const getTrendingPosts = () => MOCK_POSTS.filter(p => p.trending);
