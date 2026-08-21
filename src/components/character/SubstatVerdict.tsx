'use client';

/**
 * FLAT OU % — annotation des substats ATK / DEF / HP de la priorité de gear :
 * un badge par axe (« % », « flat », « ≈ »), le calcul en tooltip, et les
 * inputs dont le verdict dépend — le palier de niveau (100 / 105 / 110 / 120,
 * défaut 100 : on ne suppose pas le limit break) et les quirks — visibles à
 * côté de l'annotation pour qu'on comprenne qu'elle en dépend. Le gear est
 * toujours supposé 6★ ; la transcendance n'entre pas dans le verdict (son %
 * s'additionne à celui du gear, et le limit break est ouvert à tout palier).
 * La règle vit dans `lib/substat-verdict` ; la base par palier est résolue
 * côté serveur (`char-progression.getSubstatFlatProfile`).
 */
import { useState, type ReactNode } from 'react';
import { InlineTooltip } from '@/components/inline/InlineTooltip';
import {
  CLOSE_MARGIN,
  defaultLevel,
  isSubstatAxis,
  judgeSubstat,
  sumFlatAt,
  type SubstatFlatProfile,
  type SubstatTicks,
  type SubstatVerdict,
  type SubstatVerdictKind,
} from '@/lib/substat-verdict';

/** Libellés pré-traduits ; ceux du tooltip gardent leurs `{var}`. */
export interface SubstatVerdictLabels {
  title: string;
  hint: string;
  badgeFlat: string;
  level: string;
  quirks: string;
  tipBase: string;
  tipAwak: string;
  tipFlat: string;
  tipPct: string;
  tipBreakeven: string;
  tipPctWins: string;
  tipFlatWins: string;
  tipClose: string;
}

export interface SubstatVerdictProps {
  profile: SubstatFlatProfile;
  ticks: SubstatTicks;
  labels: SubstatVerdictLabels;
}

/** `{var}` → valeur (les libellés arrivent traduits, le client les remplit). */
function fill(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

/** Une décimale max, sans zéro traînant. */
const fmt = (n: number): string => parseFloat(n.toFixed(1)).toString();

const BADGE_CLASS: Record<SubstatVerdictKind, string> = {
  pct: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300',
  flat: 'border-sky-400/40 bg-sky-400/15 text-sky-300',
  close: 'border-zinc-400/40 bg-zinc-400/15 text-zinc-300',
};

const toggleClass = (on: boolean): string =>
  `inline-flex items-center rounded border px-1.5 py-0.5 font-mono leading-4 tabular-nums ${
    on
      ? 'border-amber-400/40 bg-amber-400/20 text-amber-300'
      : 'border-white/10 text-zinc-400 hover:bg-white/5'
  }`;

const ROW_LABEL = 'w-13 shrink-0 text-[10px] tracking-wider text-zinc-500 uppercase';

/** Légende des trois états, accolée au titre « Flat or %? ». */
const LEGEND: { kind: SubstatVerdictKind; text: string }[] = [
  { kind: 'pct', text: '%' },
  { kind: 'flat', text: 'flat' },
  { kind: 'close', text: '≈' },
];

function VerdictBadge({
  v,
  level,
  quirksOn,
  labels,
}: {
  v: SubstatVerdict;
  level: number;
  quirksOn: boolean;
  labels: SubstatVerdictLabels;
}) {
  const text = v.kind === 'pct' ? '%' : v.kind === 'flat' ? labels.badgeFlat : '≈';
  const headline =
    v.kind === 'pct'
      ? labels.tipPctWins
      : v.kind === 'flat'
        ? labels.tipFlatWins
        : fill(labels.tipClose, { margin: CLOSE_MARGIN * 100 });
  const tooltip = (
    <div className="flex max-w-72 flex-col gap-1 text-xs">
      <span className="font-semibold text-zinc-100">{headline}</span>
      <span className="text-zinc-300">
        {fill(labels.tipBase, {
          level,
          base: v.sumFlat,
          awak: quirksOn ? labels.tipAwak : '',
        })}
      </span>
      <span className="font-mono text-zinc-200 tabular-nums">
        {fill(labels.tipFlat, { flat: fmt(v.flatTick) })}
      </span>
      <span className="font-mono text-zinc-200 tabular-nums">
        {fill(labels.tipPct, { pct: fmt(v.pctTick), base: v.sumFlat, equiv: fmt(v.equivFlat) })}
      </span>
      {v.breakeven != null && (
        <span className="text-zinc-400">
          {fill(labels.tipBreakeven, { value: Math.ceil(v.breakeven) })}
        </span>
      )}
    </div>
  );
  return (
    <InlineTooltip content={tooltip}>
      <span
        className={`inline-flex cursor-help items-center rounded border px-1.5 py-px font-mono text-[10px] leading-4 font-semibold ${BADGE_CLASS[v.kind]}`}
        aria-label={headline}
      >
        {text}
      </span>
    </InlineTooltip>
  );
}

/**
 * Porte l'état des inputs et fournit `badge(stat)` à son enfant (render prop)
 * pour que la barre de priorité place les badges à côté des noms de stats ;
 * les contrôles se rendent en dessous.
 */
export function SubstatVerdictPanel({
  profile,
  ticks,
  labels,
  children,
}: SubstatVerdictProps & { children: (badge: (stat: string) => ReactNode) => ReactNode }) {
  const [level, setLevel] = useState(() => defaultLevel(profile));
  const [quirksOn, setQuirksOn] = useState(true);

  const badge = (stat: string): ReactNode => {
    if (!isSubstatAxis(stat)) return null;
    const v = judgeSubstat(sumFlatAt(profile, stat, level, quirksOn), ticks[stat]);
    return <VerdictBadge v={v} level={level} quirksOn={quirksOn} labels={labels} />;
  };

  return (
    <>
      {children(badge)}
      <div className="flex flex-col gap-2 border-t border-white/6 pt-3 text-xs">
        <div>
          <span className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-zinc-300 uppercase">
              {labels.title}
            </span>
            {/* Légende des 3 états — le badge n'est jamais la couleur seule */}
            {LEGEND.map((l) => (
              <span
                key={l.kind}
                aria-hidden
                className={`inline-flex items-center rounded border px-1 font-mono text-[9px] leading-4 font-semibold ${BADGE_CLASS[l.kind]}`}
              >
                {l.kind === 'flat' ? labels.badgeFlat : l.text}
              </span>
            ))}
          </span>
          <p className="mt-1.5 hidden text-[11px] leading-snug text-zinc-500 sm:block">
            {labels.hint}
          </p>
        </div>

        {/* Palier de niveau — 100 (pas de LB) puis un par limit break */}
        <div className="flex items-center gap-2">
          <span className={ROW_LABEL}>{labels.level}</span>
          <div className="flex flex-wrap gap-1">
            {profile.levels.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={l === level}
                onClick={() => setLevel(l)}
                className={toggleClass(l === level)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Quirks — plat IOT_STAT seulement, cf. lib/substat-verdict */}
        <div className="flex items-center gap-2">
          <span className={ROW_LABEL}>{labels.quirks}</span>
          <button
            type="button"
            role="switch"
            aria-checked={quirksOn}
            onClick={() => setQuirksOn((v) => !v)}
            className={toggleClass(quirksOn)}
          >
            {quirksOn ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </>
  );
}
