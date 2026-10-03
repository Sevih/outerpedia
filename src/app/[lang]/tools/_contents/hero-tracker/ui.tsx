'use client';

/**
 * Briques d'affichage du suivi de compte — formats de nombre, axe et son
 * étiquette de rôle, icônes de pièce et de besoin, et les CONTRÔLES de saisie
 * (échelle à segments, pas à pas, paliers). Extrait de
 * `HeroTrackerBrowser.tsx` le 03/10/2026 (découpage mécanique, contenu
 * inchangé).
 */
import { useRef, useState } from 'react';
import { EquipmentIcon } from '@/components/equipment/EquipmentIcon';
import { img } from '@/lib/images';
import { LONG_PRESS_MS, type ItemAsset, type TranscendStep } from './contracts';

export const fmt = (n: number): string => n.toLocaleString('en-US');
/** 38 400 000 → « 38.4M » : la liste de courses n'a pas la place des zéros. */
export const short = (n: number): string =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 10_000
      ? `${Math.round(n / 1000)}K`
      : fmt(n);

export const starLabel = (s?: TranscendStep): string =>
  s ? `${s.showStar}★${s.starPlus > 0 ? `+${s.starPlus}` : ''}` : '—';

/**
 * Un axe : intitulé, « j'en suis là → je vise ça », et son contrôle.
 *
 * Un seul code couleur dans tout l'écran, sinon les deux nombres se confondent :
 * ce qu'on POSSÈDE est écrit en clair, ce qu'on VISE est en accent.
 */
