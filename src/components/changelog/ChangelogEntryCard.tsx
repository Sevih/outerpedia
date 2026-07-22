import Link from 'next/link';
import type { Route } from 'next';
import type { Lang } from '@/lib/i18n/config';
import type { TranslationKey } from '@/i18n';
import type { ResolvedChangelogEntry } from '@/lib/data/changelog';
import { localePath } from '@/lib/navigation';
import {
  CHANGELOG_TYPE_BADGE,
  CHANGELOG_TYPE_ICON,
  changelogGotoKey,
  changelogHref,
  changelogThumb,
  formatChangelogDate,
} from './presentation';

/**
 * Une carte d'entrée du journal (page `/changelog`). Toute la carte est un lien
 * quand l'entrée en porte un (grande cible), sinon un `<article>` inerte.
 */
export function ChangelogEntryCard({
  entry,
  lang,
  t,
  titleTag = 'h2',
}: {
  entry: ResolvedChangelogEntry;
  lang: Lang;
  t: (key: TranslationKey) => string;
  /** Niveau du titre — `h2` sur la page dédiée (sous le h1), `h3` sous un h2 de section (home). */
  titleTag?: 'h2' | 'h3';
}) {
  const href = changelogHref(entry.link);
  const thumb = changelogThumb(entry);
  const Title = titleTag;

  const inner = (
    <>
      <div className="bg-surface-overlay border-line-subtle grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg border text-2xl">
        {thumb ? (
          <img src={thumb} alt="" aria-hidden loading="lazy" className="size-full object-cover" />
        ) : (
          <span aria-hidden>{CHANGELOG_TYPE_ICON[entry.type]}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
          <span
            className={`rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${CHANGELOG_TYPE_BADGE[entry.type]}`}
          >
            {t(`changelog.type.${entry.type}` as TranslationKey)}
          </span>
          <time dateTime={entry.date} className="text-content-subtle text-xs tabular-nums">
            {formatChangelogDate(entry.date, lang)}
          </time>
        </div>

        <Title className="text-content-strong text-base leading-snug font-bold">
          {entry.title}
        </Title>

        {entry.content.length > 0 && (
          <ul className="text-content-muted mt-1.5 list-disc space-y-1 pl-5 text-sm">
            {entry.content.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}

        {entry.link && (
          <span className="text-accent mt-2.5 inline-flex items-center gap-1 text-sm font-medium">
            {t(changelogGotoKey(entry.link.kind))}
            <span aria-hidden>→</span>
          </span>
        )}
      </div>
    </>
  );

  const base = 'flex gap-4 p-4 md:p-5';
  return href ? (
    <Link href={localePath(lang, href) as Route} className={`card card-interactive ${base}`}>
      {inner}
    </Link>
  ) : (
    <article className={`card ${base}`}>{inner}</article>
  );
}
