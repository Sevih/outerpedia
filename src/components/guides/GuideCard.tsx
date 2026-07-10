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
}: {
  guide: Guide;
  lang: Lang;
  /** Ligne méta déjà localisée (« Updated Mar 24, 2026 · Sevih »). */
  updatedText: string;
}) {
  return (
    <Link
      href={localePath(lang, `/guides/${guide.category}/${guide.slug}`)}
      className="border-line-subtle bg-surface-raised hover:border-line group flex gap-4 rounded-lg border p-4 shadow-sm transition-colors"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
      <img
        src={img.guideIcon(guide.icon)}
        alt=""
        className="h-12 w-12 shrink-0 object-contain"
        loading="lazy"
      />
      <div className="min-w-0">
        <h2 className="text-content-strong group-hover:text-accent font-semibold transition-colors">
          {lRec(guide.title, lang)}
        </h2>
        <p className="text-content-muted mt-1 line-clamp-2 text-sm">
          {lRec(guide.description, lang)}
        </p>
        <p className="text-content-muted mt-2 text-xs">{updatedText}</p>
      </div>
    </Link>
  );
}
