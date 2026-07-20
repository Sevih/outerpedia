import Link from 'next/link';
import type { Route } from 'next';
import type { Lang } from '@/lib/i18n/config';
import type { TranslationKey } from '@/i18n';
import type { ResolvedChangelogEntry } from '@/lib/data/changelog';
import { localePath } from '@/lib/navigation';
import { ChangelogEntryCard } from '@/components/changelog/ChangelogEntryCard';

/**
 * Section « Mises à jour récentes » de la home : les 5 dernières entrées du
 * journal, rendues avec la MÊME carte que la page `/changelog` (cohérence de
 * design), plus un lien « voir tout ». RSC pure.
 */
export function RecentUpdates({
  entries,
  lang,
  title,
  viewAll,
  t,
}: {
  entries: ResolvedChangelogEntry[];
  lang: Lang;
  title: string;
  viewAll: string;
  t: (key: TranslationKey) => string;
}) {
  if (entries.length === 0) return null;

  return (
    <section>
      <h2 className="text-content-strong mb-6 text-2xl font-bold">{title}</h2>

      <div className="flex flex-col gap-3">
        {entries.map((entry, i) => (
          <ChangelogEntryCard
            key={`${entry.date}-${i}`}
            entry={entry}
            lang={lang}
            t={t}
            titleTag="h3"
          />
        ))}
      </div>

      <div className="mt-4 text-center">
        <Link
          href={localePath(lang, '/changelog') as Route}
          className="text-accent text-sm hover:underline"
        >
          {viewAll}
        </Link>
      </div>
    </section>
  );
}
