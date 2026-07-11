'use client';

import { useState } from 'react';
import { statAbbr } from '@/lib/stats';
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

/** Libellés DÉJÀ localisés (composant client : il ne traduit pas). */
export interface BossStatsLabels {
  level: string;
  /** « Palier » — titre du sélecteur en mode à score. */
  rank: string;
  /** « Dégâts à infliger » : la tranche qui DÉFINIT le palier. */
  damage: string;
  /** « Barre du palier » — surtout PAS « PV du boss » (cf. commentaire). */
  rankBar: string;
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
 *    qu'on inflige. Sa « barre » (`bossHp`) vaut exactement la largeur de cette
 *    tranche : la vider, c'est franchir le palier. Ce ne sont donc PAS les PV du
 *    boss, et on ne les affiche jamais comme tels — la valeur n'est même pas
 *    monotone (la barre A+ est plus étroite que la barre A, parce que sa tranche
 *    l'est). L'afficher en « HP » ferait croire que le boss s'affaiblit.
 */
export function BossStats({
  stats,
  scales,
  spawns,
  quirkMods,
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
  labels: BossStatsLabels;
  /** Locale BCP-47, pour le formatage des grands nombres. */
  locale: string;
  /** Passifs de palier DÉJÀ localisés (id d'option → libellé). */
  rankOptionLabels?: Record<string, string>;
}) {
  const options = dedupSpawnContexts(spawns);
  const [selected, setSelected] = useState<number>(options.length ? options.length - 1 : -1);
  const ctx: SpawnContext = options[selected] ?? { level: 100 };

  const scoreMode = Boolean(ctx.damage);
  const num = (n: number) => n.toLocaleString(locale);
  // En mode à score, les PV sortent de la grille : `statAt` y rendrait la barre
  // du palier, qu'on affiche à part, avec son vrai sens.
  const grid = orderedStats(stats).filter(([slug]) => !(scoreMode && slug === 'hp'));
  const passives = (ctx.options ?? [])
    .map((id) => rankOptionLabels?.[id])
    .filter((l): l is string => Boolean(l));

  return (
    <div className="space-y-3">
      {options.length > 1 &&
        // 30 paliers en Singularity : une rangée de boutons serait illisible.
        (options.length > 6 ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-content-muted">{scoreMode ? labels.rank : labels.level}</span>
            {ctx.rank && (
              /* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */
              <img
                src={img.rankBadge(rankBadgeSprite(ctx.rank))}
                alt={ctx.rank}
                className="h-7 w-7 shrink-0 object-contain"
              />
            )}
            <select
              value={selected}
              onChange={(e) => setSelected(Number(e.target.value))}
              className="border-line bg-surface-base text-content focus:border-accent rounded-md border px-2 py-1 text-sm focus:outline-none"
            >
              {options.map((s, i) => (
                <option key={i} value={i}>
                  {s.rank ? `${s.rank} — ` : ''}
                  {labels.level} {s.level}
                </option>
              ))}
            </select>
          </div>
        ) : (
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
                {s.rank ? `${s.rank} · ` : ''}
                {s.level}
              </button>
            ))}
          </div>
        ))}

      {scoreMode && ctx.damage && (
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div className="border-line-subtle bg-surface-raised rounded-md border px-3 py-1.5">
            <div className="text-content-muted text-xs">{labels.damage}</div>
            <div className="text-content-strong">
              {ctx.damage.max
                ? `${num(ctx.damage.min ?? 0)} – ${num(ctx.damage.max)}`
                : `${num(ctx.damage.min ?? 0)}+`}
            </div>
          </div>
          <div className="border-line-subtle bg-surface-raised rounded-md border px-3 py-1.5">
            <div className="text-content-muted text-xs">{labels.rankBar}</div>
            <div className="text-content-strong">{num(ctx.bossHp ?? 0)}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 lg:grid-cols-5">
        {grid.map(([slug, r]) => (
          <div
            key={slug}
            className="border-line-subtle bg-surface-raised rounded-md border px-3 py-1.5"
          >
            <div className="text-content-muted text-xs">{statAbbr(slug)}</div>
            <div className="text-content-strong">
              {formatMonsterStat(slug, statAt(slug, r, ctx, quirkMods), scales)}
              {slug === 'hp' && ctx.hpLines ? (
                <span className="text-content-muted ml-1 text-xs">× {ctx.hpLines}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {passives.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-content-muted text-xs">{labels.options}</h4>
          <div className="flex flex-wrap gap-1.5">
            {passives.map((label) => (
              <span
                key={label}
                className="border-line-subtle bg-surface-raised text-content rounded-full border px-2 py-0.5 text-xs"
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
