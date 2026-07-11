'use client';

import { useState } from 'react';
import { statAbbr } from '@/lib/stats';
import {
  dedupSpawnContexts,
  formatMonsterStat,
  orderedStats,
  statAt,
  type SpawnContext,
  type StatRange,
} from '@/lib/monster-stats';

/**
 * Stats d'un monstre À LA RENCONTRE (calcul partagé avec la carte publique,
 * cf. src/lib/monster-stats) : un bouton = une rencontre réelle — mode, stage
 * et palier DÉTERMINENT tout (niveau, modificateurs per-mille, PV du mode) →
 * pas de sélecteur de niveau libre ni de fourchettes, les valeurs affichées
 * sont CELLES du spawn. Sans rencontre connue : valeurs du templet au Lv 100.
 */
export function MonsterStatsCard({
  stats,
  scales,
  spawns,
  optionLabels = {},
  quirkMods,
}: {
  stats: Record<string, StatRange>;
  /** Échelle d'affichage par slug (`percent` = per-mille → %). */
  scales: Record<string, string>;
  /** Rencontres réelles du monstre. */
  spawns: SpawnContext[];
  /** Libellés résolus des passifs de palier (id OptionID → texte humain). */
  optionLabels?: Record<string, string>;
  /** Quirks de compte réduisant les stats du boss (per-mille signés). */
  quirkMods?: Record<string, number>;
}) {
  const options = dedupSpawnContexts(spawns);
  const [selected, setSelected] = useState<number>(options.length ? options.length - 1 : -1);
  const ctx: SpawnContext = options[selected] ?? { level: 100 };
  const modified = Boolean(ctx.adv || ctx.bossHp);

  return (
    <div className="space-y-2">
      {options.length > 1 && (
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-content-subtle mr-1">Rencontre :</span>
          {options.map((s, i) => (
            <button
              key={i}
              type="button"
              title={s.label}
              onClick={() => setSelected(i)}
              className={`rounded px-2 py-0.5 ${
                i === selected
                  ? 'bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-400/40'
                  : 'bg-surface-raised text-content-subtle hover:text-content'
              }`}
            >
              {s.rank ? `${s.rank} · ` : ''}Lv {s.level}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        {orderedStats(stats).map(([slug, r]) => (
          <div key={slug} className="border-line-subtle rounded-md border px-3 py-1.5">
            <div className="text-content-subtle text-xs">{statAbbr(slug)}</div>
            <div className="text-content">
              {formatMonsterStat(slug, statAt(slug, r, ctx, quirkMods), scales)}
              {slug === 'hp' && ctx.hpLines ? (
                <span className="text-content-subtle ml-1 text-xs">× {ctx.hpLines} barres</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <p className="text-content-subtle text-xs">
        {options.length === 0 ? (
          <>Aucune rencontre connue — valeurs du templet au Lv {ctx.level}.</>
        ) : (
          <>
            Lv {ctx.level}
            {ctx.transLevel ? ` · transcendance ${ctx.transLevel}` : ''}
            {ctx.adv
              ? ` · modificateurs (${Object.entries(ctx.adv)
                  .map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v / 10}%`)
                  .join(', ')})`
              : ''}
            {ctx.damage
              ? ` · tranche : ${ctx.damage.min?.toLocaleString('en') ?? '0'} – ${
                  ctx.damage.max ? ctx.damage.max.toLocaleString('en') : '∞'
                } dégâts`
              : ''}
            {ctx.bossHp
              ? ` · ${ctx.damage ? 'barre du palier' : 'PV du mode'} : ${ctx.bossHp.toLocaleString('en')}`
              : ''}
            {quirkMods && Object.keys(quirkMods).length
              ? ` · quirks appliqués (${Object.entries(quirkMods)
                  .map(([s, v]) => `${statAbbr(s)} ${v > 0 ? '+' : ''}${v / 10}%`)
                  .join(', ')})`
              : ''}
            {!modified ? ' · valeurs du templet interpolées' : ''}
            {ctx.label ? ` — ${ctx.label}` : ''}
            {ctx.rank ? ` (palier ${ctx.rank})` : ''}
          </>
        )}
      </p>
      {ctx.options && ctx.options.length > 0 && (
        <p className="text-content-subtle text-xs">
          Passifs additionnels du palier :{' '}
          {/* Dédup d'affichage : certains paliers listent des copies techniques
              du même buff (Normal_1_1/Normal_1_2 → même libellé). */}
          {[...new Set(ctx.options.map((o) => optionLabels[o] ?? o))].join(' · ')}
        </p>
      )}
    </div>
  );
}
