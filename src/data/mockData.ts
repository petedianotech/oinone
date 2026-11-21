import { CategoryId, Post } from '../types';

export const AUTHORS = {
  peter: {
    id: 'peter-admin',
    name: 'Peter Damiano',
    avatar: 'https://i.ibb.co/cXpLmLVC/20260516-210805.jpg',
    role: 'Founder & Editor'
  }
};

export const MOCK_POSTS: Post[] = [
  {
    id: 'ai-agents-enterprise-2026',
    title: 'Why AI Agents Are Moving From Demos to Production in 2026',
    excerpt: 'Enterprise teams are finally shipping autonomous agents that handle real workflows. Here is what changed and how to evaluate them without the hype.',
    summary: 'A practical look at production AI agents: reliability, evaluation, cost control, and the shift from chatbots to task-oriented systems.',
    categoryId: 'ai',
    author: AUTHORS.peter,
    date: '2026-11-18',
    readTime: 9,
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80',
    featured: true,
    trending: true,
    content: [
      'For years, AI agents lived mostly in demos and research papers. In 2026, a growing number of companies are putting them into production for support triage, internal research, and multi-step operational tasks. The difference is not just better models. It is better scaffolding: evaluation harnesses, tool permissions, human escalation paths, and clear cost limits.',
      'The most successful deployments treat agents as systems, not magic. They define narrow scopes, instrument every tool call, and measure task completion rates instead of vague helpfulness. Teams that skip evaluation quickly discover silent failures that look fluent but are wrong.',
      'Cost control has become a first-class concern. Long-context prompts and multi-step tool use can explode spend. Production teams now set hard budgets per session, cache frequent retrievals, and prefer smaller specialized models for routine subtasks while reserving frontier models for hard reasoning.',
      'If you are evaluating agent platforms, ask three questions: How do you measure success for this workflow? What happens when the agent is uncertain? And can you audit every action the agent took? Without clear answers, you are not ready for production.',
      'The opportunity is real. The teams winning in 2026 are the ones treating reliability and observability as product features, not afterthoughts.'
    ]
  },
  {
    id: 'personal-finance-systems-not-goals',
    title: 'Stop Setting Money Goals. Build Money Systems Instead',
    excerpt: 'Goals feel motivating until life intervenes. Systems keep working when motivation disappears. Here is a practical framework for durable personal finance habits.',
    categoryId: 'finance',
    author: AUTHORS.peter,
    date: '2026-11-15',
    readTime: 8,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80',
    featured: true,
    trending: true,
    content: [
      'Most people do not fail at personal finance because they lack information. They fail because their plans depend on continuous willpower. A better approach is to design systems that run with minimal daily decisions.',
      'Start with automation. Route income the day it arrives: fixed percentages to savings, investments, bills, and spending. When money moves without friction, consistency becomes the default instead of a heroic choice.',
      'Next, shrink the decision surface. Use one primary checking account, one emergency fund, and a simple investment allocation you can explain in two sentences. Complexity is a tax on attention, and attention is scarce.',
      'Review on a schedule, not in a crisis. A monthly 30-minute review of cash flow and a quarterly portfolio check is enough for most people. Between reviews, trust the system.',
      'Goals still matter for direction, but systems determine results. Build the pipes first. Then the outcomes become much more predictable.'
    ]
  },
  {
    id: 'edge-computing-practical-guide',
    title: 'Edge Computing Without the Buzzwords: When It Actually Helps',
    excerpt: 'Not every app needs the edge. A clear decision framework for latency, privacy, cost, and operational complexity.',
    categoryId: 'technology',
    author: AUTHORS.peter,
    date: '2026-11-12',
    readTime: 10,
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80',
    featured: true,
    content: [
      'Edge computing is often sold as the next inevitable architecture. In practice, it is a set of trade-offs. The right question is not should we use the edge but which constraints make centralized cloud insufficient.',
      'Latency-sensitive interfaces, offline-capable tools, and data residency requirements are the strongest reasons. If your users need sub-100ms responses or cannot send data to a distant region, edge placement becomes rational.',
      'Cost is frequently misunderstood. Edge can reduce bandwidth bills, but it often increases operational complexity: more nodes, more deployment targets, harder debugging. For many products, a well-tuned CDN plus regional cloud regions is enough.',
      'A practical approach is to start centralized, measure real user latency and data flows, then move only the hot paths that justify the complexity. Premature edge distribution is a common form of over-engineering.',
      'Treat edge as a tool for specific constraints, not a default architecture. Clarity beats fashion.'
    ]
  },
  {
    id: 'solo-founder-pricing-2026',
    title: 'How Solo Founders Should Price Digital Products in 2026',
    excerpt: 'Pricing is product strategy. A practical guide to value-based pricing, packaging, and avoiding the race to the bottom.',
    categoryId: 'mmo',
    author: AUTHORS.peter,
    date: '2026-11-10',
    readTime: 9,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
    trending: true,
    content: [
      'Underpricing is the most common mistake solo founders make. It feels safer, but it attracts price-sensitive customers, increases support load, and leaves no room for reinvestment.',
      'Anchor pricing to outcomes, not hours. If your product saves a team ten hours a month or helps close deals, price against that value. Customers buy results, not your effort.',
      'Use simple packaging: a focused free or low-cost entry tier that proves value, and a paid tier that unlocks the real workflow. Too many tiers create decision fatigue and dilute messaging.',
      'Raise prices as the product improves. Early adopters can be grandfathered or given a loyalty path, but new customers should pay the current value of the product.',
      'Finally, state the price clearly. Hiding pricing behind contact us for a simple digital product often reduces trust more than it increases perceived exclusivity.'
    ]
  },
  {
    id: 'llm-evaluation-practical',
    title: 'A Practical Guide to Evaluating Large Language Models',
    excerpt: 'Benchmarks are useful but incomplete. How to build evaluation pipelines that reflect real product quality.',
    categoryId: 'ai',
    author: AUTHORS.peter,
    date: '2026-11-08',
    readTime: 11,
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80',
    content: [
      'Public leaderboards are a starting point, not a procurement decision. Models that rank highly on general benchmarks can still fail on your domain language, tone requirements, or tool-use patterns.',
      'Build a small but representative evaluation set from real user tasks. Include edge cases, ambiguous requests, and examples where refusal is the correct behavior. Score for accuracy, completeness, style, and safety.',
      'Automate what you can, but keep human review for high-stakes outputs. Automated metrics drift; human judgment catches subtle quality issues that numbers miss.',
      'Re-run evaluations when you change prompts, models, or retrieval sources. Silent regressions are common. Treat evaluation as continuous infrastructure, not a one-time project.',
      'The teams shipping reliable AI products in 2026 are the ones who invest in measurement with the same seriousness they invest in features.'
    ]
  },
  {
    id: 'index-funds-vs-active-2026',
    title: 'Index Funds Still Win for Most Investors — Here Is the Nuance',
    excerpt: 'Passive investing remains the default for good reasons. When active strategies can still make sense, and when they do not.',
    categoryId: 'finance',
    author: AUTHORS.peter,
    date: '2026-11-05',
    readTime: 8,
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0b3637c1?auto=format&fit=crop&w=1600&q=80',
    content: [
      'Decades of evidence still favor low-cost broad market index funds for the majority of individual investors. Fees, tax efficiency, and the difficulty of consistent outperformance are hard to overcome.',
      'That does not mean markets are perfectly efficient or that skill never exists. It means the average investor, after costs and behavior gaps, tends to do better with a simple, diversified, low-cost portfolio.',
      'Active strategies can make sense in concentrated expertise, tax management, or specific constraints. Even then, the bar is high: clear process, realistic expectations, and honest measurement against a relevant benchmark.',
      'Behavior matters more than product selection for many people. The best portfolio is the one you can stick with through volatility.',
      'Keep the default simple. Add complexity only when you can articulate a specific advantage and a plan for evaluating it.'
    ]
  },
  {
    id: 'typescript-strict-mode-production',
    title: 'Why TypeScript Strict Mode Pays Off in Production Codebases',
    excerpt: 'Strict TypeScript catches real bugs earlier. How to adopt it incrementally without freezing delivery.',
    categoryId: 'technology',
    author: AUTHORS.peter,
    date: '2026-11-02',
    readTime: 7,
    imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1600&q=80',
    content: [
      'Loose TypeScript configurations feel productive until a production incident reveals a null that could never happen. Strict mode shifts that discovery left, where fixes are cheaper.',
      'Enable strictness gradually. Start with noImplicitAny and strictNullChecks on new files, then expand. Use temporary bridges rather than weakening global config.',
      'The biggest gains show up at module boundaries and in data coming from APIs or user input. Typed boundaries reduce the need for defensive checks scattered through the application.',
      'Strict mode is not about perfection. It is about making invalid states harder to represent. That discipline compounds as teams and codebases grow.',
      'If your codebase is already large, measure error density after enabling strict options file by file. The investment usually pays back faster than expected.'
    ]
  },
  {
    id: 'content-moats-online-business',
    title: 'Building a Content Moat When Distribution Is Cheap',
    excerpt: 'Anyone can publish. Durable advantage comes from depth, consistency, and owned distribution.',
    categoryId: 'mmo',
    author: AUTHORS.peter,
    date: '2026-10-28',
    readTime: 8,
    imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1600&q=80',
    content: [
      'Publishing is easy. Attention is not. A content moat is not a single viral post. It is a body of work that compounds trust and search demand over time.',
      'Depth beats frequency when quality is high. One thorough, accurate guide that ranks and gets referenced is worth more than dozens of thin posts that age poorly.',
      'Own your distribution. Email lists, RSS, and direct communities reduce dependence on algorithm changes. Social platforms are amplifiers, not the foundation.',
      'Consistency signals reliability to both readers and search engines. A sustainable publishing cadence you can maintain for years beats an aggressive burst that collapses.',
      'Measure what compounds: returning readers, newsletter growth, and links from trusted sites. Vanity metrics without retention rarely build a business.'
    ]
  },
  {
    id: 'rag-systems-reliability',
    title: 'Making Retrieval-Augmented Generation Reliable in Production',
    excerpt: 'RAG fails quietly when retrieval is weak. Practical patterns for chunking, ranking, evaluation, and fallbacks.',
    categoryId: 'ai',
    author: AUTHORS.peter,
    date: '2026-10-25',
    readTime: 10,
    imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1600&q=80',
    content: [
      'Most RAG failures are retrieval failures dressed up as generation problems. If the right context never reaches the model, fluency will not save you.',
      'Invest in chunking strategies that preserve meaning, hybrid search that combines semantic and keyword signals, and ranking that reflects your domain. Generic defaults are rarely optimal.',
      'Evaluate retrieval separately from generation. Measure whether the top-k documents contain the answer before you judge the final response. This isolates the real bottleneck.',
      'Always plan for incomplete retrieval. Teach the system to say when evidence is weak, and provide escalation or search refinement paths.',
      'Reliable RAG is an information retrieval product with a language model on top. Treat retrieval quality as the primary engineering problem.'
    ]
  },
  {
    id: 'emergency-fund-reality',
    title: 'How Much Emergency Fund Do You Actually Need?',
    excerpt: 'Rules of thumb help, but the right number depends on income stability, dependents, and fixed costs.',
    categoryId: 'finance',
    author: AUTHORS.peter,
    date: '2026-10-20',
    readTime: 7,
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1600&q=80',
    content: [
      'The classic three-to-six months of expenses guideline is a useful starting point, not a universal law. High-income variability, single-income households, and specialized careers often justify more.',
      'Calculate based on essential expenses, not total lifestyle spending. Housing, food, utilities, insurance, and minimum debt payments matter most during a disruption.',
      'Keep the fund liquid and boring. High-yield savings or equivalent cash vehicles beat investments you might be forced to sell at a bad time.',
      'Once the fund is in place, automate top-ups after withdrawals. The system should restore itself without heroic effort.',
      'An emergency fund is insurance. Its job is to buy time and reduce forced decisions. Size it for the risks you actually face.'
    ]
  },
  {
    id: 'web-performance-2026',
    title: 'Web Performance in 2026: What Still Matters Most',
    excerpt: 'Core Web Vitals evolved, but the fundamentals remain: ship less, prioritize critical paths, and measure real users.',
    categoryId: 'technology',
    author: AUTHORS.peter,
    date: '2026-10-15',
    readTime: 9,
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80',
    content: [
      'Performance work is still one of the highest-ROI investments for product teams. Faster pages convert better, rank better, and frustrate users less.',
      'Focus on the critical rendering path. Reduce JavaScript on initial load, optimize images, and avoid layout shifts. Fancy optimizations rarely beat simply shipping less code.',
      'Lab scores are useful for debugging; field data tells you what users experience. Use real-user monitoring to prioritize the pages and devices that matter.',
      'Performance is a product culture issue. Budgets, CI checks, and ownership prevent regressions more effectively than occasional heroics.',
      'In 2026, users still abandon slow experiences. Treat speed as a feature.'
    ]
  },
  {
    id: 'newsletter-growth-practical',
    title: 'Growing a Newsletter Without Burning Out',
    excerpt: 'Sustainable growth comes from clear positioning, consistent value, and respectful distribution — not daily hustle.',
    categoryId: 'mmo',
    author: AUTHORS.peter,
    date: '2026-10-10',
    readTime: 8,
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
    content: [
      'Newsletter growth is slower than social growth and usually more durable. The trade-off is worth it if you value ownership and long-term relationships.',
      'Position clearly. Readers should know in one sentence what they get and who it is for. Vague insights about everything rarely retain.',
      'Publish on a cadence you can maintain for a year. Reliability beats intensity. A strong weekly or biweekly letter outperforms an erratic daily one.',
      'Grow through useful public work: articles, talks, communities, and collaborations that attract the right readers.',
      'Protect the relationship. Respect inboxes. Deliver what you promised. The list is an asset only if people still want to open it.'
    ]
  },
  {
    id: 'multimodal-ai-practical',
    title: 'What Multimodal AI Is Actually Good For Right Now',
    excerpt: 'Vision and audio capabilities are useful when grounded in clear tasks. Where they still fall short.',
    categoryId: 'ai',
    author: AUTHORS.peter,
    date: '2026-10-05',
    readTime: 8,
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=80',
    content: [
      'Multimodal models that handle text, images, and sometimes audio unlock practical workflows: document understanding, UI inspection, diagram interpretation, and media tagging.',
      'They work best when the task is constrained and outputs are verifiable. Describe this image is less valuable than extract the invoice total and line items.',
      'Failure modes include hallucinated details, weak spatial reasoning, and overconfidence. Always validate critical extractions against the source.',
      'Cost and latency still matter. For high-volume pipelines, consider specialized models or preprocessing steps rather than sending every frame to a frontier multimodal system.',
      'Use multimodality where it removes a real bottleneck. Do not add it because it is impressive in demos.'
    ]
  },
  {
    id: 'debt-payoff-strategies',
    title: 'Avalanche vs Snowball: Choosing a Debt Payoff Strategy You Will Stick With',
    excerpt: 'Math favors the avalanche method. Behavior sometimes favors snowball. How to choose honestly.',
    categoryId: 'finance',
    author: AUTHORS.peter,
    date: '2026-09-28',
    readTime: 7,
    imageUrl: 'https://images.unsplash.com/photo-1565514020177-026b92b84bb6?auto=format&fit=crop&w=1600&q=80',
    content: [
      'The debt avalanche method targets highest interest rates first and usually minimizes total interest paid. The snowball method targets smallest balances first and can generate motivating early wins.',
      'If you are highly disciplined and motivated by optimal math, avalanche is rational. If past attempts failed because progress felt invisible, snowball may keep you engaged longer.',
      'Either strategy beats minimum payments and random extra payments. The larger risk is quitting. Choose the approach that maximizes the probability you finish.',
      'While paying down debt, avoid new high-interest balances. Cut the source of the problem as you work the plan.',
      'Track progress visibly. Momentum is a feature, not a vanity metric, when it keeps you consistent.'
    ]
  },
  {
    id: 'api-design-long-term',
    title: 'API Design Decisions That Age Well',
    excerpt: 'Small design choices compound over years. Patterns that reduce breaking changes and client pain.',
    categoryId: 'technology',
    author: AUTHORS.peter,
    date: '2026-09-22',
    readTime: 9,
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80',
    content: [
      'APIs are long-lived contracts. Designing for evolution is more important than designing for the first client.',
      'Prefer additive changes. Version carefully. Avoid overloading fields with shifting meanings. Explicit is better than clever when clients must interpret your responses for years.',
      'Error models matter. Consistent error shapes, machine-readable codes, and actionable messages reduce support burden and client complexity.',
      'Document the invariants. What can clients rely on? What may change? Clear guarantees prevent fragile integrations.',
      'Good API design is empathy for future maintainers and integrators, including yourself in two years.'
    ]
  },
  {
    id: 'freelance-to-product',
    title: 'From Freelance Services to Product Revenue: A Realistic Path',
    excerpt: 'Many freelancers want product income. Here is a staged approach that does not require quitting clients overnight.',
    categoryId: 'mmo',
    author: AUTHORS.peter,
    date: '2026-09-15',
    readTime: 9,
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80',
    content: [
      'The jump from services to products is rarely clean. A practical path is to productize parts of your existing expertise while client work funds the runway.',
      'Start with problems you see repeatedly in client work. Templates, tools, and focused SaaS features that solve those problems have a built-in audience.',
      'Protect time intentionally. Without a recurring block for product work, client urgency will always win.',
      'Price the product so that a modest number of customers matters. Underpricing forces you back into hours-for-money even after the product exists.',
      'Transition gradually. Replace a portion of service income only after product revenue is predictable. Stability is a strategy.'
    ]
  },
  {
    id: 'prompt-engineering-limits',
    title: 'The Limits of Prompt Engineering — and What to Do Instead',
    excerpt: 'Better prompts help, but architecture, evaluation, and data quality usually matter more for production systems.',
    categoryId: 'ai',
    author: AUTHORS.peter,
    date: '2026-09-08',
    readTime: 8,
    imageUrl: 'https://images.unsplash.com/photo-1676277791608-ac54d1b0b8e2?auto=format&fit=crop&w=1600&q=80',
    content: [
      'Prompt engineering is useful and overrated at the same time. Clever wording can improve outputs, but it cannot fix missing context, weak retrieval, or unclear task definitions.',
      'For production systems, invest first in task specification, examples, evaluation sets, and retrieval quality. Then refine prompts within that structure.',
      'Version prompts like code. Small changes can alter behavior. Without tracking, you cannot debug regressions.',
      'When prompts become extremely long and brittle, consider structured tools, fine-tuning, or breaking the task into stages.',
      'Treat prompts as one layer in a system. The system determines reliability.'
    ]
  },
  {
    id: 'investing-psychology-basics',
    title: 'The Psychology Mistakes That Quietly Destroy Investment Returns',
    excerpt: 'Markets are hard. Human behavior is often harder. How to design around your own biases.',
    categoryId: 'finance',
    author: AUTHORS.peter,
    date: '2026-09-01',
    readTime: 8,
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1600&q=80',
    content: [
      'Investors frequently underperform their own portfolios because of timing decisions driven by fear and greed. Buying high and selling low is a behavioral pattern, not a math one.',
      'Reduce decision frequency. Automatic contributions and periodic rebalancing limit opportunities for impulsive trades.',
      'Write an investment policy for yourself: allocation targets, rebalancing rules, and conditions under which you will change strategy. Decide in calm moments, not during drawdowns.',
      'Consume less financial noise. Constant market commentary increases the urge to act. Most long-term investors need less information, not more.',
      'The edge available to ordinary investors is often behavioral discipline, not superior forecasting.'
    ]
  },
  {
    id: 'observability-startup-guide',
    title: 'Observability for Small Teams: What to Instrument First',
    excerpt: 'You do not need a massive platform on day one. A focused approach to logs, metrics, and traces that scales with the team.',
    categoryId: 'technology',
    author: AUTHORS.peter,
    date: '2026-08-25',
    readTime: 8,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
    content: [
      'Small teams drown when they try to instrument everything. Start with the questions you need to answer during an incident: Is it down? Who is affected? What changed?',
      'Prioritize golden signals for critical user paths: latency, errors, traffic, and saturation. Add business metrics that map to revenue or activation.',
      'Structured logs with request IDs make debugging dramatically faster than free-text logs. Traces help once services multiply.',
      'Alert on symptoms that require action, not on every anomaly. Noisy alerts train teams to ignore monitoring.',
      'Observability should reduce time-to-diagnosis. If it does not, simplify.'
    ]
  },
  {
    id: 'digital-product-launches',
    title: 'How to Launch a Digital Product Without a Huge Audience',
    excerpt: 'You do not need viral reach. You need a specific problem, a clear offer, and direct conversations with buyers.',
    categoryId: 'mmo',
    author: AUTHORS.peter,
    date: '2026-08-18',
    readTime: 8,
    imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1600&q=80',
    content: [
      'Many founders wait for a large audience before launching. That wait often delays learning. Early sales can come from communities, direct outreach, and existing professional networks.',
      'Define a narrow problem and a concrete outcome. Vague productivity tools struggle. Specific workflow solutions sell.',
      'Talk to potential users before building the full product. Pre-sales, waitlists with interviews, and manual delivery versions validate demand cheaply.',
      'Launch is a process, not a day. Share progress, collect feedback, and iterate in public where appropriate.',
      'Distribution still matters, but relevance matters more at the start. Find the people who already feel the pain.'
    ]
  },
  {
    id: 'ai-safety-product-teams',
    title: 'AI Safety Basics for Product Teams Shipping Features',
    excerpt: 'You do not need a research lab to ship responsibly. Practical checks for misuse, bias, and failure modes.',
    categoryId: 'ai',
    author: AUTHORS.peter,
    date: '2026-08-10',
    readTime: 9,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80',
    content: [
      'Product teams shipping AI features need lightweight safety practices that fit real timelines. Perfect guarantees are impossible; structured risk reduction is not.',
      'Identify misuse scenarios for your specific feature. What could a bad actor ask for? What sensitive data might leak into prompts or logs?',
      'Add refusals and limits where appropriate. Rate-limit expensive or sensitive actions. Log enough to investigate incidents without storing unnecessary personal data.',
      'Test with adversarial prompts and edge cases before launch. Include people who did not build the feature in review.',
      'Responsible shipping is iterative. Start with constrained capabilities, monitor real usage, and expand carefully.'
    ]
  },
  {
    id: 'long-term-wealth-habits',
    title: 'The Quiet Habits That Build Wealth Over Decades',
    excerpt: 'Dramatic strategies get attention. Consistent, slightly boring behaviors usually win.',
    categoryId: 'finance',
    author: AUTHORS.peter,
    date: '2026-08-01',
    readTime: 7,
    imageUrl: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&w=1600&q=80',
    content: [
      'Wealth building for most people is less about finding secret assets and more about repeatedly doing unremarkable things: saving a meaningful rate, investing consistently, and avoiding catastrophic mistakes.',
      'Increase savings as income rises. Lifestyle inflation is the silent killer of otherwise good financial plans.',
      'Stay invested through cycles. Missing the best recovery days is expensive. Time in the market usually beats timing the market for non-professionals.',
      'Protect against ruin. Insurance, emergency funds, and reasonable leverage limits keep one bad event from undoing years of progress.',
      'Compound interest needs time and continuity. The habits that preserve both are the real edge.'
    ]
  }
];

export const getPost = (id: string) => MOCK_POSTS.find(p => p.id === id);
export const getCategoryPosts = (categoryId: CategoryId) => MOCK_POSTS.filter(p => p.categoryId === categoryId);
export const getFeaturedPosts = () => MOCK_POSTS.filter(p => p.featured);
export const getTrendingPosts = () => MOCK_POSTS.filter(p => p.trending);
