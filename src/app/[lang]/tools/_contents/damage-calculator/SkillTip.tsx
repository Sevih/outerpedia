'use client';

/**
 * Popover de DESC de skill du damage calculator (Sevih 18/08/2026) — l'icône
 * d'un skill (carte Skills, lignes de la table Résultat) montre au survol la
 * desc du jeu RÉSOLUE AU NIVEAU CHOISI, puis les descs des bursts 1/2/3 en
 * vert/bleu/rouge (l'identité des cartes de burst du jeu).
 *
 * Bâti sur l'existant (revue 18/08/2026 — plus de popover maison) :
 *   - `InlineTooltip` (Radix HoverCard) : portal, collision, tap mobile ;
 *   - `SkillDescription` : le MÊME rendu que la fiche perso (placeholders
 *     résolus, couleurs du jeu, mentions d'élément/classe en icônes inline).
 *
 * Données : la projection `damage/skill-descs.json` (desc localisées + vars
 * élaguées — datagen/damage/skill-descs.ts), chargée UNE fois au premier
 * survol d'une icône : rien sur le chemin critique du rapport, rien dans le
 * bundle initial. Tant qu'elle n'est pas là (ou si le chargement échoue), le
 * popover montre le nom + niveau — jamais bloquant.
 */
import { useState, type ReactNode } from 'react';
import { InlineTooltip } from '@/components/inline/InlineTooltip';
import { SkillDescription } from '@/components/character/SkillDescription';
import { levelAt } from '@/lib/skills';
import { lRec } from '@/lib/i18n/localize';
import type { Lang } from '@/lib/i18n/config';
import type { SkillBuffVars } from '@contracts';
import type { DcSkillRow } from './DamageCalculatorBrowser';

/** Miroir minimal d'une entrée de la projection (la vérité : datagen). */
interface DescEntry {
  desc: Partial<Record<string, string>>;
  levels?: { level: number; vars: Record<string, SkillBuffVars> }[];
}

// Cache MODULE (partagé entre toutes les icônes) — un seul import par session.
let descs: Record<string, DescEntry> | null = null;
let pending: Promise<void> | null = null;
function ensureDescs(): Promise<void> {
  if (descs) return Promise.resolve();
  pending ??= import('@data/generated/damage/skill-descs.json')
    .then((m) => {
      descs = (m.default as unknown as { skills: Record<string, DescEntry> }).skills;
    })
    .catch(() => {
      pending = null; // retentera au prochain survol
    });
  return pending;
}

/** Vert/bleu/rouge des bursts 1/2/3 — l'identité visuelle du jeu. */
const BURST_TIP_COLORS = ['text-emerald-500', 'text-sky-500', 'text-red-500'];

export function SkillIconTip({
  row,
  lvl,
  lang,
  burstMax,
  children,
}: {
  row: DcSkillRow;
  /** Niveau CHOISI du slot — résout les placeholders de la desc. */
  lvl: number;
  lang: Lang;
  /** Bursts affichés : `undefined` = tous (carte Skills), `n` = B1..Bn (la
   *  ligne Bn du Résultat cumule les paliers précédents), 0 = aucun. */
  burstMax?: number;
  children: ReactNode;
}) {
  // Re-rend CE composant seul quand la projection arrive — le calculateur
  // n'est jamais re-rendu par un survol (revue 18/08/2026).
  const [, setTick] = useState(0);
  const prime = () => {
    if (!descs) void ensureDescs().then(() => setTick((t) => t + 1));
  };

  const sk = descs?.[row.id];
  const desc = sk?.desc ? lRec(sk.desc, lang) : '';
  const bursts = (row.burstIds ?? [])
    .slice(0, burstMax)
    .map((id, i) => ({ i, b: descs?.[id] }))
    .filter((x): x is { i: number; b: DescEntry } => Boolean(x.b?.desc));
  const content = (
    <div className="w-60 space-y-1.5 text-left">
      <p className="text-content text-[11px] font-semibold">
        {row.name} <span className="text-content-subtle font-mono font-normal">Lv {lvl}</span>
      </p>
      {desc && (
        <SkillDescription
          desc={desc}
          vars={levelAt(sk?.levels ?? [], lvl)?.vars}
          lang={lang}
          className="text-content-muted text-[11px] whitespace-pre-line"
        />
      )}
      {bursts.map(({ i, b }) => (
        <div key={i} className={BURST_TIP_COLORS[i] ?? ''}>
          <span className="font-mono text-[10px] font-bold">B{i + 1}</span>
          <SkillDescription
            desc={lRec(b.desc, lang)}
            vars={levelAt(b.levels ?? [], lvl)?.vars}
            lang={lang}
            className="text-[11px] whitespace-pre-line"
          />
        </div>
      ))}
    </div>
  );

  return (
    <span className="inline-flex" onMouseEnter={prime} onTouchStart={prime} onFocus={prime}>
      <InlineTooltip content={content}>{children}</InlineTooltip>
    </span>
  );
}
