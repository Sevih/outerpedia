'use client';

import { useState } from 'react';
import { img } from '@/lib/images';
import { rankBadgeSprite } from '@/lib/ranks';
import {
  dedupSpawnContexts,
  formatMonsterStat,
  orderedStats,
  statAt,
  type SpawnContext,
  type StatRange,
} from '@/lib/monster-stats';

/** Un grade (E, D, C…) et ses crans (E, E+, E++), dans l'ordre des paliers. */
interface RankGrade {
  name: string;
  items: { index: number; rank: string; level: number }[];
}

/**
 * Groupe les paliers par GRADE — le nom moins ses « + ». Les 30 paliers de
 * Singularity forment 10 grades de 3 crans, mais on ne le suppose pas : le
 * regroupement suit les noms tels qu'ils viennent de la donnée, en conservant
 * l'ordre. Une échelle irrégulière (ou un palier ajouté par un patch) se range
 * donc toute seule.
 */
function rankGrades(options: SpawnContext[]): RankGrade[] {
  const grades: RankGrade[] = [];
  options.forEach((s, index) => {
    if (!s.rank) return;
    const name = s.rank.replace(/\+/g, '');
    const last = grades[grades.length - 1];
    const item = { index, rank: s.rank, level: s.level };
    if (last && last.name === name) last.items.push(item);
    else grades.push({ name, items: [item] });
  });
  return grades;
}

/** Une stat, prête à afficher : le jeu la nomme, on ne fait que la poser. */
export interface StatLabel {
  /** Abréviation canonique (`ATK`) — affichée quand le jeu n'a pas d'icône. */
  abbr: string;
  /** Nom complet localisé (« Attack ») — au survol, et pour les lecteurs d'écran. */
  name: string;
  /** Sprite `CM_Stat_Icon_*`, absent pour la WG (cf. `statIconSprite`). */
  icon?: string;
}

/** Libellés DÉJÀ localisés (composant client : il ne traduit pas). */
export interface BossStatsLabels {
  level: string;
  /** « Palier » — titre du sélecteur en mode à score. */
  rank: string;
  /** « Passifs du palier ». */
  options: string;
}

/**
 * Stats d'un boss À LA RENCONTRE — calcul partagé avec la carte admin
 * (src/lib/monster-stats) : ordre de l'écran du jeu, EFF/RES en valeur brute,
 * modificateurs du donjon appliqués, quirks de compte déduits.
 *
 * DEUX RÉGIMES :
 *  - rencontre simple → les stats au niveau du spawn ;
 *  - MODE À SCORE (le palier porte une tranche de dégâts : Singularity…) → le
 *    palier n'est pas une difficulté qu'on choisit, c'est la TRANCHE DE DÉGÂTS
 *    qu'on inflige. Ce que la donnée appelle les « PV » du boss vaut alors
 *    exactement la LARGEUR de cette tranche — ce ne sont pas des PV, et la
 *    valeur n'est même pas monotone (la barre A+ est plus étroite que la barre
 *    A). On ne l'affiche donc pas : sortie de la grille, point. Ce qui compte
 *    pour préparer le combat, ce sont les stats du boss et ses passifs de palier.
 */
