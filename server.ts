import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const app = express();
app.use(express.json());

const PORT = 3000;

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("Missing GEMINI_API_KEY environment variable. Please make sure GEMINI_API_KEY is configured in your project settings/environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
  }
  return aiClient;
}

// Helper function to safely call Gemini with fallback plans if any model is overloaded or fails
async function generateContentWithRetry(params: {
  model: string;
  contents: any;
  tools?: any;
  config?: any;
}) {
  // Normalize known typos/unsupported models
  let primaryModel = params.model;
  if (primaryModel === "gemini-3.5-flash-lite") {
    primaryModel = "gemini-3.1-flash-lite";
  }

  // Chain of fallback models to try if the previous one fails
  // Force gemini-3.1-flash-lite to respect the user's free plan, avoiding other premium query limitations
  const modelsToTry = [
    "gemini-3.1-flash-lite"
  ];

  // Keep unique models in the prioritized order
  const uniqueModels: string[] = [];
  for (const m of modelsToTry) {
    if (m && !uniqueModels.includes(m)) {
      uniqueModels.push(m);
    }
  }

  let lastError: any = null;

  for (const currentModel of uniqueModels) {
    // Retry up to 2 times for transient errors to avoid long timeouts
    for (let attempt = 1; attempt <= 2; attempt++) {
      let currentParams: any = null;
      try {
        console.log(`[Gemini SDK] Trying model "${currentModel}" (attempt ${attempt}/2)...`);
        
        const { tools, config, ...restParams } = params;
        const currentConfig = { ...config };
        
        // Place tools inside config for @google/genai compliance
        if (tools && !currentConfig.tools) {
          currentConfig.tools = tools;
        }

        // Fallbacks may not support tools (like googleSearch / search grounding), so strip them if not using the primary
        if (currentModel !== primaryModel && currentConfig.tools) {
          console.log(`[Gemini SDK Fallback] Stripping tools on fallback model to maximize success.`);
          delete currentConfig.tools;
          delete currentConfig.toolConfig;
        }

        currentParams = {
          ...restParams,
          model: currentModel,
          config: currentConfig
        };

        return await getAiClient().models.generateContent(currentParams);
      } catch (error: any) {
        lastError = error;
        const errMsg = error.message || String(error);
        console.warn(`[Gemini SDK Error] Model "${currentModel}" failed:`, errMsg);

        // If the previous request had tools and failed, immediately try WITHOUT tools on the same model
        if (currentParams && currentParams.config?.tools) {
          console.log(`[Gemini SDK Fallback] Request with tools failed. Retrying same model "${currentModel}" WITHOUT tools ...`);
          const paramsWithoutTools = { ...currentParams };
          const cleanConfig = { ...paramsWithoutTools.config };
          delete cleanConfig.tools;
          delete cleanConfig.toolConfig;
          paramsWithoutTools.config = cleanConfig;
          try {
            return await getAiClient().models.generateContent(paramsWithoutTools);
          } catch (noToolsError: any) {
            console.warn(`[Gemini SDK Error] Retrying same model "${currentModel}" WITHOUT tools also failed:`, noToolsError.message || noToolsError);
            lastError = noToolsError;
          }
        }

        // Call is transient if 503, 429, UNAVAILABLE, RESOURCE_EXHAUSTED or high demand
        const isTransient = errMsg.includes("503") || 
                            errMsg.includes("429") || 
                            errMsg.includes("UNAVAILABLE") || 
                            errMsg.includes("RESOURCE_EXHAUSTED") ||
                            /high demand/i.test(errMsg);

        if (isTransient && attempt < 2) {
          const delayMs = attempt * 1000;
          console.log(`[Gemini SDK Retry] Transient error. Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } else {
          // Break the retry loop to fall back immediately to the next model
          break;
        }
      }
    }
  }

  throw lastError || new Error(`Failed to generate content with any available Gemini models.`);
}

// STOCK GALLERY with fine-curated premium stock photography matching categories
const STOCK_GALLERY: Record<string, string[]> = {
  ai: [
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200", 
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&q=80&w=1200"
  ],
  technology: [
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200"
  ],
  finance: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80&w=1200"
  ],
  mmo: [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&q=80&w=1200"
  ],
  default: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200"
  ]
};

// Admin Verification Endpoint
app.post("/api/admin/verify", (req, res) => {
  const { email } = req.body;
  const adminEmailStr = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || "petedianotech@gmail.com,peterleodamiano@gmail.com";
  const allowedEmails = adminEmailStr.split(',').map((e: string) => e.trim().toLowerCase());
  const isValid = email && allowedEmails.includes(email.toLowerCase());
  res.json({ isAdmin: isValid });
});

// AI Content Generation Endpoint
app.post("/api/ai/generate-blog", async (req, res) => {
  try {
    const { topic, keyword, categoryId, tone, length, imageType, idea } = req.body;

    if (!topic || !keyword) {
      return res.status(400).json({ error: "Topic and keyword are required." });
    }

    const catId = categoryId || "ai";

    // Step 1: Research & Structuring Phase (no Google search as requested; utilizing custom SEO expert guidelines)
    const researchPrompt = `As an elite SEO digital marketer and expert business analyst, perform a comprehensive, high-fidelity research and structural plan on the topic: "${topic}". 
Primary Target Keyword: "${keyword}".
${idea ? `Brief Description / Idea: "${idea}"\nEnsure the research strictly adheres to and fully integrates this core idea.` : ""}

Requirements:
1. Emulate real-world up-to-date trends and deep professional domain knowledge (up to mid-2026).
2. Outline a highly structured semantic SEO blueprint.
3. Identify 5-7 secondary, high-value semantic latent keywords.
4. Detail the user intent, target reader profile, and comprehensive outline.
5. Create a blueprint that will make the subsequent article incredibly deep, original, engaging, and authoritative.`;

    const researchResponse = await generateContentWithRetry({
      model: "gemini-3.1-flash-lite",
      contents: researchPrompt
    });

    const researchData = researchResponse.text;

    // Step 2: Content Writing Phase
    const writePrompt = `As a world-class professional copywriter, tech-journalist, and SEO specialist, write an exceptional, authoritative, and deeply engaging full-length article on the topic: "${topic}".
Target Keyword: "${keyword}".
Tone: ${tone || 'Professional'}.
Length: ${length || 'Medium (around 800-1000 words)'}.

Apply these advanced copywriting guidelines to write an exceptionally high-quality piece:
- Emulate elite publications like Wired, Premium Tech Journals, or Harvard Business Review.
- Incorporate highly up-to-date concepts, technologies, and trends (up to mid-2026) to make the content feel futuristic and highly accurate.
- Integrate rich storytelling, real-world analogies, and deep technical or financial insight depending on the category.
- Formulate a clear, captivating narrative structure: draft a powerful, hook-based intro, follow with actionable in-depth expert content, and close with a forward-looking conclusion of high visionary scale.
- Ensure natural readability, elegant rhythm, and expert transitions — absolutely no generic AI-sounding filler or superficial overviews.

Use the following detailed research blueprint to ground and structure the article perfectly:
---
${researchData}
---

Formatting Guidelines:
- Format the content using clean, semantic HTML tags (do NOT wrap in <html>, <head>, or <body>). 
- SEO Title: Wrap the captivating headline in a single <h1> tag.
- Meta Description: Provide an engaging meta description written at the very top, formatted as a <p className="text-gray-500 italic mb-6"> or <blockquote>. Do NOT include the label "Meta Description" or parenthetical labels like "(Meta Description)". Simply output the description text directly inside the tags.
- Subheaders: Structure the body with clear, compelling <h2> and <h3> tags.
- Detailed Sections: Write with high density of value, bullet points, and clean lists.
- Inline Articles Images: To make the article visual, immersive, and pass all SEO scanners, insert exactly 1 or 2 elegant, contextual inline images (<img> tags) inside the body of the article between paragraphs.
  Use the free, high-fidelity Pollinations AI API as the src attribute. The format must be EXACTLY:
  https://image.pollinations.ai/p/[one-sentence-descriptive-scene-keywords-separated-by-plus-signs]?width=800&height=450&nologo=true&seed=[random-5-digit-number]
  (e.g., <img src="https://image.pollinations.ai/p/advanced+neural+network+with+shimmering+blue+lines?width=800&height=450&nologo=true&seed=48201" alt="Detailed SEO descriptive phrase with keyword: ${keyword}" class="rounded-2xl my-8 w-full object-cover max-h-96 shadow-lg border border-white/5" />)
  Make sure alt attribute is descriptive and includes target SEO terms!
- FAQ Section: Include a concise, high-value FAQ section towards the end of the article using <h2> and <h3>.
- Do NOT use markdown code blocks or backticks (\`\`\`html) around the output. Return raw HTML directly.

After the content, on a new line, provide exactly 1-3 suggested image prompts based on the article sections, formatted exactly like:
IMAGE_PROMPT: [prompt 1]
IMAGE_PROMPT: [prompt 2] (optional)
IMAGE_PROMPT: [prompt 3] (optional)

Additionally, provide a simple English summary (easy to understand) of the article at the very end formatted like this:
SUMMARY: [your simple English summary]`;

    const writeResponse = await generateContentWithRetry({
      model: "gemini-3.1-flash-lite",
      contents: writePrompt
    });

    const fullContent = writeResponse.text;

    // Parse image prompts from the generated content
    const imagePrompts = [];
    const promptRegex = /IMAGE_PROMPT:\s*(.*)/g;
    let match;
    while ((match = promptRegex.exec(fullContent)) !== null) {
      imagePrompts.push(match[1].trim());
    }

    // Parse summary
    let summary = "";
    const summaryRegex = /SUMMARY:\s*([\s\S]*)/;
    const summaryMatch = summaryRegex.exec(fullContent);
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
    }

    // Clean up content from the IMAGE_PROMPT and SUMMARY lines
    let cleanContent = fullContent
      .replace(/IMAGE_PROMPT:\s*(.*)/g, '')
      .replace(/SUMMARY:\s*([\s\S]*)/, '')
      .trim();

    // Strip any markdown HTML code block wrapper if present
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "").trim();
    }

    // Clean up any "(Meta Description)" or "Meta Description:" label inside the first paragraph, blockquote, or raw beginning
    cleanContent = cleanContent
      .replace(/(<(p|blockquote)[^>]*>)\s*(\()?Meta\s+Description(\s*[:\-\)])*\s*/gi, '$1')
      .replace(/^\s*(\()?Meta\s+Description(\s*[:\-\)])*\s*/gi, '');

    // Step 3: Image Acquisition Phase
    let generatedImages: string[] = [];
    
    if (imageType === 'stock') {
      // Return 3 unique high-quality pre-verified images from our premium category stock gallery
      const gallery = STOCK_GALLERY[catId] || STOCK_GALLERY.default;
      const shuffled = [...gallery].sort(() => 0.5 - Math.random());
      generatedImages = shuffled.slice(0, 3);
      // Ensure we have exactly 3 images
      while (generatedImages.length < 3) {
        const fallback = STOCK_GALLERY.default[Math.floor(Math.random() * STOCK_GALLERY.default.length)];
        if (!generatedImages.includes(fallback)) {
          generatedImages.push(fallback);
        }
      }
    } else {
      // imageType === 'ai': generate high-fidelity, creative AI images using Pollinations AI.
      // This is infinitely scalable, completely free, fast (0-second server latency), and works on all credentials.
      const promptsToRun = imagePrompts.slice(0, 3);
      if (promptsToRun.length === 0) {
        promptsToRun.push(`A futuristic, modern professional tech blog cover for: ${topic}`);
      }

      console.log(`[Pollinations AI] Generating image URLs for prompts:`, promptsToRun);
      generatedImages = promptsToRun.map((prompt) => {
        // Build a highly-detailed visual prompt for Pollinations AI with high aesthetic parameters
        const cleanPrompt = prompt.trim()
          .replace(/["']/g, '')
          .replace(/\s+/g, '+');
        const seedValue = Math.floor(Math.random() * 100000);
        return `https://image.pollinations.ai/p/${encodeURIComponent(cleanPrompt)}?width=1024&height=576&nologo=true&seed=${seedValue}`;
      });

      // Ensure we fill up to 3 images if we have less prompts
      if (generatedImages.length < 3) {
        const gallery = STOCK_GALLERY[catId] || STOCK_GALLERY.default;
        const shuffled = [...gallery].sort(() => 0.5 - Math.random());
        for (const img of shuffled) {
          if (generatedImages.length >= 3) break;
          if (!generatedImages.includes(img)) {
            generatedImages.push(img);
          }
        }
      }
    }

    const titleMatch = cleanContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const title = titleMatch ? titleMatch[1] : topic;

    res.json({
      title,
      content: cleanContent,
      summary,
      researchSummary: researchData,
      images: generatedImages,
      author: "Peter Damiano",
      seoKeyword: keyword,
      imageErrors: (res as any).imageErrors
    });

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    const errorMessage = error?.message || String(error);
    res.status(500).json({ 
      error: `AI Generation Error: ${errorMessage}`,
      details: error?.stack || String(error)
    });
  }
});

// New Endpoint: Ideate Topics
app.post('/api/ai/ideate-topics', async (req, res) => {
  try {
    const { category, keyword, targetAudience, description } = req.body;
    let prompt = `Act as an expert SEO and content strategist. I need 5 compelling blog post topics/titles.
Here is some context:
- Category: ${category || 'General'}
- Target Keyword: ${keyword || 'N/A'}
- Target Audience: ${targetAudience || 'General Audience'}
- Initial Idea/Description: ${description || 'N/A'}

Provide ONLY a numbered list of exactly 5 creative, click-worthy, and SEO-optimized blog post topics. Do NOT include any intro or outro text. Format exactly like:
1. First Topic
2. Second Topic
...`;

    const aiResponse = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    const responseText = aiResponse.text || '';
    const topics = responseText
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 5 && line.length < 150)
      .slice(0, 5);

    res.json({ topics: topics.length > 0 ? topics : ['Failed to extract topics'] });
  } catch (error: any) {
    console.error("AI Ideate Topics Error:", error);
    res.status(500).json({ error: error.message || 'Failed to ideate topics' });
  }
});

// New Endpoint: Fix SEO
app.post('/api/ai/fix-seo', async (req, res) => {
  try {
    const { title, content, summary, keyword, issues } = req.body;
    
    const prompt = `You are an elite, world-class SEO specialist, copywriter, and article editor. Your job is to resolve 100% of the SEO warnings and errors in the provided article details, absolutely ensuring the final SEO score is 90+ out of 100 on the scanner.

TARGET KEYWORD: "${keyword || 'none'}"

=== CURRENT DETAILS ===
Current Title: "${title}"
Current Summary (Meta Description): "${summary}"
Current Content (HTML):
${content}

=== DETECTED ISSUES TO RESOLVE ===
${issues.map((i: string) => `- ${i}`).join('\n')}

=== MANDATORY AUTO-FIX ACTIONS ===
1. TITLE OPTIMIZATION:
   - Must be between 30 and 60 characters long (optimize for 48-58 characters for perfect desktop and mobile visibility).
   - MUST contain the target keyword (case-insensitive). No exceptions!
2. SUMMARY / META DESCRIPTION OPTIMIZATION:
   - Must be between 50 and 160 characters long.
   - Summarize the core value proposition of the article and naturally include the target keyword in it!
3. CONTENT EXPANSION & STRUCTURING:
   - MUST be at least 320 words. If the current content is thin (such as 1 word or an empty draft), write a comprehensive, extremely detailed, professional, high-quality blog article on the topic of "${title}".
   - MUST include the target keyword "${keyword}" naturally in the content body multiple times (aim for 2-4 occurrences).
   - MUST use structured subheadings (HTML tags like <h2> and <h3>) to separate themes and break down the article logically.
4. IMAGES AND ALT TEXTS:
   - Every single <img> tag in the HTML must have a descriptive, non-empty alt="..." attribute (never alt="" or alt='' or missing alt).
   - If there are NO images in the content body, you MUST insert at least one high-quality, professional illustrative image. Use a professional Pollinations AI image URL:
     https://image.pollinations.ai/p/[one-sentence-descriptive-scene-keywords-separated-by-plus-signs]?width=800&height=450&nologo=true&seed=[random-5-digit-number]
     (e.g., <img src="https://image.pollinations.ai/p/workspace+innovation+with+glowing+holograms?width=800&height=450&nologo=true&seed=24589" alt="Detailed SEO descriptive phrase with keyword: ${keyword}" class="rounded-2xl my-6 w-full object-cover max-h-96 shadow-lg border border-white/5" />)
     Ensure the <img> has nice responsive classes and a highly descriptive, non-empty alt attribute containing related keywords to boost SEO metrics to 90+!

Ensure your entire generated HTML content is professional, elegant, and matches the premium, high-contrast, tech-savvy brand voice of Oinone.`;

    const aiResponse = await getAiClient().models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The optimized, highly engaging SEO title containing the keyword, between 30 and 60 characters long."
            },
            summary: {
              type: Type.STRING,
              description: "The optimized meta description containing the keyword, between 50 and 160 characters long."
            },
            content: {
              type: Type.STRING,
              description: "The full, high-depth HTML content of the article (with <p> tags, <h2>/<h3> headers, lists, code snippets or blockquotes, and <img> tags with descriptive alt text) meeting all word counts (>320 words)."
            }
          },
          required: ["title", "summary", "content"]
        }
      }
    });

    const rawText = (aiResponse.text || '').trim();
    
    try {
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (parseError) {
      console.error("JSON parse failed. Raw Text was:", rawText);
      res.status(500).json({ error: "Failed to parse AI response as JSON." });
    }
  } catch (error: any) {
    console.error("AI Fix SEO Error:", error.message || error);
    res.status(500).json({ error: error.message || 'Failed to fix SEO' });
  }
});

