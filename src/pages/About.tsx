import { motion } from 'motion/react';
import { Mail, Globe, Code2, Cpu, Rocket, ShieldCheck } from 'lucide-react';

export function About() {
  const labProjects = [
    { name: 'Oinone', desc: 'The powerful multi-niche centralized blog ecosystem covering finance, tech, AI, and e-business.' },
    { name: 'Globlync', desc: 'SaaS solutions empowering borderless connectivity and modern teamwork.' },
    { name: 'EducateMW', desc: 'Dedicated digital platforms transforming training, open education, and interactive learning systems.' },
    { name: 'AI Tact', desc: 'Advanced artificial intelligence frameworks crafted for real-world enterprise alignment.' },
    { name: 'Oto Creator', desc: 'Accelerated content automation suite for modern writers and independent builders.' },
    { name: 'TrendBrainAI', desc: 'Intelligence signals tracking digital trends and viral momentum.' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 bg-gray-50 dark:bg-gray-950 transition-colors duration-200"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* Hero Profile Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-4 flex flex-col items-center text-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-indigo-600 shadow-xl"
            >
              <img 
                src="https://i.ibb.co/cXpLmLVC/20260516-210805.jpg" 
                alt="Peter Damiano (petediano)" 
                className="w-full h-full object-cover font-sans"
              />
            </motion.div>
            <h2 className="mt-6 font-display font-bold text-2xl text-gray-950 dark:text-white">Peter Damiano</h2>
            <p className="text-indigo-600 dark:text-indigo-400 font-medium">@petediano</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Founder & Systems Architect</p>
            
            <div className="flex gap-4 mt-4">
              <a href="https://peterdamiano.vercel.app" target="_blank" rel="noopener noreferrer" className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-full transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="mailto:petedianotech@gmail.com" className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-full transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="md:col-span-8 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1.5 rounded-full">
              From Dzenje to the World
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-gray-950 dark:text-white leading-tight">
              Partnering with global scale, crafting beautiful experiences.
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Hey, I'm Peter Damiano, also popularly known as <span className="font-semibold text-gray-950 dark:text-white">petediano</span>. 
              As a senior developer and product architect with years of experience building high-impact platforms, I created **Oinone** 
              as an elite media Hub. It's the ultimate translation of my "all-in-one" engineering vision. This blog houses top-tier insights on 
              Markets, Modern Computing Architecture, Artificial Intelligence, and highly profitable Online business growth loops.
            </p>
          </div>
        </div>

        {/* Pillars of Oinone Infographic */}
        <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 sm:p-12 shadow-sm transition-colors">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold text-gray-950 dark:text-white">Core Architectural Values</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              How Oinone delivers unmatched quality and speeds configured for Vercel, serverless runtimes, and immediate responsiveness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="inline-flex p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white">Extreme Optimization</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Lightweight bundle structure, complete static capability, fast caching headers, and fluid micro-interactions built with Framer motion.
              </p>
            </div>

            <div className="space-y-4">
              <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white">Semantic SEO Structure</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Schema-perfect article layouts, clean nested routes, proper header pairing distributions, and index-friendly viewport tags.
              </p>
            </div>

            <div className="space-y-4">
              <div className="inline-flex p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl">
                <Rocket className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white">Premium Content Signal</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Highly calibrated stories written back-to-front by experts exploring high-leverage business paradigms and AI automation paths.
              </p>
            </div>
          </div>
        </section>

        {/* Peter's Innovation Lab */}
        <section className="space-y-8">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
            <h2 className="font-display text-2xl font-bold text-gray-950 dark:text-white">Portfolio Achievements & The Lab</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">A look inside Peter's global system architectures & product creations.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {labProjects.map((project) => (
              <div key={project.name} className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                <h4 className="font-display font-bold text-lg text-gray-900 dark:text-white">{project.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{project.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </motion.div>
  );
}
