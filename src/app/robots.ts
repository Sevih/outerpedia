import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo';

/**
 * robots.txt. Décision GEO : on AUTORISE explicitement les crawlers des moteurs
 * génératifs (pour être cité par ChatGPT/Claude/Perplexity/Google AI Overviews).
 * Outils locaux (admin/api/dev) exclus.
 */
export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();
  const disallow = ['/admin', '/api', '/dev'];
  const aiBots = ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      ...aiBots.map((userAgent) => ({ userAgent, allow: '/', disallow })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