// XML Sitemap Endpoint
app.get('/sitemap.xml', async (req, res) => {
  const host = "https://oinone.co";
  const projectId = "oin-one";
  const databaseId = "ai-studio-ac2d3137-06fd-4d06-b18c-691ce92bd1ef";
  
  // Base URLs
  const urls = [
    { loc: `${host}/`, changefreq: 'daily', priority: 1.0 },
    { loc: `${host}/home`, changefreq: 'daily', priority: 0.9 },
    { loc: `${host}/offers-vault`, changefreq: 'weekly', priority: 0.8 },
    { loc: `${host}/about`, changefreq: 'monthly', priority: 0.7 },
  ];

  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/articles`;
    const response = await fetch(firestoreUrl);
    
    if (response.ok) {
      const data = await response.json();
      if (data.documents) {
        data.documents.forEach((doc: any) => {
          const docNameParts = doc.name.split('/');
          const docId = docNameParts[docNameParts.length - 1];
          const updateTime = doc.updateTime || new Date().toISOString();
          
          urls.push({
            loc: `${host}/article/${docId}`,
            changefreq: 'weekly',
            priority: 0.8
          });
        });
      }
    }
  } catch (err) {
    console.warn("Failed to fetch articles for sitemap", err);
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.status(200).send(sitemapXml);
});

// Advanced SEO & Open Graph dynamic metadata extractor
export interface PageMetadata {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  keywords?: string[];
  articleSection?: string; // e.g. Finance, Technology, MMO, AI
}

async function getMetadataForRoute(reqUrl: string): Promise<PageMetadata> {
  const host = "https://oinone.co"; // Canonical production domain
  const canonicalUrl = `${host}${reqUrl}`;
  
  const defaultMeta: PageMetadata = {
    title: "Oinone - Finance, Tech, AI & Business by Peter Damiano",
    description: "Discover premium blog posts and deep-dives on Finance, Technology, AI, and Online Business compiled by Peter Damiano.",
    url: canonicalUrl,
    imageUrl: `${host}/oinone_blog_icon.jpg`,
    type: 'website',
    keywords: ["finance", "technology", "make money online", "AI", "business insights", "Peter Damiano"]
  };

  try {
    // Match /article/:postId
    const articleMatch = reqUrl.match(/^\/article\/([a-zA-Z0-9_\-]+)/);
    if (articleMatch) {
      const postId = articleMatch[1];
      const projectId = "oin-one";
      const databaseId = "ai-studio-ac2d3137-06fd-4d06-b18c-691ce92bd1ef";
      
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/articles/${postId}`;
      
      // Use short timeout to maintain lightning-fast first-byte delivery
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const response = await fetch(firestoreUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const doc = await response.json();
        const fields = doc.fields || {};
        
        const title = fields.title?.stringValue || defaultMeta.title;
        const excerpt = fields.summary?.stringValue || fields.excerpt?.stringValue || defaultMeta.description;
        const imageUrl = fields.imageUrl?.stringValue || defaultMeta.imageUrl;
        const author = fields.author?.stringValue || "Peter Damiano";
        const publishedTime = fields.date?.stringValue;
        const categoryId = fields.categoryId?.stringValue || "technology";

        const categoryKeywords = {
          'finance': ["finance", "investment", "markets", "stocks", "wealth"],
          'technology': ["technology", "software", "tech trends", "innovation"],
          'ai': ["artificial intelligence", "AI", "machine learning", "automation", "tech"],
          'mmo': ["make money online", "side hustle", "passive income", "entrepreneurship", "business"]
        };
        const keywords = fields.seoKeyword?.stringValue ? [fields.seoKeyword.stringValue] : (categoryKeywords[categoryId as keyof typeof categoryKeywords] || defaultMeta.keywords);

        return {
          title: `${title} | Oinone`,
          description: excerpt,
          url: canonicalUrl,
          imageUrl: imageUrl,
          type: 'article',
          author,
          publishedTime,
          keywords,
          articleSection: categoryId
        };
      }
    }
    
    // Resolve static pages with detailed thematic metadata
    const cleanUrl = reqUrl.split("?")[0];
    if (cleanUrl === "/" || cleanUrl === "/home" || cleanUrl === "") {
      return {
        ...defaultMeta,
        title: "Oinone - Premium Tech, Finance & Business Insights",
        description: "Stay ahead of the curve with deeply-researched analyses and insights on technologies, financial sectors, online businesses, and AI systems created by Peter Damiano.",
      };
    } else if (cleanUrl === "/offers" || cleanUrl === "/offers-vault") {
      return {
        ...defaultMeta,
        title: "Offers Vault - High-Tier Affiliate CPA Campaigns | Oinone",
        description: "Explore highly-vetted premium business tools, financial campaigns, and dynamic online monetization systems curated for performance.",
        keywords: ["affiliate campaigns", "CPA offers", "make money online", "business tools", "monetization systems"]
      };
    } else if (cleanUrl === "/about") {
      return {
        ...defaultMeta,
        title: "About Peter Damiano & Oinone - AI-Powered Professional Journal",
        description: "Learn more about the vision behind Oinone. Multi-faceted journalism exploring high-growth sectors, technology integration, and automated content generation.",
        keywords: ["Peter Damiano", "Oinone vision", "tech journalism", "finance blog", "AI integration"]
      };
    } else if (cleanUrl === "/admin") {
      return {
        ...defaultMeta,
        title: "Admin Dashboard - Content & Asset Operations | Oinone",
        description: "Secure management panel for drafting articles, configuring advertisements, and monitoring affiliate campaigns.",
      };
    }
  } catch (err) {
    console.warn(`[SEO Middleware] Failed to resolve metadata for "${reqUrl}":`, err);
  }

  return defaultMeta;
}

