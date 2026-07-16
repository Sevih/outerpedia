import Link from 'next/link';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { img } from '@/lib/images';
import type { Guide } from '@/lib/data/guides';

/** Carte d'un guide dans la liste d'une catégorie. */
export function GuideCard({
  guide,
  lang,
  updatedText,
  iconSrc,
}: {
  guide: Guide;
  lang: Lang;
  /** Ligne méta déjà localisée (« Updated Mar 24, 2026 · Sevih »). */
  updatedText: string;
  /**
   * Vignette de REMPLACEMENT (URL complète) — pour une vue qui montre autre
   * chose que l'icône du meta (le portrait du boss, déjà servi sous son
   * namespace : on ne recopie pas un sprite pour changer de cadrage).
   */
  iconSrc?: string;
}) {
  return (
    // Même gabarit que les cartes de la landing /guides (CategoryCard) : tuile
    // d'icône 48px avec respiration, titre text-sm, description text-xs.
    <Link
      href={localePath(lang, `/guides/${guide.category}/${guide.slug}`)}
      className="group border-line-subtle bg-surface-overlay/50 hover:border-line flex items-start gap-4 rounded-xl border p-4 transition-[transform,border-color] duration-150 hover:-translate-y-px"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
      <img
        src={iconSrc ?? img.guideIcon(guide.icon)}
        alt=""
        className="h-12 w-12 shrink-0 object-contain p-1"
        loading="lazy"
      />
      <div className="min-w-0">
        {/* `static pb-0 after:hidden` : neutralise le trait de titre global. */}
        <h2 className="text-content-strong group-hover:text-accent static pb-0 text-sm font-semibold transition-colors after:hidden">
          {lRec(guide.title, lang)}
        </h2>
        <p className="text-content-muted mt-1 line-clamp-2 text-xs">
          {lRec(guide.description, lang)}
        </p>
        <p className="text-content-subtle mt-2 text-xs">{updatedText}</p>
      </div>
    </Link>
  );
}
