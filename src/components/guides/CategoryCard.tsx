import Link from 'next/link';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { img } from '@/lib/images';
import { GUIDE_CATEGORIES, type GuideCategorySlug } from '@/lib/data/guide-categories';
import { GUIDE_ACCENT } from './guide-accents';

/**
 * Carte d'une catégorie sur la landing /guides (visuel V2) : tuile d'icône et
 * pastille de compteur teintées à l'accent de la catégorie, halo au survol.
 */
export function CategoryCard({
  slug,
  lang,
  countLabel,
}: {
  slug: GuideCategorySlug;
  lang: Lang;
  /** Pastille déjà localisée (« 4 GUIDES »). */
  countLabel: string;
}) {
  const cat = GUIDE_CATEGORIES[slug];
  const accent = GUIDE_ACCENT[slug];

  return (
    <Link
      href={localePath(lang, `/guides/${slug}`)}
      className={[
        'group bg-surface-overlay/50 relative flex items-start gap-4 overflow-hidden rounded-xl border p-4 transition-[transform,border-color,box-shadow] duration-150',
        'focus-visible:ring-ring hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none',
        'border-line-subtle',
        accent.hoverBorder,
        accent.glow,
      ].join(' ')}
    >
      <div
        className={[
          'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-linear-to-br to-transparent',
          accent.iconBorder,
          accent.iconFrom,
        ].join(' ')}
      >
        <img
          src={img.guideIcon(cat.icon)}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-contain p-1"
          loading="lazy"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          {/* `static pb-0 after:hidden` : neutralise le trait de titre global. */}
          <h2 className="text-content-strong static pb-0 text-sm font-semibold after:hidden">
            {lRec(cat.label, lang)}
          </h2>
          <span
            className={[
              'shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9.5px] font-semibold tracking-[0.14em] uppercase',
              accent.pillBg,
              accent.pillBorder,
              accent.text,
            ].join(' ')}
          >
            {countLabel}
          </span>
        </div>
        <p className="text-content-muted mt-1 text-xs">{lRec(cat.desc, lang)}</p>
      </div>
    </Link>
  );
}