export function BossStats({
  stats,
  scales,
  spawns,
  quirkMods,
  statLabels,
  labels,
  locale,
  rankOptionLabels,
}: {
  stats: Record<string, StatRange>;
  /** Échelle d'affichage par slug (`percent` = per-mille → %). */
  scales: Record<string, string>;
  /** Rencontres réelles du boss (contexte de donjon inclus). */
  spawns: SpawnContext[];
  /** Quirks de compte réduisant les stats du boss (`glossaries.bossQuirkMods`). */
  quirkMods?: Record<string, number>;
  /** Icône + nom de chaque stat, par slug (préparés côté serveur). */
  statLabels: Record<string, StatLabel>;
  labels: BossStatsLabels;
  /** Locale BCP-47, pour le formatage des grands nombres. */
  locale: string;
  /** Passifs de palier DÉJÀ localisés (id d'option → libellé). */
  rankOptionLabels?: Record<string, string>;
}) {
  const options = dedupSpawnContexts(spawns);
  // Par défaut le PREMIER palier : c'est celui qu'on affronte d'abord. Ouvrir sur
  // SSS++ montrait un boss que presque personne ne combat, et donnait des stats
  // décourageantes à qui découvre le mode.
  const [selected, setSelected] = useState(0);
  const ctx: SpawnContext = options[selected] ?? { level: 100 };

  const scoreMode = Boolean(ctx.damage);
  const grid = orderedStats(stats).filter(([slug]) => !(scoreMode && slug === 'hp'));
  const passives = (ctx.options ?? [])
    .map((id) => rankOptionLabels?.[id])
    .filter((l): l is string => Boolean(l));

  const hasRanks = Boolean(options[0]?.rank);

  return (
    <div className="space-y-4">
      {/* PALIERS À GAUCHE, STATS À DROITE. Le palier n'est pas un réglage qu'on
          pousse en haut de page et qu'on oublie : on le change POUR regarder les
          stats bouger. Les deux doivent tenir dans un même coup d'œil. */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {hasRanks && options.length > 1 && (
          <div className="border-line-subtle bg-surface-raised flex shrink-0 flex-col gap-3 rounded-lg border p-3">
            {/* Le palier COURANT, en grand : la réponse à « je regarde quoi ? ». */}
            <div className="flex items-center gap-3">
              {ctx.rank && (
                /* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */
                <img
                  src={img.rankBadge(rankBadgeSprite(ctx.rank))}
                  alt=""
                  className="h-14 w-14 shrink-0 object-contain"
                />
              )}
              <div className="flex flex-col gap-0.5">
                <span className="text-content-subtle font-mono text-[10px] font-semibold tracking-[0.14em] uppercase">
                  {scoreMode ? labels.rank : labels.level}
                </span>
                <span className="text-content-strong text-2xl leading-none font-bold">
                  {ctx.rank}
                </span>
                <span className="text-content-muted text-xs">
                  {labels.level} {ctx.level}
                </span>
              </div>
            </div>

            {/* SUR ÉCRAN LARGE : toute l'échelle, en badges — une LIGNE par grade
                (E, E+, E++), donc trois colonnes. Le badge est la langue du jeu ;
                un menu déroulant ne dit ni où l'on est dans l'échelle, ni ce qui
                reste. Les grades sont groupés depuis les NOMS, pas depuis une
                liste figée : un palier ajouté par un patch se range tout seul. */}
            <div className="hidden flex-col gap-1 sm:flex">
              {rankGrades(options).map((grade) => (
                <div key={grade.name} className="flex gap-1">
                  {grade.items.map(({ index, rank, level }) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelected(index)}
                      aria-pressed={index === selected}
                      title={`${rank} — ${labels.level} ${level}`}
                      className={`rounded transition-all ${
                        index === selected
                          ? 'ring-accent bg-accent/10 ring-2'
                          : 'opacity-40 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                      <img
                        src={img.rankBadge(rankBadgeSprite(rank))}
                        alt={rank}
                        className="h-8 w-8 object-contain"
                      />
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* AU DOIGT : 30 badges ne tiennent pas, et 32 px n'est pas une cible
                tactile. Le déroulant reste la bonne réponse ici. */}
            <select
              value={selected}
              onChange={(e) => setSelected(Number(e.target.value))}
              aria-label={scoreMode ? labels.rank : labels.level}
              className="border-line bg-surface-base text-content focus:border-accent rounded-md border px-2 py-1.5 text-sm focus:outline-none sm:hidden"
            >
              {options.map((s, i) => (
                <option key={i} value={i}>
                  {s.rank} — {labels.level} {s.level}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-3">
          {/* Rencontres sans palier (difficultés nommées) : quelques boutons suffisent. */}
          {!hasRanks && options.length > 1 && (
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <span className="text-content-muted mr-1">{labels.level}</span>
              {options.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  title={s.label}
                  onClick={() => setSelected(i)}
                  className={`rounded px-2 py-0.5 transition-colors ${
                    i === selected
                      ? 'bg-accent/15 text-accent ring-accent/40 ring-1'
                      : 'bg-surface-raised text-content-muted hover:text-content-strong'
                  }`}
                >
                  {s.level}
                </button>
              ))}
            </div>
          )}

          {/* Icône + valeur, comme l'écran du jeu. Le nom complet reste atteignable
              (survol, lecteur d'écran) : l'abréviation était une convention de wiki,
              l'icône est la langue du jeu. Faute d'icône (WG), l'abréviation revient. */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {grid.map(([slug, r]) => {
              const label = statLabels[slug];
              return (
                <div
                  key={slug}
                  title={label?.name}
                  className="border-line-subtle bg-surface-raised flex items-center gap-2 rounded-md border px-2.5 py-2"
                >
                  {label?.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
                    <img
                      src={img.statIcon(label.icon)}
                      alt=""
                      className="h-6 w-6 shrink-0 object-contain"
                    />
                  ) : (
                    <span className="text-content-subtle w-6 shrink-0 text-center text-[10px] font-semibold">
                      {label?.abbr ?? slug}
                    </span>
                  )}
                  <span className="text-content-strong min-w-0 truncate text-sm font-semibold tabular-nums">
                    {formatMonsterStat(slug, statAt(slug, r, ctx, quirkMods), scales, locale)}
                    {slug === 'hp' && ctx.hpLines ? (
                      <span className="text-content-muted ml-1 text-xs">× {ctx.hpLines}</span>
                    ) : null}
                  </span>
                  <span className="sr-only">{label?.name ?? slug}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {passives.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-content-subtle font-mono text-[10px] font-semibold tracking-[0.14em] uppercase">
            {labels.options}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {passives.map((label) => (
              <span
                key={label}
                className="border-line-subtle bg-surface-raised text-content rounded-full border px-2.5 py-0.5 text-xs"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {options.length === 1 && (
        <p className="text-content-muted text-xs">
          {labels.level} {ctx.level}
          {ctx.label ? ` — ${ctx.label}` : ''}
        </p>
      )}
    </div>
  );
}
