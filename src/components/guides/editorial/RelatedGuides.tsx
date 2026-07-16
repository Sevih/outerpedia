/**
 * Guides connexes en fin de guide — cartes icône + titre + description.
 *
 * Les métadonnées viennent du DATA LAYER des guides (source unique : le scan
 * de `_contents/`), là où la V2 relisait `_index.json` à la main. Une référence
 * (catégorie, slug) inconnue CASSE le build : un guide renommé ne laisse jamais
 * une carte morte.
 */
import Link from 'next/link';
import type { Route } from 'next';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { img } from '@/lib/images';
import { localePath } from '@/lib/navigation';
import { getGuide } from '@/lib/data/guides';
import { cn } from '@/lib/cn';
import { EDITORIAL_ACCENT, type EditorialAccent } from './accents';

export interface RelatedGuideRef {
  category: string;
  slug: string;
  accent: EditorialAccent;
}

export function RelatedGuides({
  lang,
  title,
  items,
}: {
  lang: Lang;
  /** Titre de la section, DÉJÀ localisé. */
  title: string;
  items: RelatedGuideRef[];
}) {
  return (
    <section className="mt-2">
      <div className="mb-5 flex items-center gap-3.5">
        <h2 className="text-content-strong text-xl font-semibold tracking-tight">{title}</h2>
        <span className="bg-line h-px flex-1 opacity-50" aria-hidden />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map(({ category, slug, accent }) => {
          const guide = getGuide(category, slug);
          if (!guide) {
            throw new Error(`RelatedGuides : guide inconnu — ${category}/${slug}`);
          }
          const a = EDITORIAL_ACCENT[accent];
          return (
            <Link
              key={`${category}/${slug}`}
              href={localePath(lang, `/guides/${category}/${slug}`) as Route}
              className="border-line-subtle bg-surface-raised/60 hover:border-line flex items-center gap-3.5 rounded-xl border px-4 py-3.5 transition-colors"
            >
              <span
                className={cn(
                  'inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-linear-to-br to-transparent',
                  a.chipBorder,
                  a.from,
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                <img
                  src={img.guideIcon(guide.icon)}
                  alt=""
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-content-strong block text-sm font-semibold">
                  {lRec(guide.title, lang)}
                </span>
                <span className="text-content-subtle mt-0.5 block text-xs leading-snug">
                  {lRec(guide.description, lang)}
                </span>
              </span>
              <span className={cn('shrink-0 text-base', a.text)} aria-hidden>
                →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
