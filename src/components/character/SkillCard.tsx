'use client';

import { useState } from 'react';
import type { SkillBuffVars } from '@contracts';
import { img } from '@/lib/images';
import { levelAt } from '@/lib/skills';
import { SkillDescription } from './SkillDescription';
import { EffectChipsRow, type ClientEffect, type StatusMap } from './EffectChips';

/** Niveau pré-localisé d'une compétence (données du palier). */
export interface CardLevel {
  level: number;
  cool?: number;
  wgReduce?: number;
  vars?: Record<string, SkillBuffVars>;
  /** Notes d'amélioration localisées de CE palier (« +10% damage »). */
  upgrades?: string[];
}

/** Compétence pré-localisée pour la carte V2 (le serveur prépare tout). */
export interface CardSkill {
  id: string;
  name: string;
  desc?: string;
  icon?: string;
  /** URL d'icône explicite (admin : sprites bruts non stagés) — sinon `img.skill(icon)`. */
  iconSrc?: string;
  /** Skill « burstable » (badge burst sur l'icône). */
  burst?: boolean;
  /** Libellé de cible déjà traduit (« Single Target »…). */
  targetLabel?: string;
  /** Libellé technique optionnel (vue admin : type brut). */
  typeLabel?: string;
  maxLevel: number;
  levels: CardLevel[];
  effects?: ClientEffect[];
}

/** Libellés i18n communs aux cartes (traduits côté serveur). */
export interface SkillCardLabels {
  cooldown: string;
  wgr: string;
  level: string;
  enhancement: string;
}

/** Sélecteur de niveau (style V2 : actif jaune). */
export function LevelSelector({
  maxLevel,
  level,
  onChange,
  label,
}: {
  maxLevel: number;
  level: number;
  onChange: (lvl: number) => void;
  label: string;
}) {
  if (maxLevel <= 1) return null;
  return (
    <div className="mt-3 mb-3 flex items-center gap-1">
      {Array.from({ length: maxLevel }, (_, i) => i + 1).map((lv) => (
        <button
          key={lv}
          type="button"
          onClick={() => onChange(lv)}
          className={[
            'rounded px-2 py-0.5 text-xs transition',
            lv === level
              ? 'bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-400/40'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700',
          ].join(' ')}
        >
          {label}
          {lv}
        </button>
      ))}
    </div>
  );
}

/** Bloc « Enhancement » (paliers +2..+5, inactifs estompés). */
export function EnhancementList({
  levels,
  level,
  title,
  skillName,
}: {
  levels: CardLevel[];
  level: number;
  title: string;
  skillName: string;
}) {
  const rows = levels.filter((l) => l.level >= 2 && l.upgrades?.length);
  if (!rows.length) return null;
  return (
    <div className="mt-4">
      <h4 className="mb-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
        {title}
        <span className="sr-only"> — {skillName}</span>
      </h4>
      <div className="space-y-1">
        {rows.map((l) => (
          <div
            key={l.level}
            className={`flex gap-2 text-xs transition-opacity ${level >= l.level ? '' : 'opacity-30'}`}
          >
            <span className="shrink-0 font-semibold text-yellow-400">+{l.level}</span>
            <span className="text-zinc-300">{l.upgrades!.join(', ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Carte de compétence (portage pixel V2 SkillCard) : icône 56px + badge burst,
 * métas CD/WGR/cible, chips d'effets, sélecteur de niveau, description résolue
 * au niveau choisi, paliers d'amélioration.
 * V3 : CD et WGR viennent des VRAIES valeurs par niveau (plus de comptage
 * textuel des enhancements comme en V2).
 */
export function SkillCard({
  skill,
  statuses,
  labels,
}: {
  skill: CardSkill;
  statuses: StatusMap;
  labels: SkillCardLabels;
}) {
  const [level, setLevel] = useState(1);
  const lv = levelAt(skill.levels, Math.min(level, skill.maxLevel));

  return (
    <div className="card rounded-xl p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="relative h-14 w-14 shrink-0">
          <div className="relative h-full w-full overflow-hidden">
            {(skill.iconSrc || skill.icon) && (
              // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
              <img
                src={skill.iconSrc ?? img.skill(skill.icon!)}
                alt={skill.name}
                className="absolute inset-0 h-full w-full object-contain"
              />
            )}
          </div>
          {skill.burst && (
            <div className="absolute -top-1 -right-1 h-5 w-5">
              {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
              <img src={img.burstBadge()} alt="" className="h-full w-full object-contain" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-game text-lg font-bold">{skill.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            {lv?.cool ? (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5">
                {labels.cooldown} {lv.cool}
              </span>
            ) : null}
            {lv?.wgReduce ? (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5">
                {labels.wgr} {lv.wgReduce}
              </span>
            ) : null}
            {skill.targetLabel && (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5">{skill.targetLabel}</span>
            )}
            {skill.typeLabel && (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5">{skill.typeLabel}</span>
            )}
          </div>
        </div>
      </div>

      <EffectChipsRow effects={skill.effects ?? []} statuses={statuses} />

      <LevelSelector
        maxLevel={skill.maxLevel}
        level={level}
        onChange={setLevel}
        label={labels.level}
      />

      {skill.desc && (
        <div className="mb-3">
          <SkillDescription
            desc={skill.desc}
            vars={lv?.vars}
            className="text-sm leading-relaxed whitespace-pre-line text-zinc-200"
          />
        </div>
      )}

      <EnhancementList
        levels={skill.levels}
        level={level}
        title={labels.enhancement}
        skillName={skill.name}
      />
    </div>
  );
}
