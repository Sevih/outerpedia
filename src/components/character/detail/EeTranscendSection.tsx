'use client';

/**
 * Équipement exclusif + Transcendance (portage V2, côte à côte) :
 *   - carte EE : tuile, nom (lien vers la page détail), main stats, effet
 *     Lv.1 / Lv.10 (textes des passifs extraits) ;
 *   - slider de transcendance : paliers d'étoiles DÉCLARÉS par le jeu
 *     (couleurs comprises), ATK/DEF/HP % du palier + lignes OFFICIELLES du
 *     passif cumulées (TextSkill, bursts et jauge de faiblesse incluses).
 */
import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { img } from '@/lib/images';
import { STAT_ICON } from '@/lib/stats';
import { SkillDescription } from '@/components/character/SkillDescription';
import { renderGameColors } from '@/components/ui/GameText';
import {
  EffectChipsRow,
  type ClientEffect,
  type StatusMap,
} from '@/components/character/EffectChips';
import { useTranscendTier } from './TranscendTierContext';
import type { TranscendTierView } from '@/lib/data/char-progression';

export interface EeCardView {
  characterId: string;
  name: string;
  slug: string;
  /** Main stats affichées (clé + libellé complet éventuel). */
  mainStats: { key: string; label?: string }[];
  effectLv1: string[];
  effectLv10: string[];
  badgeIcon?: string;
  badgeText: string;
  /** Buffs/debuffs appliqués par les passifs (chips, comme les skills). */
  effects?: ClientEffect[];
  statuses?: StatusMap;
}

export interface EeTranscendLabels {
  ee: string;
  mainStat: string;
  effect: string;
  effectMax: string;
  transcend: string;
}

function EeCard({ ee, labels }: { ee: EeCardView; labels: EeTranscendLabels }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-bold text-zinc-100">{labels.ee}</h2>
      <div className="card flex flex-col gap-3 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="relative h-16 w-16 shrink-0">
            <img
              src={img.slotFrame('unique')}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full"
            />
            <img
              src={img.ee(ee.characterId)}
              alt={ee.name}
              className="absolute inset-1.5 h-[calc(100%-12px)] w-[calc(100%-12px)] object-contain"
            />
          </span>
          <div className="min-w-0">
            <Link
              href={`/equipment/${ee.slug}` as Route}
              className="font-game text-item-legendary block truncate font-bold hover:underline"
            >
              {ee.name}
            </Link>
            <p className="text-xs text-zinc-400">
              <span className="text-zinc-500">{labels.mainStat} </span>
              {ee.mainStats.map((s, i) => (
                <span key={i} className="mr-2 inline-flex items-center gap-1">
                  {STAT_ICON[s.key] && (
                    <img
                      src={img.statIcon(STAT_ICON[s.key])}
                      alt=""
                      aria-hidden
                      className="h-3.5 w-3.5"
                      width={14}
                      height={14}
                    />
                  )}
                  {s.label ?? s.key}
                </span>
              ))}
            </p>
          </div>
        </div>

        {ee.badgeIcon && (
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-zinc-500/40 px-2.5 py-1">
            <img
              src={img.equipment(ee.badgeIcon)}
              alt=""
              aria-hidden
              className="h-4 w-4"
              width={16}
              height={16}
            />
            <span className="text-buff text-xs">{ee.badgeText}</span>
          </div>
        )}

        <div className="space-y-2">
          <div>
            <p className="text-xs font-semibold text-zinc-500">{labels.effect}</p>
            {ee.effectLv1.map((t, i) => (
              <SkillDescription key={i} desc={t} className="text-sm text-zinc-200" />
            ))}
          </div>
          {ee.effectLv10.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-500">{labels.effectMax}</p>
              {ee.effectLv10.map((t, i) => (
                <SkillDescription key={i} desc={t} className="text-sm text-zinc-200" />
              ))}
            </div>
          )}
          {ee.effects && ee.effects.length > 0 && (
            <EffectChipsRow effects={ee.effects} statuses={ee.statuses ?? {}} />
          )}
        </div>
      </div>
    </div>
  );
}