// Helper to inject HTML safe Open Graph + Twitter Meta Tags
function injectMetaTags(
  template: string,
  metadata: PageMetadata
): string {
  const { title, description, url, imageUrl, type, author, publishedTime, keywords, articleSection } = metadata;
  
  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const escapedUrl = escapeHtml(url);
  const escapedImageUrl = escapeHtml(imageUrl);

  let result = template;

  // Replace primary page title and description
  result = result.replace(/<title>.*?<\/title>/gi, `<title>${escapedTitle}</title>`);
  
  // Create our advanced meta tags string
  let advancedMetaTags = `
    <!-- Standard Meta -->
    <meta name="title" content="${escapedTitle}" />
    <meta name="description" content="${escapedDescription}" />
    ${keywords?.length ? `<meta name="keywords" content="${escapeHtml(keywords.join(", "))}" />` : ''}
    ${author ? `<meta name="author" content="${escapeHtml(author)}" />` : ''}

    <!-- Open Graph -->
    <meta property="og:type" content="${type || 'website'}" />
    <meta property="og:url" content="${escapedUrl}" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDescription}" />
    <meta property="og:image" content="${escapedImageUrl}" />
    <meta property="og:site_name" content="Oinone" />
    ${type === 'article' && publishedTime ? `<meta property="article:published_time" content="${escapeHtml(publishedTime)}" />` : ''}
    ${type === 'article' && author ? `<meta property="article:author" content="${escapeHtml(author)}" />` : ''}
    ${type === 'article' && articleSection ? `<meta property="article:section" content="${escapeHtml(articleSection)}" />` : ''}
    ${type === 'article' && keywords ? keywords.map(tag => `<meta property="article:tag" content="${escapeHtml(tag)}" />`).join('\n    ') : ''}

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${escapedUrl}" />
    <meta property="twitter:title" content="${escapedTitle}" />
    <meta property="twitter:description" content="${escapedDescription}" />
    <meta property="twitter:image" content="${escapedImageUrl}" />
  `;

  // JSON-LD Structured Data
  let structuredData: any;
  if (type === 'article') {
    structuredData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": escapedUrl
      },
      "headline": title,
      "description": description,
      "image": imageUrl,
      "author": {
        "@type": "Person",
        "name": author || "Peter Damiano",
        "url": "https://oinone.co/about"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Oinone",
        "logo": {
          "@type": "ImageObject",
          "url": "https://oinone.co/oinone_blog_icon.jpg"
        }
      },
      "datePublished": publishedTime || new Date().toISOString()
    };
  } else {
    structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Oinone",
      "url": "https://oinone.co",
      "description": description,
      "author": {
        "@type": "Person",
        "name": "Peter Damiano"
      }
    };
  }

  advancedMetaTags += `
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
      ${JSON.stringify(structuredData)}
    </script>
  `;

  // Provide a clean slate by removing existing standard dummy tags if they exist
  result = result.replace(/<meta name="title" content=".*?"\s*\/?>/gi, '');
  result = result.replace(/<meta name="description" content=".*?"\s*\/?>/gi, '');
  result = result.replace(/<meta property="og:.*?="\s*\/?>/gi, '');
  result = result.replace(/<meta property="twitter:.*?="\s*\/?>/gi, '');
  result = result.replace(/<meta property="article:.*?="\s*\/?>/gi, '');

  // Inject right before </head>
  result = result.replace('</head>', `${advancedMetaTags}\n  </head>`);

  return result;
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Serve index.html for all non-api client routes in dev
    app.get("*", async (req, res, next) => {
      // Skip API routes or requests with file extensions
      if (req.originalUrl.startsWith("/api") || req.originalUrl.includes(".")) {
        return next();
      }
      try {
        let template = fs.readFileSync(
          path.resolve(process.cwd(), "index.html"),
          "utf-8"
        );
        template = await vite.transformIndexHtml(req.originalUrl, template);
        
        // Dynamically inject high-fidelity SEO metadata
        const meta = await getMetadataForRoute(req.originalUrl);
        template = injectMetaTags(template, meta);

        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static assets with strict defensive caching headers
    app.use(express.static(distPath, {
      maxAge: "1y",
      immutable: true,
      setHeaders: (res, filePath) => {
        // Enforce re-validation on index.html, service worker, and app config manifests
        if (filePath.endsWith(".html") || filePath.includes("sw.js") || filePath.endsWith("manifest.json")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        } else {
          // JS, CSS, Fonts, Icons assets are highly secure with long-term immutable caching
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    }));

    app.get("*", async (req, res) => {
      // Set short-lived caching on HTML fallback to prevent client code staleness
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      
      try {
        let template = fs.readFileSync(path.join(distPath, "index.html"), "utf-8");
        
        // Dynamically inject high-fidelity SEO metadata
        const meta = await getMetadataForRoute(req.originalUrl);
        template = injectMetaTags(template, meta);

        res.status(200).set({ "Content-Type": "text/html" }).send(template);
      } catch (err) {
        console.error("[SEO Middleware Production Error]", err);
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
