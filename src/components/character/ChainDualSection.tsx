'use client';

import { useState } from 'react';
import type { SkillBuffVars } from '@contracts';
import { levelAt } from '@/lib/skills';
import { SkillDescription } from './SkillDescription';
import { EffectChipsRow, type ClientEffect, type StatusMap } from './EffectChips';
import { LevelSelector, EnhancementList, type CardLevel } from './SkillCard';

/** Niveau du kit chaîne : vars fusionnées (chain + strike + backup) + WGR réels. */
export interface ChainLevel extends CardLevel {
  chainWgr?: number;
  dualWgr?: number;
  vars?: Record<string, SkillBuffVars>;
}

/**
 * Section Attaque en chaîne & Duo (portage V2 ChainDualSection) : une carte,
 * icône de chaîne (élément + type), WGR / Dual WGR, sélecteur de niveau,
 * les deux moitiés de description (chaîne / duo) avec leurs chips, paliers.
 * V3 : les WGR viennent des VRAIES valeurs par niveau des skills strike/backup
 * (plus de comptage textuel), et les vars des trois skills sont fusionnées.
 */
export function ChainDualSection({
  name,
  iconSrc,
  maxLevel,
  levels,
  chainDesc,
  dualDesc,
  chainEffects,
  dualEffects,
  statuses,
  labels,
}: {
  name: string;
  iconSrc: string;
  maxLevel: number;
  levels: ChainLevel[];
  chainDesc: string;
  dualDesc: string;
  chainEffects: ClientEffect[];
  dualEffects: ClientEffect[];
  statuses: StatusMap;
  labels: { wgr: string; dualWgr: string; level: string; enhancement: string };
}) {
  const [level, setLevel] = useState(1);
  const lv = levelAt(levels, Math.min(level, maxLevel));

  return (
    <div className="card rounded-xl p-4">
      {/* Icône + nom */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden">
          <img
            src={iconSrc}
            alt={name}
            className="absolute inset-0 h-full w-full scale-83 object-contain"
          />
        </div>
        <div>
          <h3 className="font-game text-lg font-bold">{name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            {lv?.chainWgr !== undefined && (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5">
                {labels.wgr} {lv.chainWgr}
              </span>
            )}
            {lv?.dualWgr !== undefined && (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5">
                {labels.dualWgr} {lv.dualWgr}
              </span>
            )}
          </div>
        </div>
      </div>

      <LevelSelector maxLevel={maxLevel} level={level} onChange={setLevel} label={labels.level} />

      {/* Effet de chaîne */}
      {chainDesc && (
        <div className="mb-4">
          <div className="mt-2">
            <EffectChipsRow effects={chainEffects} statuses={statuses} />
          </div>
          <SkillDescription
            desc={chainDesc}
            vars={lv?.vars}
            className="text-sm leading-relaxed whitespace-pre-line text-zinc-200"
          />
        </div>
      )}

      {/* Effet d'attaque duo */}
      {dualDesc && (
        <div>
          <div className="mt-2">
            <EffectChipsRow effects={dualEffects} statuses={statuses} />
            <SkillDescription
              desc={dualDesc}
              vars={lv?.vars}
              className="text-sm leading-relaxed whitespace-pre-line text-zinc-200"
            />
          </div>
        </div>
      )}

      <EnhancementList levels={levels} level={level} title={labels.enhancement} skillName={name} />
    </div>
  );
}
