import React, { useMemo } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Wand2, Loader2 } from 'lucide-react';

interface SEOAnalyzerProps {
  title: string;
  content: string;
  summary: string;
  keyword: string;
  onFixSEO?: (issues: string[]) => void;
  isFixing?: boolean;
}

export function SEOAnalyzer({ title, content, summary, keyword, onFixSEO, isFixing }: SEOAnalyzerProps) {
  const analysis = useMemo(() => {
    const results = [];
    let score = 100;

    // Title Check
    if (title.length < 30) {
      results.push({ type: 'warning', text: 'Title is too short. Aim for 50-60 characters.' });
      score -= 10;
    } else if (title.length > 60) {
      results.push({ type: 'warning', text: 'Title is too long. Keep it under 60 characters to avoid truncation.' });
      score -= 5;
    } else {
      results.push({ type: 'success', text: 'Title length is optimal.' });
    }

    // Keyword in Title
    if (keyword && title.toLowerCase().includes(keyword.toLowerCase())) {
      results.push({ type: 'success', text: 'Target keyword found in title.' });
    } else if (keyword) {
      results.push({ type: 'error', text: 'Target keyword missing from title.' });
      score -= 15;
    }

    // Content Length Check
    const wordCount = content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    if (wordCount < 300) {
      results.push({ type: 'error', text: `Content is too thin (${wordCount} words). Minimum 300 words recommended.` });
      score -= 20;
    } else {
      results.push({ type: 'success', text: `Content length is good (${wordCount} words).` });
    }

    // Keyword in Content
    if (keyword && content.toLowerCase().includes(keyword.toLowerCase())) {
      results.push({ type: 'success', text: 'Target keyword found in content.' });
    } else if (keyword) {
      results.push({ type: 'warning', text: 'Target keyword missing from content body.' });
      score -= 10;
    }

    // Headings Check
    if (/<h[2-6]>/i.test(content)) {
      results.push({ type: 'success', text: 'Content uses subheadings (H2, H3, etc.) for structure.' });
    } else {
      results.push({ type: 'warning', text: 'No subheadings found. Use H2/H3 tags to break up text.' });
      score -= 10;
    }

    // Images Alt Text
    const imgTags: string[] = content.match(/<img[^>]+>/g) || [];
    let missingAlt = false;
    imgTags.forEach(img => {
      if (!img.includes('alt=') || img.includes('alt=""') || img.includes("alt=''")) {
        missingAlt = true;
      }
    });
    if (imgTags.length > 0) {
      if (missingAlt) {
        results.push({ type: 'warning', text: 'Some images are missing alt text.' });
        score -= 5;
      } else {
        results.push({ type: 'success', text: 'All images have alt text.' });
      }
    } else {
      results.push({ type: 'warning', text: 'No images found in the content body.' });
      score -= 5;
    }

    // Summary length
    if (summary.length < 50) {
      results.push({ type: 'warning', text: 'Meta description/summary is too short.' });
      score -= 5;
    } else if (summary.length > 160) {
      results.push({ type: 'warning', text: 'Meta description/summary is too long (over 160 chars).' });
      score -= 5;
    } else {
      results.push({ type: 'success', text: 'Meta description length is optimal.' });
    }

    score = Math.max(0, score);
    return { score, results };
  }, [title, content, summary, keyword]);

  const issuesToFix = analysis.results.filter(r => r.type !== 'success').map(r => r.text);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          SEO Analyzer
        </h4>
        <div className="flex items-center gap-3">
          {analysis.score < 90 && onFixSEO && (
            <button 
              onClick={() => onFixSEO(issuesToFix)}
              disabled={isFixing}
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-full text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isFixing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              {isFixing ? 'Fixing...' : 'Auto-Fix SEO'}
            </button>
          )}
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${analysis.score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : analysis.score >= 50 ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}`}>
            Score: {analysis.score}/100
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {analysis.results.map((result, idx) => (
          <div key={idx} className="flex gap-3 text-sm">
            {result.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
            {result.type === 'warning' && <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />}
            {result.type === 'error' && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
            <span className={result.type === 'success' ? 'text-gray-600 dark:text-gray-400' : result.type === 'warning' ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white font-medium'}>
              {result.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
