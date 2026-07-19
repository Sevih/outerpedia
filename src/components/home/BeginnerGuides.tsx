import Link from 'next/link';
import type { Route } from 'next';
import type { Lang } from '@/lib/i18n/config';
import type { TranslationKey } from '@/i18n';
import { localePath } from '@/lib/navigation';

/**
 * Guides débutants — liste fixe des 5 entrées de `general-guides` (contrat V2).
 * Certaines cibles peuvent être en cours de portage : le lien existe, la page
 * s'allume quand le guide atterrit. Section purement statique (clés `home.beginner.*`).
 */
const GUIDES: { key: string; nameKey: TranslationKey; descKey: TranslationKey; slug: string }[] = [
  {
    key: 'faq',
    nameKey: 'home.beginner.faq',
    descKey: 'home.beginner.faq.desc',
    slug: 'beginner-faq',
  },
  {
    key: 'freeheroes',
    nameKey: 'home.beginner.freeheroes',
    descKey: 'home.beginner.freeheroes.desc',
    slug: 'free-heroes-start-banner',
  },
  {
    key: 'stats',
    nameKey: 'home.beginner.stats',
    descKey: 'home.beginner.stats.desc',
    slug: 'stats',
  },
  { key: 'gear', nameKey: 'home.beginner.gear', descKey: 'home.beginner.gear.desc', slug: 'gear' },
  {
    key: 'growth',
    nameKey: 'home.beginner.growth',
    descKey: 'home.beginner.growth.desc',
    slug: 'heroes-growth',
  },
];

const CATEGORY = 'general-guides';

export function BeginnerGuides({
  lang,
  title,
  t,
}: {
  lang: Lang;
  title: string;
  t: (key: TranslationKey) => string;
}) {
  return (
    <section>
      <h2 className="text-content-strong mb-6 text-2xl font-bold">{title}</h2>
      <div className="border-line-subtle bg-surface-raised rounded-xl border">
        <ol className="divide-line-subtle grid grid-cols-1 divide-y md:grid-cols-5 md:divide-x md:divide-y-0">
          {GUIDES.map((guide, i) => (
            <li key={guide.key}>
              <Link
                href={localePath(lang, `/guides/${CATEGORY}/${guide.slug}`) as Route}
                className="hover:bg-surface-muted flex h-full items-start gap-3 px-3 py-2.5 transition md:flex-col md:items-stretch md:gap-2 md:p-4"
              >
                <span className="text-accent shrink-0 font-mono text-xs font-semibold tracking-wider uppercase md:text-[11px]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-content-strong text-sm leading-tight font-semibold">
                    {t(guide.nameKey)}
                  </p>
                  <p className="text-content-subtle mt-0.5 text-xs leading-snug md:mt-1 md:leading-relaxed">
                    {t(guide.descKey)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