function TranscendSlider({
  tiers,
  labels,
}: {
  tiers: TranscendTierView[];
  labels: EeTranscendLabels;
}) {
  // Sélection PARTAGÉE avec la table Base Stats quand le provider est là.
  const shared = useTranscendTier();
  const [localIdx, setLocalIdx] = useState(tiers.length - 1);
  const idx = Math.max(0, Math.min(shared?.idx ?? localIdx, tiers.length - 1));
  const setIdx = shared?.setIdx ?? setLocalIdx;
  const tier = tiers[idx];
  if (!tier) return null;
  const statLine =
    tier.atkPct === tier.defPct && tier.defPct === tier.hpPct
      ? [{ keys: ['ATK', 'DEF', 'HP'], pct: tier.atkPct }]
      : [
          { keys: ['ATK'], pct: tier.atkPct },
          { keys: ['DEF'], pct: tier.defPct },
          { keys: ['HP'], pct: tier.hpPct },
        ];

  return (
    <div>
      <h2 className="mb-3 text-lg font-bold text-zinc-100">{labels.transcend}</h2>
      <div className="card flex flex-col gap-3 rounded-xl p-4">
        {/* Étoiles + libellé */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {tier.stars.map((sprite, i) => (
              <img
                key={i}
                src={img.transcendStar(sprite)}
                alt=""
                aria-hidden
                className="h-6 w-6"
                width={24}
                height={24}
              />
            ))}
          </div>
          <span className="font-mono text-lg font-bold text-amber-300">{tier.label}</span>
        </div>

        {/* Slider + boutons */}
        <div className="flex items-center gap-2">
          {/* Commodité SOURIS, redondante avec le slider (lui focusable + piloté
              aux flèches + `aria-valuetext`) : hors arbre a11y et hors focus,
              plutôt qu'un `aria-label="-"` illisible. */}
          <button
            type="button"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            className="h-7 w-7 rounded border border-white/10 text-zinc-300 hover:bg-white/5"
            aria-hidden
            tabIndex={-1}
          >
            –
          </button>
          <div className="relative flex h-6 flex-1 items-center">
            <div className="absolute inset-x-0 h-1.5 rounded-full bg-zinc-700" />
            <div
              className="absolute h-1.5 rounded-full bg-amber-400"
              style={{ width: `${(idx / Math.max(1, tiers.length - 1)) * 100}%` }}
            />
            <input
              type="range"
              min={0}
              max={tiers.length - 1}
              step={1}
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="absolute inset-0 w-full cursor-pointer opacity-0"
              aria-valuetext={tier.label}
            />
            <div
              className="absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-amber-300"
              style={{ left: `${(idx / Math.max(1, tiers.length - 1)) * 100}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => setIdx((i) => Math.min(tiers.length - 1, i + 1))}
            className="h-7 w-7 rounded border border-white/10 text-zinc-300 hover:bg-white/5"
            aria-hidden
            tabIndex={-1}
          >
            +
          </button>
        </div>

        {/* Bonus du palier */}
        <div className="space-y-1.5 text-sm text-zinc-200">
          {statLine.map(
            (l) =>
              l.pct > 0 && (
                <p key={l.keys.join()} className="flex items-center gap-1">
                  {l.keys.map(
                    (k) =>
                      STAT_ICON[k] && (
                        <img
                          key={k}
                          src={img.statIcon(STAT_ICON[k])}
                          alt={k}
                          className="h-4 w-4"
                          width={16}
                          height={16}
                        />
                      ),
                  )}
                  <span className="ml-1 font-mono font-semibold text-emerald-300">+{l.pct}%</span>
                </p>
              ),
          )}
          {tier.passives.map((line, i) => (
            <p key={i} className="whitespace-pre-line text-zinc-300">
              {renderGameColors(line.replace(/\\n/g, '\n'))}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EeTranscendSection({
  ee,
  tiers,
  labels,
}: {
  ee?: EeCardView;
  tiers: TranscendTierView[];
  labels: EeTranscendLabels;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
      {ee && <EeCard ee={ee} labels={labels} />}
      {tiers.length > 0 && <TranscendSlider tiers={tiers} labels={labels} />}
    </div>
  );
}
