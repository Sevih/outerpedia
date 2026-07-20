import type { Metadata } from 'next';
import { normalizeLang } from '@/lib/i18n/config';
import { getT, type TranslationKey } from '@/i18n';
import { createPageMetadata } from '@/lib/seo';
import { getToolsByCategory } from '@/lib/data/tools';
import { asAccentKey } from '@/components/tools/toolsTheme';
import { ToolsBrowser, type ToolGroupVM } from '@/components/tools/ToolsBrowser';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);
  return createPageMetadata({
    lang,
    path: '/tools',
    title: t('page.tools.title'),
    description: t('page.tools.description'),
  });
}

/**
 * Landing des outils (catégories + cartes). Les cartes pointent l'URL À PLAT
 * `/(slug)` (parité prod V2, routeur `[lang]/[slug]`) ; les outils non encore
 * portés y renvoient un 404. Libellés/titres/desc résolus côté serveur (i18n),
 * filtrage/hash côté client (`ToolsBrowser`). Page statique, revalidation 24 h.
 */
export default async function ToolsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);

  const groups: ToolGroupVM[] = getToolsByCategory().map((g) => {
    const categoryLabel = t(`tools.category.${g.category.slug}` as TranslationKey);
    return {
      slug: g.category.slug,
      label: categoryLabel,
      tools: g.tools.map((tool) => ({
        slug: tool.slug,
        icon: tool.icon,
        title: t(`tools.${tool.slug}` as TranslationKey),
        desc: t(`tools.${tool.slug}.desc` as TranslationKey),
        status: tool.status,
        // `href` curé = renvoi vers une page existante (coupon-codes → /coupons).
        href: tool.href ?? `/${tool.slug}`,
        category: asAccentKey(g.category.slug),
        categoryLabel,
      })),
    };
  });

  const total = groups.reduce((n, g) => n + g.tools.length, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-content-strong text-3xl font-bold">{t('page.tools.title')}</h1>
        <p className="text-content-muted mx-auto mt-2 max-w-2xl text-sm">
          {t('page.tools.description')}
        </p>
        <p className="text-content-subtle mt-3 font-mono text-[10px] tracking-[0.14em] uppercase">
          {t('tools.count').replace('{count}', String(total))}
        </p>
      </div>

      <ToolsBrowser
        groups={groups}
        allLabel={t('common.all')}
        comingSoonLabel={t('common.coming_soon')}
        countLabel={t('tools.count')}
        featured={{
          featured: t('tools.featured'),
          ribbon: {
            most_used: t('tools.ribbon.most_used'),
            community_pick: t('tools.ribbon.community_pick'),
            new: t('tools.ribbon.new'),
          },
        }}
      />
    </div>
  );
}
