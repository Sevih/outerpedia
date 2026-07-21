import Link from 'next/link';
import { getT, type TFunction } from '@/i18n';
import { LANGUAGES, type Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { img } from '@/lib/images';
import { serverNow } from '@/lib/time';
import { getMonster, monsterDisplayNames } from '@/lib/data/monsters';
import {
  singularityGroups,
  singularityStateAt,
  type SingularityBoss,
} from '@/lib/data/singularity';
import { GuideCard } from '@/components/guides/GuideCard';
import { SingularityCountdown } from '@/components/guides/SingularityCountdown';
import { formatGuideDate, guideUpdatedDate, type Guide } from '@/lib/data/guides';
import type { Monster } from '@contracts';
import type { CategoryViewProps } from './types';

/**
 * Vue DIMENSIONAL SINGULARITY : le boss du jour d'abord, la bibliothèque ensuite.
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
 *    que parce que le modèle de la V2 était faux ;
 *  - sur mobile, les trois autres jours restent VISIBLES (la V2 les masquait).
 *
 * Le rendu dépend du JOUR → la route est purgée chaque nuit (`/api/revalidate`).
 */
export default async function SingularityRotation({ lang, guides }: CategoryViewProps) {
  const t = await getT(lang);
  const state = singularityStateAt(serverNow());

  const guideOf = new Map<string, Guide>();
  for (const g of guides) if (g.bossId) guideOf.set(g.bossId, g);
  const attached = new Set(guideOf.values());
  const looseGuides = guides.filter((g) => !attached.has(g));

  // Bibliothèque : chaque boss DISTINCT. Urd / Verdandi / Skuld existent en DEUX
  // exemplaires (lumière et ténèbres) : même nom, même sprite, mais élément et
  // donjon différents — on déduplique par MONSTRE, pas par nom.
  const seen = new Set<string>();
  const library: SingularityBoss[] = [];
  for (const group of singularityGroups())
    for (const boss of group.bosses) {
      const key = boss.monsters[0];
      if (!key || seen.has(key)) continue;
      seen.add(key);
      library.push(boss);
    }

  // Noms désambiguïsés sur TOUTE la bibliothèque, pas sur la seule semaine :
  // « Urd (Light) » doit se lire ainsi même la semaine où « Urd (Dark) » ne
  // tourne pas — sinon le nom d'une carte changerait d'une semaine à l'autre.
  const names = monsterDisplayNames(
    library.map((b) => b.monsters[0]),
    lang,
  );

  const days = state.week.days;
  const featured = days.find((d) => d.state === 'today') ?? days[0];
  const rail = days.filter((d) => d !== featured);
  const opensOn = days[0]?.date;

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col gap-5">
        <header className="border-line-subtle relative flex flex-col gap-2 border-b pb-4">
          <span
            className="bg-accent absolute -bottom-px left-0 h-0.5 w-14 rounded-full"
            aria-hidden
          />
          <h2 className="text-content-strong text-xl font-semibold tracking-tight md:text-2xl">
            <span className="md:hidden">
              {t(
                state.betweenWeeks
                  ? 'guides.singularity.next_week.title'
                  : 'guides.singularity.week.title_mobile',
              )}
            </span>
            <span className="hidden md:inline">
              {t(
                state.betweenWeeks
                  ? 'guides.singularity.next_week.title'
                  : 'guides.singularity.week.title',
              )}
            </span>
          </h2>

          {/* Ligne d'état : pastille battante « en cours » + compte à rebours vers
              la bascule de 00:00 UTC. En phase de récompense, aucun boss n'est
              actif : on n'affiche pas de pastille mensongère. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] font-semibold tracking-[0.16em] uppercase">
            {!state.betweenWeeks && featured && (
              <>
                <span className="text-accent inline-flex items-center gap-1.5">
                  <span className="relative inline-flex size-2">
                    <span className="bg-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
                    <span className="bg-accent relative inline-flex size-2 rounded-full" />
                  </span>
                  {t('guides.singularity.week.live', {
                    dow: weekday(featured.date, lang).toUpperCase(),
                  })}
                </span>
                <span className="text-content-subtle">·</span>
              </>
            )}
            {/* La CIBLE et le MOT vont ensemble. En jours de combat, l'échéance
                est le minuit UTC qui fait tourner le boss du jour — « prochain
                reset ». En phase de récompense, non : rien ne se passe à minuit,
                la seule échéance est l'OUVERTURE de la rotation, jusqu'à trois
                jours plus loin — « ouvre dans ». Décompter vers minuit sous un
                titre « Prochaine rotation » annonçait une échéance qui n'existait
                pas.
                Sans variables, `t` rend le gabarit tel quel : le `{time}` reste
                à substituer côté client, à chaque seconde. */}
            <SingularityCountdown
              target={state.nextChange}
              template={t(
                state.betweenWeeks
                  ? 'guides.singularity.timer.opens'
                  : 'guides.singularity.timer.next',
              )}
              className="text-content tabular-nums"
            />
          </div>

          <p className="text-content-muted text-sm">
            {state.betweenWeeks && opensOn
              ? t('guides.singularity.next_week.tagline', { date: formatGuideDate(opensOn, lang) })
              : t('guides.singularity.week.tagline')}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-[3fr_2fr]">
          {featured && (
            <FeaturedBanner
              day={featured}
              name={names.get(featured.boss.monsters[0]) ?? ''}
              lang={lang}
              t={t}
              guide={guideOf.get(featured.boss.monsters[0])}
            />
          )}
          <div className="flex flex-col gap-3">
            {rail.map((day) => (
              <RailBanner
                key={day.date}
                day={day}
                name={names.get(day.boss.monsters[0]) ?? ''}
                lang={lang}
                guide={guideOf.get(day.boss.monsters[0])}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <header className="border-line-subtle relative flex flex-col gap-2 border-b pb-4">
          <span
            className="bg-accent absolute -bottom-px left-0 h-0.5 w-14 rounded-full"
            aria-hidden
          />
          <h2 className="text-content-strong text-xl font-semibold tracking-tight md:text-2xl">
            {t('guides.singularity.library.title')}
          </h2>
          <p className="text-content-muted text-sm">{t('guides.singularity.library.tagline')}</p>
        </header>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {library.map((boss) => (
            <LibraryCard
              key={boss.monsters[0]}
              boss={boss}
              name={names.get(boss.monsters[0]) ?? ''}
              lang={lang}
              t={t}
              guide={guideOf.get(boss.monsters[0])}
              active={state.today?.monsters[0] === boss.monsters[0]}
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

/** Identité du boss : élément + classe, en icônes encadrées (comme la V2). */
function Identity({
  monster,
  size,
  overlay = false,
}: {
  monster: Monster;
  size: 'sm' | 'md';
  /** Posée SUR la bannière : il lui faut son propre fond, l'art est clair. */
  overlay?: boolean;
}) {
  const box = size === 'md' ? 'h-6.5 w-6.5' : 'h-5 w-5';
  const skin = overlay
    ? 'border-line/60 bg-surface-base/75 backdrop-blur-[2px]'
    : 'border-line-subtle bg-surface-base';
  return (
    <span className="flex shrink-0 items-center gap-1">
      {[img.element(monster.element), img.klass(monster.class)].map((src, i) => (
        <span
          key={i}
          className={`inline-flex items-center justify-center rounded-md border p-0.5 ${skin} ${box}`}
        >
          <img src={src} alt="" className="h-full w-full object-contain" />
        </span>
      ))}
    </span>
  );
}

type Day = ReturnType<typeof singularityStateAt>['week']['days'][number];

/** Cliquable seulement si un guide couvre le boss : un lien mort vaut moins que pas de lien. */
function Frame({
  guide,
  lang,
  className,
  children,
}: {
  guide?: Guide;
  lang: Lang;
  className: string;
  children: React.ReactNode;
}) {
  if (!guide) return <div className={className}>{children}</div>;
  return (
    <Link href={localePath(lang, `/guides/${guide.category}/${guide.slug}`)} className={className}>
      {children}
    </Link>
  );
}

/**
 * Le boss DU JOUR : bannière large (`T_Singularity_*`, ratio 680×94 du jeu),
 * titre et description SOUS l'image — c'est la carte qu'on lit, elle a la place.
 */
function FeaturedBanner({
  day,
  name,
  lang,
  t,
  guide,
}: {
  day: Day;
  name: string;
  lang: Lang;
  t: TFunction;
  guide?: Guide;
}) {
  const monster = getMonster(day.boss.monsters[0]);
  if (!monster || !day.boss.banner) return null;
  const isToday = day.state === 'today';

  return (
    <Frame guide={guide} lang={lang} className="group flex flex-col gap-2">
      <div
        className={`relative aspect-680/94 w-full overflow-hidden rounded-lg border ${
          isToday ? 'border-accent ring-accent/40 ring-1' : 'border-line-subtle'
        }`}
      >
        <img
          src={img.singularity(day.boss.banner)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isToday && <span className="bg-accent absolute inset-y-0 left-0 w-0.75" aria-hidden />}
      </div>

      <div className="flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h3 className="text-content-strong group-hover:text-accent line-clamp-1 text-base font-semibold tracking-tight transition-colors sm:text-lg">
            {name}
          </h3>
          {guide && (
            <p className="text-content-muted mt-1 line-clamp-2 text-sm">
              {lRec(guide.description, lang)}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Identity monster={monster} size="md" />
          <span
            className={`inline-flex items-center gap-1 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase ${
              isToday ? 'text-accent' : 'text-content-subtle'
            }`}
          >
            {isToday && <span className="bg-accent size-1.5 rounded-full" aria-hidden />}
            {isToday ? t('guides.singularity.week.today') : weekday(day.date, lang).toUpperCase()}
          </span>
        </div>
      </div>
    </Frame>
  );
}

/**
 * Les AUTRES jours de la semaine : tout tient SUR la bannière — jour, classe et
 * élément en haut à droite, nom en bas à droite. C'est la géométrie du jeu, et
 * la seule qui laisse trois cartes tenir dans la colonne sans l'allonger.
 * L'art est clair : le nom se pose avec une ombre portée, pas un voile — le voile
 * mangerait l'illustration, qui est justement ce qui identifie le boss.
 */
function RailBanner({
  day,
  name,
  lang,
  guide,
}: {
  day: Day;
  name: string;
  lang: Lang;
  guide?: Guide;
}) {
  const monster = getMonster(day.boss.monsters[0]);
  if (!monster || !day.boss.banner) return null;

  return (
    <Frame
      guide={guide}
      lang={lang}
      className={`group block transition-opacity ${
        day.state === 'past' ? 'opacity-55 hover:opacity-100' : 'opacity-90 hover:opacity-100'
      }`}
    >
      <div className="border-line-subtle group-hover:border-accent/60 relative aspect-680/94 w-full overflow-hidden rounded-lg border transition-colors">
        <img
          src={img.singularity(day.boss.banner)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />

        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
          <Identity monster={monster} size="sm" overlay />
          <span className="border-line/60 bg-surface-base/75 text-content-strong inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-[0.14em] uppercase backdrop-blur-[2px]">
            {weekday(day.date, lang).toUpperCase()}
          </span>
        </div>

        <h3 className="text-content-strong absolute right-2 bottom-1 line-clamp-1 max-w-[80%] text-right text-xs font-semibold tracking-tight drop-shadow-[0_1px_3px_rgb(0_0_0/0.9)] sm:text-sm">
          {name}
        </h3>
      </div>
    </Frame>
  );
}

/** Carte de bibliothèque : avatar rond du mode + identité + pied éditorial. */
function LibraryCard({
  boss,
  name,
  lang,
  t,
  guide,
  active,
}: {
  boss: SingularityBoss;
  name: string;
  lang: Lang;
  t: TFunction;
  guide?: Guide;
  active: boolean;
}) {
  const monster = getMonster(boss.monsters[0]);
  if (!monster) return null;

  const body = (
    <>
      <div className="flex items-start gap-3">
        <img
          src={boss.thumbnail ? img.singularity(boss.thumbnail) : img.boss(`MT_${monster.icon}`)}
          alt=""
          className={`h-12 w-12 shrink-0 rounded-lg border object-cover ${
            active ? 'border-accent' : 'border-line-subtle'
          }`}
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-content-strong group-hover:text-accent line-clamp-2 text-sm font-semibold transition-colors">
            {name}
          </h3>
          <div className="mt-1.5">
            <Identity monster={monster} size="sm" />
          </div>
        </div>
        {active && (
          <span className="relative inline-flex size-2 shrink-0">
            <span className="bg-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
            <span className="bg-accent relative inline-flex size-2 rounded-full" />
          </span>
        )}
      </div>
      {guide && (
        <div className="border-line-subtle text-content-subtle mt-auto flex items-center justify-between gap-3 border-t pt-2.5 font-mono text-[9.5px] tracking-[0.12em] uppercase">
          <span>{t('page.guide.by', { author: guide.author })}</span>
          <span>{formatGuideDate(guideUpdatedDate(guide), lang)}</span>
        </div>
      )}
    </>
  );

  const frame = `group flex min-h-30 flex-col gap-3 rounded-xl border p-4 transition-colors ${
    active ? 'border-accent bg-accent/5' : 'border-line-subtle bg-surface-raised'
  }`;
  if (!guide) return <div className={frame}>{body}</div>;
  return (
    <Link
      href={localePath(lang, `/guides/${guide.category}/${guide.slug}`)}
      className={`${frame} hover:border-accent`}
    >
      {body}
    </Link>
  );
}
