'use client';

/**
 * FLAT OU % — annotation des substats ATK / DEF / HP de la priorité de gear :
 * un badge par axe (« % », « flat », « ≈ ») à côté du nom dans la barre de
 * priorité, puis sous la barre le bloc « Flat or %? » : les deux inputs dont
 * le verdict dépend — palier de niveau (100 / 105 / 110 / 120, défaut 100 :
 * on ne suppose pas le limit break) et quirks — et, DESSOUS, le calcul à plat
 * par axe (tick % × base = équivalent, contre le tick plat), la base utilisée
 * et les seuils de bascule. Pas de tooltip : l'explication est la réponse, on
 * ne la cache pas. Le gear est toujours supposé 6★ ; la transcendance n'entre
 * pas dans le verdict (son % s'additionne à celui du gear, et le limit break
 * est ouvert à tout palier). La règle vit dans `lib/substat-verdict` ; la
 * base par palier est résolue côté serveur (`getSubstatFlatProfile`).
 */
import { useState, type ReactNode } from 'react';
import {
  CLOSE_MARGIN,
  defaultLevel,
  judgeSubstat,
  SUBSTAT_AXES,
  substatAxisOf,
  sumFlatAt,
  type SubstatAxis,
  type SubstatFlatProfile,
  type SubstatTicks,
  type SubstatVerdictKind,
} from '@/lib/substat-verdict';

/** Libellés pré-traduits ; ceux du calcul gardent leurs `{var}`. */
export interface SubstatVerdictLabels {
  title: string;
  badgeFlat: string;
  badgeEven: string;
  level: string;
  quirks: string;
  /** Une ligne de calcul par axe : `+{pct}% × {base} = +{equiv} vs +{flat}`. */
  calcLine: string;
  /** La base utilisée (`{level}`, `{awak}`) et ce qui n'y entre pas. */
  calcNote: string;
  /** Suffixe ajouté à `calcNote` quand les quirks sont comptés. */
  calcAwak: string;
  /** Seuils de bascule : `{list}` = « 1000 ATK · 1000 DEF · 2434 HP ». */
  calcBreakeven: string;
  /** Sens de chaque badge — porté en aria-label, jamais la couleur seule. */
  pctWins: string;
  flatWins: string;
  close: string;
}

export interface SubstatVerdictProps {
  profile: SubstatFlatProfile;
  ticks: SubstatTicks;
  labels: SubstatVerdictLabels;
  /** Axes détaillés sous les contrôles — ceux de la priorité (défaut : les 3). */
  axes?: SubstatAxis[];
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

const ROW_LABEL = 'w-13 shrink-0 text-[10px] tracking-wider text-zinc-200 uppercase';

/** Légende des trois états, sous le titre « Flat or %? ». */
const LEGEND: SubstatVerdictKind[] = ['pct', 'flat', 'close'];

/** Ce que veut dire un badge, en toutes lettres (légende + aria-label). */
function meaningOf(kind: SubstatVerdictKind, labels: SubstatVerdictLabels): string {
  if (kind === 'pct') return labels.pctWins;
  if (kind === 'flat') return labels.flatWins;
  return fill(labels.close, { margin: CLOSE_MARGIN * 100 });
}

function Badge({ kind, labels }: { kind: SubstatVerdictKind; labels: SubstatVerdictLabels }) {
  const text = kind === 'pct' ? '%' : kind === 'flat' ? labels.badgeFlat : labels.badgeEven;
  return (
    <span
      aria-label={meaningOf(kind, labels)}
      className={`inline-flex items-center rounded border px-1.5 py-px font-mono text-[10px] leading-4 font-semibold ${BADGE_CLASS[kind]}`}
    >
      {text}
    </span>
  );
}

/**
 * Porte l'état des inputs et fournit `badge(stat)` à son enfant (render prop)
 * pour que la barre de priorité place les badges à côté des noms de stats ;
 * les contrôles et le calcul se rendent à côté (carte seule en largeur) ou
 * dessous (carte dans sa colonne).
 */
export function SubstatVerdictPanel({
  profile,
  ticks,
  labels,
  axes = [...SUBSTAT_AXES],
  children,
}: SubstatVerdictProps & { children: (badge: (stat: string) => ReactNode) => ReactNode }) {
  const [level, setLevel] = useState(() => defaultLevel(profile));
  const [quirksOn, setQuirksOn] = useState(true);

  const verdictOf = (axis: SubstatAxis) =>
    judgeSubstat(sumFlatAt(profile, axis, level, quirksOn), ticks[axis]);

  // « DEF » comme « DEF% » : la priorité curée peut écrire la version voulue.
  const badge = (stat: string): ReactNode => {
    const axis = substatAxisOf(stat);
    return axis ? <Badge kind={verdictOf(axis).kind} labels={labels} /> : null;
  };

  const detailed = axes.map((axis) => ({ axis, v: verdictOf(axis) }));
  const breakevens = detailed
    .filter(({ v }) => v.breakeven != null)
    .map(({ axis, v }) => `${Math.ceil(v.breakeven!)} ${axis}`)
    .join(' · ');

  // Sous lg la carte substats est SEULE sur la largeur (la grille 2fr/1fr de
  // la section ne s'applique qu'à partir de lg) : la priorité et le bloc
  // « Flat or %? » passent côte à côte dès md plutôt que d'étirer six jauges
  // sur toute la page ; à lg+ la carte est dans sa colonne, retour à l'empilé.
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
      <div>{children(badge)}</div>
      <div className="flex flex-col gap-2.5 border-t border-white/6 pt-3 text-xs md:border-t-0 md:border-l md:pt-0 md:pl-5 lg:border-t lg:border-l-0 lg:pt-3 lg:pl-0">
        <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-zinc-300 uppercase">
          {labels.title}
        </span>
        {/* Légende des 3 états, EN TOUTES LETTRES à taille lisible — le badge
            n'est jamais la couleur seule, et son sens n'est pas caché dans un
            tooltip. */}
        <ul className="flex flex-col gap-1 text-xs">
          {LEGEND.map((kind) => (
            <li key={kind} className="flex items-center gap-2">
              <Badge kind={kind} labels={labels} />
              <span>{meaningOf(kind, labels)}</span>
            </li>
          ))}
        </ul>

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

        {/* Le calcul, à plat : une ligne par axe, recalculée à chaque input */}
        {detailed.length > 0 && (
          <div className="flex flex-col gap-1.5 border-t border-white/6 pt-2.5">
            {detailed.map(({ axis, v }) => (
              <div key={axis} className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-sm text-zinc-200">{axis}</span>
                <Badge kind={v.kind} labels={labels} />
                <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                  {fill(labels.calcLine, {
                    pct: fmt(v.pctTick),
                    base: v.sumFlat,
                    equiv: fmt(v.equivFlat),
                    flat: fmt(v.flatTick),
                  })}
                </span>
              </div>
            ))}
            <p className="text-[11px] leading-snug text-zinc-400">
              {fill(labels.calcNote, { level, awak: quirksOn ? labels.calcAwak : '' })}
              {breakevens && ` ${fill(labels.calcBreakeven, { list: breakevens })}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