export function Field({
  label,
  value,
  target,
  hint,
  children,
}: {
  label: string;
  value?: string;
  target?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-content-muted text-xs">{label}</span>
        {hint && <span className="text-content-subtle text-2xs font-mono">{hint}</span>}
        {value !== undefined && (
          <span className="font-mono text-xs font-semibold">
            <span className="text-content-strong">{value}</span>
            {target !== undefined && (
              <>
                <span className="text-content-subtle"> → </span>
                <span className="text-accent">{target}</span>
              </>
            )}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Étiquette de rôle collée au contrôle : « Actuel » devant le champ, « Objectif »
 * devant les paliers. Sans elle, deux rangées de chiffres se ressemblent et on ne
 * sait plus laquelle dit ce qu'on a.
 */
export function Rail({
  role,
  aim = false,
  children,
}: {
  role: string;
  /** Ce contrôle pose la CIBLE — même accent que la cible dans l'en-tête. */
  aim?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`text-2xs font-mono tracking-wide uppercase ${
          aim ? 'text-accent/80' : 'text-content-subtle'
        }`}
      >
        {role}
      </span>
      {children}
    </span>
  );
}

/**
 * Pièce d'un héros. Elle n'est PAS un item — aucune ligne d'inventaire, aucun
 * sprite : son icône se compose (portrait masqué + cadre du jeu) au datagen, et
 * porte donc déjà son cadre. La reposer dans une tuile de rareté en ferait deux.
 */
export function PieceIcon({ id, large = false }: { id: string; large?: boolean }) {
  const px = large ? 40 : 22;
  return (
    <img
      src={img.piece(id)}
      alt=""
      aria-hidden
      width={px}
      height={px}
      className={`shrink-0 ${large ? 'h-10 w-10' : 'h-5.5 w-5.5'}`}
    />
  );
}

export function NeedChip({ asset, count }: { asset?: ItemAsset; count: number }) {
  if (!asset) return null;
  return (
    <span
      title={asset.name}
      className="border-line-subtle bg-surface-sunken flex items-center gap-1.5 rounded-lg border py-1 pr-2 pl-1"
    >
      <EquipmentIcon src={img.item(asset.icon)} grade={asset.grade} alt={asset.name} size={22} />
      <span className="text-content-strong text-3xs font-mono font-semibold">×{count}</span>
    </span>
  );
}

/* ─────────────────────────── Contrôles ─────────────────────────── */

/** Remplace la i-ème valeur d'un axe multiple (skills, EE d'un fusionné). */
export function replace(list: number[], index: number, value: number): number[] {
  const next = [...list];
  next[index] = value;
  return next;
}

/**
 * Échelle à segments : un segment par valeur atteignable. Le clic pose l'état
 * COURANT ; maj+clic (ou appui long au doigt) pose la CIBLE — deux marqueurs sur
 * une seule rangée, au lieu des deux champs numériques jumeaux d'avant.
 */
export function Scale({
  values,
  current,
  target,
  withTarget,
  tone = 'accent',
  render,
  icon,
  onCurrent,
  onTarget,
}: {
  values: number[];
  current: number;
  target: number;
  withTarget: boolean;
  /** `star` = or (transcendance, enchantement), `accent` = bleu (niveaux). */
  tone?: 'accent' | 'star';
  render?: (v: number) => string;
  /** Visuel posé au-dessus du libellé (les étoiles du jeu, pour la transcendance). */
  icon?: (v: number, reached: boolean) => React.ReactNode;
  onCurrent: (v: number) => void;
  onTarget: (v: number) => void;
}) {
  const held = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reached =
    tone === 'star' ? 'border-warn bg-warn/20 text-warn' : 'border-accent bg-accent/20 text-accent';

  const press = (v: number) => ({
    onPointerDown: () => {
      if (!withTarget) return;
      held.current = false;
      timer.current = setTimeout(() => {
        held.current = true;
        onTarget(v);
      }, LONG_PRESS_MS);
    },
    onPointerUp: () => {
      if (timer.current) clearTimeout(timer.current);
    },
    onPointerLeave: () => {
      if (timer.current) clearTimeout(timer.current);
    },
    onClick: (e: React.MouseEvent) => {
      if (held.current) {
        held.current = false;
        return; // l'appui long a déjà posé la cible
      }
      if (withTarget && e.shiftKey) onTarget(v);
      else onCurrent(v);
    },
  });

  return (
    <div className="flex min-w-0 flex-1 gap-1">
      {values.map((v) => {
        const isReached = v <= current;
        // Trois états, trois looks : ACQUIS (plein), RESTE À FAIRE (accent
        // discret — la couleur de la cible partout ailleurs), HORS CIBLE (éteint).
        // Deux gris presque identiques ne se distinguaient pas.
        const isAimed = v <= target;
        const tint = isReached
          ? reached
          : isAimed
            ? 'border-accent/40 bg-accent/10 text-accent/80'
            : 'border-line-subtle bg-surface-sunken text-line';
        return (
          <button
            key={v}
            type="button"
            {...press(v)}
            aria-label={String(render ? render(v) : v)}
            className={`text-3xs flex min-w-0 flex-1 flex-col items-center justify-center gap-px rounded-md border font-mono leading-none font-semibold transition-colors ${
              icon ? 'h-10' : 'h-9'
            } ${tint} ${
              // Le cran visé porte un liseré, même s'il est déjà acquis.
              withTarget && v === target ? 'ring-accent ring-1' : ''
            }`}
          >
            {icon?.(v, isReached)}
            {render ? render(v) : v}
          </button>
        );
      })}
    </div>
  );
}

/** − valeur + : le pas d'un niveau, au pouce. */
export function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const btn =
    'border-line bg-surface-sunken text-content-muted hover:border-accent hover:text-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-base transition-colors';
  // Largeur NATURELLE : ces axes tiennent en trois chiffres au plus, un champ
  // étiré sur toute la rangée pour afficher « 0 » ne sert personne.
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button type="button" onClick={() => onChange(Math.max(value - 1, min))} className={btn}>
        −
      </button>
      <NumberField value={value} min={min} max={max} onChange={onChange} />
      <button type="button" onClick={() => onChange(Math.min(value + 1, max))} className={btn}>
        +
      </button>
    </div>
  );
}

/**
 * Paliers d'un axe : les valeurs auxquelles on s'arrête vraiment. Ils posent la
 * CIBLE — ce sont des objectifs (« je le monte à 110 »), pas des états qu'on
 * déclare ; quand les cibles sont masquées, ils deviennent un raccourci d'état.
 */
export function Presets({
  values,
  active,
  aim,
  onPick,
  format,
}: {
  values: number[];
  active: number;
  /** Ces paliers posent la CIBLE (accent) plutôt que l'état (clair). */
  aim: boolean;
  onPick: (v: number) => void;
  format?: (v: number) => string;
}) {
  const picked = aim
    ? 'border-accent bg-accent/15 text-accent font-semibold'
    : 'border-line bg-surface-overlay text-content-strong font-semibold';
  return (
    <span className="flex flex-wrap gap-1">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          className={`text-3xs h-9 min-w-10 rounded-lg border px-2 font-mono transition-colors ${
            active === v
              ? picked
              : 'border-line-subtle bg-surface-sunken text-content-muted hover:border-line'
          }`}
        >
          {format ? format(v) : v}
        </button>
      ))}
    </span>
  );
}

function NumberField({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  // Texte LOCAL pendant la saisie, borne au blur/Enter : borner à chaque frappe
  // rendait le clavier inutilisable — avec `min = 5`, taper « 1 » pour 120
  // devenait 5, puis « 2 » → 52, « 0 » → 520 → plafond. Le moteur borne de
  // toute façon ; l'écran ne ment que le temps de la frappe.
  const [draft, setDraft] = useState<string | null>(null);
  const commit = (raw: string) => {
    setDraft(null);
    const v = Number(raw);
    if (raw.trim() !== '' && Number.isFinite(v)) {
      onChange(Math.min(Math.max(Math.trunc(v), min), max));
    }
  };
  return (
    <input
      type="number"
      inputMode="numeric"
      value={draft ?? value}
      min={min}
      max={max}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
      className="border-line-subtle bg-surface-sunken text-content-strong focus:border-accent h-9 w-14 shrink-0 rounded-lg border px-1.5 text-center font-mono text-sm font-semibold outline-none"
    />
  );
}
