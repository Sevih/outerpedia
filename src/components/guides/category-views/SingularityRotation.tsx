import Link from 'next/link';
import { getT, type TFunction } from '@/i18n';
import { LANGUAGES, type Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { img } from '@/lib/images';
import { serverNow } from '@/lib/time';
import { getMonster } from '@/lib/data/monsters';
import {
  singularityGroups,
  singularityStateAt,
  type SingularityBoss,
} from '@/lib/data/singularity';
import { GuideCard } from '@/components/guides/GuideCard';
import { formatGuideDate, guideUpdatedDate, type Guide } from '@/lib/data/guides';
import type { CategoryViewProps } from './types';

/**
 * Vue DIMENSIONAL SINGULARITY : la rotation d'abord, la bibliothèque ensuite.
 *
 * Cette catégorie n'est pas une liste : sa valeur est de dire QUEL BOSS EST
 * ACTIF AUJOURD'HUI. Les guides s'y accrochent par le monstre combattu
 * (`meta.bossId`) — aucun mapping manuel.
 *
 * Écarts ASSUMÉS avec la V2, tous des corrections :
 *  - un boss PAR JOUR (mer→sam), pas « trois du mer au ven + un le samedi » ;
 *  - la section ne DISPARAÎT PAS du dimanche au mardi (elle bascule sur la
 *    rotation à venir) ;
 *  - pas de mise en avant « boss du week-end » en ambre : ce concept n'existait
 *    que parce que le modèle de la V2 était faux. Avec un boss par jour, le
 *    samedi n'a rien de particulier.
 *
 * Le rendu dépend du JOUR → la route est purgée chaque nuit (`/api/revalidate`).
 * Sans ça, l'ISR de 24 h servirait le boss d'hier.
 */
export default async function SingularityRotation({ lang, guides }: CategoryViewProps) {
  const t = await getT(lang);
  const state = singularityStateAt(serverNow());

  // Index monstre → guide : c'est la donnée qui relie, pas une table à la main.
  const guideOf = new Map<string, Guide>();
  for (const g of guides) if (g.bossId) guideOf.set(g.bossId, g);
  const attached = new Set(guideOf.values());
  const looseGuides = guides.filter((g) => !attached.has(g));

  // Bibliothèque : chaque boss DISTINCT de la rotation. Attention, Urd /
  // Verdandi / Skuld existent en DEUX exemplaires (lumière et ténèbres) : même
  // nom, même sprite, mais élément et donjon différents. Ce ne sont pas des
  // doublons — on déduplique par MONSTRE, pas par nom.
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

  const [today, ...rest] = [
    ...state.week.days.filter((d) => d.state === 'today'),
    ...state.week.days.filter((d) => d.state !== 'today'),
  ];
  const opensOn = state.week.days[0]?.date;

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-5">
        <SectionHeader
          title={t(
            state.betweenWeeks
              ? 'guides.singularity.next_week.title'
              : 'guides.singularity.week.title',
          )}
          tagline={
            state.betweenWeeks && opensOn
              ? t('guides.singularity.next_week.tagline', {
                  date: formatGuideDate(opensOn, lang),
                })
              : t('guides.singularity.week.tagline')
          }
        />
        {/* La bannière du jour domine ; les autres jours tiennent dans un rail.
            Sur mobile, le rail passe SOUS elle au lieu de disparaître (la V2 le
            masquait — les trois autres boss de la semaine étaient invisibles). */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[3fr_2fr]">
          <BannerCard
            day={today}
            lang={lang}
            t={t}
            guide={guideOf.get(today.boss.monsters[0])}
            featured
          />
          <div className="flex flex-col gap-3">
            {rest.map((day) => (
              <BannerCard
                key={day.date}
                day={day}
                lang={lang}
                t={t}
                guide={guideOf.get(day.boss.monsters[0])}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeader
          title={t('guides.singularity.library.title')}
          tagline={t('guides.singularity.library.tagline')}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {library.map((boss) => (
            <LibraryCard
              key={boss.monsters[0]}
              boss={boss}
              lang={lang}
              guide={guideOf.get(boss.monsters[0])}
              active={state.today?.monsters[0] === boss.monsters[0]}
              t={t}
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

/** En-tête de section : filet d'accent + titre + accroche. */
function SectionHeader({ title, tagline }: { title: string; tagline: string }) {
  return (
    <header className="border-line-subtle relative flex flex-col gap-2 border-b pb-4">
      <span className="bg-accent absolute -bottom-px left-0 h-0.5 w-14 rounded-full" aria-hidden />
      <h2 className="text-content-strong text-xl font-semibold tracking-tight md:text-2xl">
        {title}
      </h2>
      <p className="text-content-muted text-sm">{tagline}</p>
    </header>
  );
}

/** Nom du jour, localisé, dérivé de la DATE — pas d'une liste de libellés figée. */
function weekday(iso: string, lang: Lang): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(LANGUAGES[lang].htmlLang, {
    weekday: 'short',
    timeZone: 'UTC',
  });
}

type Day = ReturnType<typeof singularityStateAt>['week']['days'][number];

/**
 * Bannière large d'un jour de rotation (`T_Singularity_*`, ratio 680×94 du jeu).
 * `featured` = le boss du jour : plus grand, mis en avant. Les jours passés sont
 * atténués. Cliquable seulement si un guide couvre le boss — un lien mort vaut
 * moins que pas de lien.
 */
function BannerCard({
  day,
  lang,
  t,
  guide,
  featured = false,
}: {
  day: Day;
  lang: Lang;
  t: TFunction;
  guide?: Guide;
  featured?: boolean;
}) {
  const monster = getMonster(day.boss.monsters[0]);
  if (!monster || !day.boss.banner) return null;
  const name = lRec(monster.name, lang);
  const isToday = day.state === 'today';

  const body = (
    <>
      <div
        className={`relative aspect-680/94 w-full overflow-hidden rounded-lg border ${
          isToday ? 'border-accent ring-accent/40 ring-1' : 'border-line-subtle'
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
        <img
          src={img.singularity(day.boss.banner)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        {isToday && <span className="bg-accent absolute inset-y-0 left-0 w-0.75" aria-hidden />}
      </div>
      <div className="flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h3
            className={`text-content-strong line-clamp-1 font-semibold tracking-tight ${
              featured ? 'text-base sm:text-lg' : 'text-sm'
            }`}
          >
            {name}
          </h3>
          <p className="text-content-muted mt-0.5 text-xs capitalize">{monster.element}</p>
        </div>
        <span
          className={`shrink-0 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase ${
            isToday ? 'text-accent' : 'text-content-subtle'
          }`}
        >
          {isToday ? t('guides.singularity.week.today') : weekday(day.date, lang)}
        </span>
      </div>
    </>
  );

  const frame = `group flex flex-col gap-2 ${day.state === 'past' ? 'opacity-60 hover:opacity-100' : ''} transition-opacity`;
  if (!guide) return <div className={frame}>{body}</div>;
  return (
    <Link href={localePath(lang, `/guides/${guide.category}/${guide.slug}`)} className={frame}>
      {body}
    </Link>
  );
}

/** Carte de bibliothèque : avatar rond du mode (`MT_Singularity_*`) + identité. */
function LibraryCard({
  boss,
  lang,
  guide,
  active,
  t,
}: {
  boss: SingularityBoss;
  lang: Lang;
  guide?: Guide;
  active: boolean;
  t: TFunction;
}) {
  const monster = getMonster(boss.monsters[0]);
  if (!monster) return null;
  const name = lRec(monster.name, lang);

  const body = (
    <div className="flex items-start gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
      <img
        src={boss.thumbnail ? img.singularity(boss.thumbnail) : img.boss(`MT_${monster.icon}`)}
        alt=""
        className="border-line-subtle h-12 w-12 shrink-0 rounded-lg border object-cover"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <h3 className="text-content-strong line-clamp-2 text-sm font-semibold">{name}</h3>
        <div className="mt-1 flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img src={img.element(monster.element)} alt="" className="h-4 w-4" />
          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img src={img.klass(monster.class)} alt="" className="h-4 w-4" />
        </div>
      </div>
      {active && (
        <span className="text-accent shrink-0 font-mono text-[9.5px] font-semibold tracking-[0.12em] uppercase">
          {t('guides.singularity.week.today')}
        </span>
      )}
    </div>
  );

  const frame = `rounded-xl border p-4 transition-colors ${
    active ? 'border-accent bg-accent/5' : 'border-line-subtle bg-surface-raised'
  }`;
  if (!guide) return <div className={frame}>{body}</div>;
  return (
    <Link
      href={localePath(lang, `/guides/${guide.category}/${guide.slug}`)}
      className={`${frame} hover:border-accent block`}
    >
      {body}
    </Link>
  );
}
