import Link from 'next/link';
import { getT, type TFunction } from '@/i18n';
import { LANGUAGES, type Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { img } from '@/lib/images';
import { serverNow } from '@/lib/time';
import { getMonster, monsterIconSrc } from '@/lib/data/monsters';
import {
  singularityGroups,
  singularityStateAt,
  type SingularityBoss,
} from '@/lib/data/singularity';
import { GuideCard } from '@/components/guides/GuideCard';
import { formatGuideDate, guideUpdatedDate, type Guide } from '@/lib/data/guides';
import type { CategoryViewProps } from './types';

/**
 * Vue DIMENSIONAL SINGULARITY : la rotation d'abord, les guides ensuite.
 *
 * Cette catégorie n'est pas une liste : sa valeur est de dire QUEL BOSS EST
 * ACTIF AUJOURD'HUI. Les guides s'y accrochent par le monstre combattu
 * (`meta.bossId`), comme les cartes de saison — aucun mapping manuel.
 *
 * Deux écarts assumés avec la V2, tous deux des corrections :
 *  - un boss PAR JOUR (mer→sam), pas « trois du mer au ven + un le samedi » ;
 *  - la section ne DISPARAÎT PAS du dimanche au mardi : pendant la phase de
 *    récompense, elle bascule sur la rotation à venir.
 *
 * Le rendu dépend du jour → la route est purgée chaque nuit (cf.
 * `TIME_SENSITIVE_ROUTES` dans `src/app/api/revalidate/route.ts`). Sans ça,
 * l'ISR de 24 h afficherait le boss d'hier.
 */
export default async function SingularityRotation({ lang, guides }: CategoryViewProps) {
  const t = await getT(lang);
  const state = singularityStateAt(serverNow());

  // Index monstre → guide : c'est la donnée qui relie, pas une table à la main.
  const guideByMonster = new Map<string, Guide>();
  for (const g of guides) if (g.bossId) guideByMonster.set(g.bossId, g);

  const attached = new Set(guideByMonster.values());
  const looseGuides = guides.filter((g) => !attached.has(g));

  // Bibliothèque : chaque boss DISTINCT de la rotation (les groupes réutilisent
  // les mêmes boss — les lister par groupe en afficherait plusieurs fois).
  const seen = new Set<string>();
  const library: SingularityBoss[] = [];
  for (const group of singularityGroups()) {
    for (const boss of group.bosses) {
      const key = boss.monsters[0];
      if (!key || seen.has(key)) continue;
      seen.add(key);
      library.push(boss);
    }
  }

  const nextOpen = state.week.days[0]?.date;

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <header>
          <h2 className="text-content-strong text-lg font-semibold">
            {t(
              state.betweenWeeks
                ? 'guides.singularity.next_week.title'
                : 'guides.singularity.week.title',
            )}
          </h2>
          <p className="text-content-muted mt-1 text-sm">
            {state.betweenWeeks && nextOpen
              ? t('guides.singularity.next_week.tagline', {
                  date: formatGuideDate(nextOpen, lang),
                })
              : t('guides.singularity.week.tagline')}
          </p>
        </header>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {state.week.days.map((day) => (
            <BossCard
              key={day.date}
              boss={day.boss}
              lang={lang}
              t={t}
              guide={guideByMonster.get(day.boss.monsters[0])}
              dayLabel={weekday(day.date, lang)}
              dateLabel={formatGuideDate(day.date, lang)}
              today={day.state === 'today'}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <header>
          <h2 className="text-content-strong text-lg font-semibold">
            {t('guides.singularity.library.title')}
          </h2>
          <p className="text-content-muted mt-1 text-sm">
            {t('guides.singularity.library.tagline')}
          </p>
        </header>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {library.map((boss) => (
            <BossCard
              key={boss.monsters[0]}
              boss={boss}
              lang={lang}
              t={t}
              guide={guideByMonster.get(boss.monsters[0])}
            />
          ))}
        </div>
      </section>

      {looseGuides.length > 0 && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {looseGuides.map((g) => (
            <GuideCard
              key={g.slug}
              guide={g}
              lang={lang}
              updatedText={`${t('page.guide.updated', {
                date: formatGuideDate(guideUpdatedDate(g), lang),
              })} · ${g.author}`}
            />
          ))}
        </section>
      )}
    </div>
  );
}

/** Nom du jour, localisé, dérivé de la DATE — pas d'une liste de libellés figée. */
function weekday(iso: string, lang: Lang): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(LANGUAGES[lang].htmlLang, {
    weekday: 'short',
    timeZone: 'UTC',
  });
}

/**
 * Carte d'un boss. Cliquable UNIQUEMENT si un guide le couvre : un lien mort
 * vaudrait moins que pas de lien — le boss reste affiché, la rotation aussi.
 */
function BossCard({
  boss,
  lang,
  t,
  guide,
  dayLabel,
  dateLabel,
  today = false,
}: {
  boss: SingularityBoss;
  lang: Lang;
  t: TFunction;
  guide?: Guide;
  dayLabel?: string;
  dateLabel?: string;
  today?: boolean;
}) {
  const monster = getMonster(boss.monsters[0]);
  if (!monster) return null;

  const name = lRec(monster.name, lang);
  const body = (
    <>
      {dayLabel && (
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span
            className={`font-mono text-[11px] font-semibold uppercase ${
              today ? 'text-accent' : 'text-content-muted'
            }`}
          >
            {today ? t('guides.singularity.week.today') : dayLabel}
          </span>
          <span className="text-content-subtle text-[10px]">{dateLabel}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
        <img
          src={monsterIconSrc(monster)}
          alt=""
          className="h-12 w-12 shrink-0 rounded object-contain"
          loading="lazy"
        />
        <div className="min-w-0">
          <p className="text-content-strong truncate text-sm font-medium">{name}</p>
          <span className="mt-0.5 flex items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img src={img.element(monster.element)} alt="" className="h-3.5 w-3.5" />
            <span className="text-content-muted text-xs capitalize">{monster.element}</span>
          </span>
        </div>
      </div>
    </>
  );

  const frame = `rounded-lg border p-3 ${
    today ? 'border-accent bg-accent/5' : 'border-line-subtle bg-surface-raised'
  }`;

  if (!guide) return <div className={frame}>{body}</div>;
  return (
    <Link
      href={localePath(lang, `/guides/${guide.category}/${guide.slug}`)}
      className={`${frame} hover:border-accent block transition-colors`}
    >
      {body}
    </Link>
  );
}
