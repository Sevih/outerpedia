import Link from 'next/link';
import type { Route } from 'next';
import type { Lang } from '@/lib/i18n/config';
import type { TranslationKey } from '@/i18n';
import type { ResolvedChangelogEntry } from '@/lib/data/changelog';
import { localePath } from '@/lib/navigation';
import { cn } from '@/lib/cn';
import { bulletSegments, isBulletLink, type BulletText } from '@/lib/changelog-bullets';
import {
  CHANGELOG_TYPE_BADGE,
  CHANGELOG_TYPE_ICON,
  changelogGotoKey,
  changelogHref,
  changelogThumb,
  formatChangelogDate,
} from './presentation';

/** Le style des liens des puces : celui des liens des événements (`EventBlocks`). */
const BULLET_LINK = 'text-accent relative z-10 underline-offset-2 hover:underline';

/** Des morceaux de texte d'une puce, le gras en `<strong>`. */
const texts = (parts: BulletText[]) =>
  parts.map((s, k) => (s.bold ? <strong key={k}>{s.text}</strong> : s.text));

/**
 * Une carte d'entrée du journal (page `/changelog`). Toute la carte est
 * cliquable quand l'entrée porte un lien (grande cible), sinon inerte. Les
 * puces passent par `bulletSegments` : le gras `**…**` et les liens
 * `[libellé](cible)`.
 *
 * Lien ÉTIRÉ plutôt qu'une carte `<a>` : un lien de puce dans une carte-lien
 * serait un `<a>` dans un `<a>` (HTML invalide). La carte est un `<article>`
 * `relative isolate` ; son lien est l'appel « Voir … → », dont le `::after`
 * couvre toute la carte ; les liens des puces passent au-dessus (`relative
 * z-10`, contenu par `isolate`). Le `::after` ne peut pas partir du titre : les
 * titres sont `position: relative` (leur liseré, globals.css), il n'en
 * couvrirait que le titre.
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
  // Le titre décrit le lien de la carte, dont le texte n'est que « Voir … ».
  const titleId = `changelog-${entry.id}-title`;

  return (
    <article
      className={cn('card relative isolate flex gap-4 p-4 md:p-5', href && 'card-interactive')}
    >
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
            className={`text-3xs rounded px-2 py-0.5 font-semibold tracking-wide uppercase ${CHANGELOG_TYPE_BADGE[entry.type]}`}
          >
            {t(`changelog.type.${entry.type}` as TranslationKey)}
          </span>
          <time dateTime={entry.date} className="text-content-subtle text-xs tabular-nums">
            {formatChangelogDate(entry.date, lang)}
          </time>
        </div>

        <Title id={titleId} className="text-content-strong text-base leading-snug font-bold">
          {entry.title}
        </Title>

        {entry.content.length > 0 && (
          <ul className="text-content-muted mt-1.5 list-disc space-y-1 pl-5 text-sm">
            {entry.content.map((line, i) => (
              <li key={i}>
                {bulletSegments(line).map((s, k) => {
                  if (!isBulletLink(s)) return s.bold ? <strong key={k}>{s.text}</strong> : s.text;
                  return s.external ? (
                    <a
                      key={k}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={BULLET_LINK}
                    >
                      {texts(s.label)}
                    </a>
                  ) : (
                    <Link key={k} href={localePath(lang, s.href) as Route} className={BULLET_LINK}>
                      {texts(s.label)}
                    </Link>
                  );
                })}
              </li>
            ))}
          </ul>
        )}

        {entry.link && href && (
          <Link
            href={localePath(lang, href) as Route}
            aria-describedby={titleId}
            className="text-accent mt-2.5 inline-flex items-center gap-1 text-sm font-medium after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:[outline:auto]"
          >
            {t(changelogGotoKey(entry.link.kind))}
            <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </article>
  );
}
