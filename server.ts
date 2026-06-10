import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

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
  const modelsToTry = [
    primaryModel,
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest"
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
    // Retry up to 3 times for transient errors on the current model
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[Gemini SDK] Trying model "${currentModel}" (attempt ${attempt}/3)...`);
        
        const currentParams = { ...params, model: currentModel };

        // Fallbacks may not support tools (like googleSearch / search grounding), so strip them if not using the primary
        if (currentModel !== primaryModel && (currentParams.tools || currentParams.config?.tools)) {
          console.log(`[Gemini SDK Fallback] Stripping tools on fallback model to maximize success.`);
          delete currentParams.tools;
          if (currentParams.config) {
            const { tools, toolConfig, ...restConfig } = currentParams.config;
            currentParams.config = restConfig;
          }
        }

        return await ai.models.generateContent(currentParams);
      } catch (error: any) {
        lastError = error;
        const errMsg = error.message || String(error);
        console.warn(`[Gemini SDK Error] Model "${currentModel}" failed:`, errMsg);

        // Call is transient if 503, 429, UNAVAILABLE, RESOURCE_EXHAUSTED or high demand
        const isTransient = errMsg.includes("503") || 
                            errMsg.includes("429") || 
                            errMsg.includes("UNAVAILABLE") || 
                            errMsg.includes("RESOURCE_EXHAUSTED") ||
                            /high demand/i.test(errMsg);

        if (isTransient && attempt < 3) {
          const delayMs = attempt * 1500;
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
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200"
  ],
  crypto: [
    "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=1200"
  ],
  startups: [
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200"
  ],
  markets: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=1200"
  ],
  default: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200"
  ]
};

// AI Content Generation Endpoint
app.post("/api/ai/generate-blog", async (req, res) => {
  try {
    const { topic, keyword, categoryId, tone, length, imageType } = req.body;

    if (!topic || !keyword) {
      return res.status(400).json({ error: "Topic and keyword are required." });
    }

    const catId = categoryId || "ai";

    // Step 1: Research Phase using search grounding
    const researchPrompt = `Conduct comprehensive research on the topic: "${topic}". 
Target Keyword: "${keyword}".
Analyze real-world information, identify trending sub-topics, extract relevant SEO keywords, and suggest a solid structue for a blog post.
Return the result primarily focusing on the target keywords and search intent (informational/transactional/navigational).`;

    const researchResponse = await generateContentWithRetry({
      model: "gemini-3.1-flash-lite",
      contents: researchPrompt,
      tools: [{ googleSearch: {} }] // Using Search Grounding Mode
    });

    const researchData = researchResponse.text;

    // Step 2: Content Writing Phase
    const writePrompt = `Write a full SEO-optimized article on the topic: "${topic}".
Target Keyword: "${keyword}".
Tone: ${tone || 'Professional'}.
Length: ${length || 'Medium (around 800-1000 words)'}.

Use the following research data to ground the article and make it authoritative:
---
${researchData}
---

Format using HTML tags (excluding <html>, <head>, or <body>). 
Focus on structured format:
- Catchy SEO-optimized Title (wrap in <h1>)
- Meta description (briefly written at the top in a blockquote or <p> tag, clearly labeled)
- H2 / H3 sections
- FAQ section
- Do not use markdown backticks for HTML block. Just return pure HTML.
- Provide a natural readability, avoid keyword stuffing, feel human-written, and optimized for Google ranking.

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
    const cleanContent = fullContent
      .replace(/IMAGE_PROMPT:\s*(.*)/g, '')
      .replace(/SUMMARY:\s*([\s\S]*)/, '')
      .trim();

    // Step 3: Image Acquisition Phase
    let generatedImages: string[] = [];
    
    if (imageType === 'stock') {
      // AI search for stock images (dynamically build keyword-tagged, stunning Unsplash endpoints)
      const searchTerms = encodeURIComponent(keyword + " " + topic);
      const categoryTerms = encodeURIComponent(catId);
      
      const unsplash1 = `https://images.unsplash.com/featured/1200x675/?sig=1&${searchTerms}`;
      const unsplash2 = `https://images.unsplash.com/featured/1200x675/?sig=2&${categoryTerms}`;
      
      // Select a backup from our local elite gallery
      const gallery = STOCK_GALLERY[catId] || STOCK_GALLERY.default;
      const backupImg = gallery[Math.floor(Math.random() * gallery.length)];
      
      generatedImages = [unsplash1, unsplash2, backupImg];
    } else {
      // imageType === 'ai': generate images in parallel to solve slow response times
      const promptsToRun = imagePrompts.slice(0, 3);
      if (promptsToRun.length === 0) {
        promptsToRun.push(`A realistic, professional hero image representing: ${topic}`);
      }

      const imagePromises = promptsToRun.map(async (prompt) => {
        try {
          const imageRes = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9'
            }
          });
          if (imageRes?.generatedImages?.[0]?.image?.imageBytes) {
            const base64EncodeString = imageRes.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64EncodeString}`;
          }
          return null;
        } catch (err) {
          console.error("Image generation failed for prompt:", prompt, err);
          return null;
        }
      });

      const results = await Promise.all(imagePromises);
      generatedImages = results.filter((img): img is string => img !== null);

      if (generatedImages.length === 0) {
        const gallery = STOCK_GALLERY[catId] || STOCK_GALLERY.default;
        generatedImages = [gallery[0]];
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
      seoKeyword: keyword
    });

  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: "Failed to generate AI content" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
