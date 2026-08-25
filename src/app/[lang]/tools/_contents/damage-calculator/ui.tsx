'use client';

/**
 * Briques d'affichage du Damage Calculator — composants de présentation
 * PARTAGÉS entre le composant principal et les pickers (cartes, steppers,
 * modales, portraits, pickers de perso). Extrait de
 * `DamageCalculatorBrowser.tsx` le 25/08/2026 (découpage
 * mécanique, contenu inchangé).
 */
import { useState, useEffect, type ReactNode } from 'react';
import { img, ELEMENT_ORDER, transcendStarRow } from '@/lib/images';
import { EffectIconTile } from '@/components/character/EffectChips';
import { SearchField } from '@/components/character/filters/FilterAtoms';
import { FilterPill } from '@/components/character/filters/FilterPill';
import { Thumbnail } from '@/components/ui/Thumbnail';
import type { DcChar, DcEffectRef, DcLabels, DcTarget, DcTranscendTier } from './contracts';

export const vars = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-content-subtle text-[10px] font-bold tracking-[0.14em] uppercase">
      {children}
    </span>
  );
}

/** Tag INLINE d'un effet du glossaire : icône + nom, desc officielle en
 *  tooltip — le même rendu pour les conditions (« Target has <tag> ») et les
 *  lignes DoT du Résultat (Sevih 22/08/2026). */
export function EffectRefTag({ r }: { r: DcEffectRef }) {
  return (
    <span
      title={r.desc || r.name}
      className="border-line-subtle bg-surface-sunken/70 text-content inline-flex cursor-help items-center gap-1 rounded border px-1 py-0.5"
    >
      <EffectIconTile icon={r.icon} isDebuff={r.debuff} className="h-3.5 w-3.5" />
      <span>{r.name}</span>
    </span>
  );
}

export function Card({
  title,
  right,
  children,
}: {
  title: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-line-subtle bg-surface-raised/60 space-y-3 rounded-xl border p-3.5">
      <div className="flex items-center gap-2">
        <Eyebrow>{title}</Eyebrow>
        <span className="flex-1" />
        {right}
      </div>
      {children}
    </section>
  );
}

export function Stepper({
  value,
  min,
  max,
  onChange,
  format,
  className,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  /** Classes de POSITION dans le conteneur (ml-auto, shrink-0…). */
  className?: string;
}) {
  const btn =
    'text-content-muted hover:text-accent h-6 w-5 cursor-pointer text-sm leading-none transition';
  return (
    <span
      className={`border-line-subtle bg-surface-sunken/70 inline-flex items-center overflow-hidden rounded-md border ${className ?? ''}`}
    >
      <button
        type="button"
        className={`${btn} border-line-subtle border-r`}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span className="text-content min-w-9 px-1 text-center font-mono text-xs font-bold tabular-nums">
        {format ? format(value) : value}
      </span>
      <button
        type="button"
        className={`${btn} border-line-subtle border-l`}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        +
      </button>
    </span>
  );
}

/** Dropdown générique : bouton d'ancrage + recherche + liste déroulante. */
/**
 * Popup de sélection (façon pool du tier-list-maker, mais en modale) :
 * voile plein écran, panneau centré, Échap / clic hors panneau pour fermer.
 * Le contenu (recherche, filtres, grille de tuiles) vient de l'appelant.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="bg-scrim/60 fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="border-line-subtle bg-surface-raised flex max-h-[85dvh] w-full max-w-2xl flex-col rounded-xl border shadow-2xl">
        <div className="border-line-subtle flex items-center gap-2 border-b px-3.5 py-2.5">
          <Eyebrow>{title}</Eyebrow>
          <span className="flex-1" />
          <button
            type="button"
            className="text-content-subtle hover:text-danger cursor-pointer text-sm"
            onClick={onClose}
            aria-label="✕"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3.5">{children}</div>
      </div>
    </div>
  );
}

/** Classes du jeu, dans l'ordre des filtres (mêmes pastilles que /characters). */
const CLASS_ORDER = ['defender', 'striker', 'ranger', 'mage', 'healer'];

/**
 * Case carrée de slot (façon jeu) : contenu quand c'est équipé, « ? » sinon —
 * cliquer ouvre la modale de choix, ✕ en coin pour vider (demande Sevih
 * 27/07/2026, en remplacement des ancres en forme de select).
 */
export function SlotTile({
  children,
  onClick,
  onClear,
  clearTitle,
  title,
  large,
}: {
  /** Contenu équipé (icône) — absent = case vide « ? ». */
  children?: React.ReactNode;
  onClick: () => void;
  onClear?: () => void;
  clearTitle?: string;
  title?: string;
  /** 64px (portraits perso/cible — demande Sevih 27/07/2026) vs 48px (gear). */
  large?: boolean;
}) {
  return (
    <span className="relative inline-block shrink-0">
      <button
        type="button"
        title={title}
        onClick={onClick}
        // PAS d'`overflow-hidden` : les portraits posés ici sont des vignettes
        // du jeu, dont l'icône d'élément sort volontairement du cadre (le prefab
        // l'ancre en dehors). Rogner la recadrait en biais.
        className={`border-line-subtle bg-surface-sunken/70 hover:border-accent grid cursor-pointer place-items-center rounded-lg border transition ${
          large ? 'h-16 w-16' : 'h-12 w-12'
        }`}
      >
        {children ?? <span className="text-content-subtle text-lg font-bold">?</span>}
      </button>
      {children && onClear && (
        <button
          type="button"
          className="border-line-subtle bg-surface-overlay text-content-subtle hover:text-danger absolute -top-1.5 -right-1.5 grid h-4.5 w-4.5 cursor-pointer place-items-center rounded-full border text-[9px] leading-none"
          onClick={onClear}
          title={clearTitle}
        >
          ✕
        </button>
      )}
    </span>
  );
}

/**
 * Portrait de MONSTRE — LE MÊME rendu partout (cible sélectionnée, listes du
 * picker, vagues du browser story — demande Sevih 06/08/2026).
 *
 * Ce n'est plus qu'un adaptateur : la vignette vient de `Thumbnail`, transcrite
 * du prefab `uimonsterthumbnail`. Ce qu'il portait avant à l'œil est parti avec
 * lui — un fond déduit de la RARETÉ (le jeu le déduit du TYPE, cf. `DcTarget`),
 * une vignette à 92 % du fond au lieu de 122/128, un élément et une classe à
 * 34 % l'un sous l'autre, et un niveau en pastille alors que le jeu l'écrit à nu.
 */
export function MonsterPortrait({
  tg,
  level,
  className,
}: {
  tg: Pick<DcTarget, 'icon' | 'element' | 'cls' | 'type' | 'rarity' | 'name' | 'story'>;
  level?: number;
  className: string;
}) {
  return (
    <Thumbnail
      kind="monster"
      icon={tg.icon}
      type={tg.type}
      stars={tg.rarity}
      element={tg.element}
      cls={tg.cls}
      level={level}
      name={tg.name}
      // Hors histoire les presets sont tous des boss ; en story le rôle vient
      // de la donnée (les renforts n'ont pas la bannière boss).
      boss={!tg.story || tg.story.role === 'boss'}
      className={className}
    />
  );
}

export const ROW_CLASS =
  'hover:bg-surface-raised/80 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition';
export const SELECT_CLASS =
  'border-line-subtle bg-surface-sunken/70 text-content focus:border-accent h-8 w-full cursor-pointer rounded-lg border px-2 text-xs focus:outline-none';

export function NoMatches({ label }: { label: string }) {
  return <p className="text-content-subtle px-2 py-3 text-center text-xs">{label}</p>;
}

/**
 * Portrait de PERSO du calculateur — l'autre habillage de la même vignette.
 * Adaptateur symétrique de `MonsterPortrait` : `DcChar` porte déjà tout ce que
 * le prefab demande.
 */
export function CharPortrait({ c, className }: { c: DcChar; className: string }) {
  return (
    <Thumbnail
      kind="character"
      id={c.id}
      rarity={c.rarity}
      element={c.element}
      cls={c.cls}
      name={c.label}
      className={className}
    />
  );
}

/**
 * Picker de personnage (attaquant, allié, cible perso) : ancre compacte →
 * MODALE à grille de faces (recherche + filtres élément/classe), comme le pool
 * du tier-list-maker (demande Sevih 27/07/2026 — plus de select).
 */
export function CharPicker({
  chars,
  value,
  onPick,
  onClear,
  placeholder,
  labels,
  aside,
}: {
  chars: DcChar[];
  value: string | null;
  onPick: (id: string) => void;
  onClear?: () => void;
  placeholder: string;
  labels: DcLabels;
  /** Rendu à droite du portrait, sous le nom (slider de transcendance). */
  aside?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [elements, setElements] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const current = value ? chars.find((c) => c.id === value) : undefined;
  const q = search.trim().toLowerCase();
  const filtered = chars.filter(
    (c) =>
      (!q || c.label.toLowerCase().includes(q)) &&
      (!elements.length || elements.includes(c.element)) &&
      (!classes.length || classes.includes(c.cls)),
  );
  const toggle = (set: (fn: (prev: string[]) => string[]) => void, v: string) =>
    set((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  const close = () => {
    setOpen(false);
    setSearch('');
  };
  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <SlotTile
          large
          onClick={() => setOpen(true)}
          onClear={onClear}
          clearTitle={labels.clear}
          title={current?.label ?? placeholder}
        >
          {current ? <CharPortrait c={current} className="h-full w-full" /> : null}
        </SlotTile>
        {current ? (
          <div className="min-w-0 flex-1 space-y-0.5">
            <span className="text-content block text-sm font-semibold wrap-break-word">
              {current.label}
            </span>
            {aside}
          </div>
        ) : (
          <span className="text-content-subtle min-w-0 text-sm wrap-break-word">{placeholder}</span>
        )}
      </div>
      <Modal open={open} onClose={close} title={placeholder}>
        <SearchField value={search} onChange={setSearch} placeholder={labels.search} />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1.5">
            {ELEMENT_ORDER.map((el) => (
              <FilterPill
                key={el}
                active={elements.includes(el)}
                onClick={() => toggle(setElements, el)}
                className="h-8 w-8 px-0"
                title={el}
              >
                <img src={img.element(el)} alt={el} className="h-5 w-5" width={20} height={20} />
              </FilterPill>
            ))}
          </div>
          <div className="flex gap-1.5">
            {CLASS_ORDER.map((cl) => (
              <FilterPill
                key={cl}
                active={classes.includes(cl)}
                onClick={() => toggle(setClasses, cl)}
                className="h-8 w-8 px-0"
                title={cl}
              >
                <img src={img.klass(cl)} alt={cl} className="h-5 w-5" width={20} height={20} />
              </FilterPill>
            ))}
          </div>
        </div>
        {filtered.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] gap-1.5">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                className="group flex cursor-pointer flex-col items-center gap-1"
                title={c.label}
                onClick={() => {
                  onPick(c.id);
                  close();
                }}
              >
                {/* L'anneau de sélection sur un CONTENEUR, pas sur la vignette :
                    elle n'est plus une image carrée qu'on peut border — son
                    icône d'élément déborde volontairement du cadre. */}
                <span
                  className={`rounded-lg ring-2 transition ${
                    c.id === value ? 'ring-accent' : 'group-hover:ring-accent/50 ring-transparent'
                  }`}
                >
                  <CharPortrait c={c} className="h-16 w-16" />
                </span>
                <span className="text-content-muted group-hover:text-content w-full text-center text-[10px] leading-tight wrap-break-word">
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <NoMatches label={labels.noMatches} />
        )}
      </Modal>
    </>
  );
}

/**
 * Slider de transcendance — même motif que la fiche perso
 * (`TranscendSlider` d'EeTranscendSection, demande Sevih 27/07/2026), version
 * COMPACTE : les étoiles (légèrement chevauchées) disent tout, pas de libellé
 * ni de texte ; piste fine pilotée au clavier, boutons −/+ souris hors arbre
 * a11y. Tokens du thème, sans les bonus de palier (les stats sont SAISIES ici).
 */
export function TranscendSlider({
  tiers,
  idx,
  onIdx,
}: {
  tiers: DcTranscendTier[];
  idx: number;
  onIdx: (v: number) => void;
}) {
  const i = Math.max(0, Math.min(idx, tiers.length - 1));
  const tier = tiers[i];
  if (!tier) return null;
  const pct = (i / Math.max(1, tiers.length - 1)) * 100;
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="flex shrink-0 items-center">
        {transcendStarRow(tier.star, tier.color).map((sprite, j) => (
          <img
            key={j}
            src={img.transcendStar(sprite)}
            alt=""
            aria-hidden
            className="h-4 w-4 drop-shadow-md"
            width={16}
            height={16}
            style={{ marginLeft: j ? -4 : 0 }}
          />
        ))}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <button
          type="button"
          onClick={() => onIdx(Math.max(0, i - 1))}
          className="border-line-subtle text-content-muted hover:bg-surface-raised/80 h-4 w-4 cursor-pointer rounded border text-[10px] leading-none"
          aria-hidden
          tabIndex={-1}
        >
          –
        </button>
        <div className="relative flex h-3 flex-1 items-center">
          <div className="bg-surface-sunken absolute inset-x-0 h-0.5 rounded-full" />
          <div className="bg-accent absolute h-0.5 rounded-full" style={{ width: `${pct}%` }} />
          <input
            type="range"
            min={0}
            max={tiers.length - 1}
            step={1}
            value={i}
            onChange={(e) => onIdx(Number(e.target.value))}
            className="absolute inset-0 w-full cursor-pointer opacity-0"
            aria-valuetext={tier.label}
          />
          <div
            className="bg-accent absolute h-2 w-2 -translate-x-1/2 rounded-full"
            style={{ left: `${pct}%` }}
          />
        </div>
        <button
          type="button"
          onClick={() => onIdx(Math.min(tiers.length - 1, i + 1))}
          className="border-line-subtle text-content-muted hover:bg-surface-raised/80 h-4 w-4 cursor-pointer rounded border text-[10px] leading-none"
          aria-hidden
          tabIndex={-1}
        >
          +
        </button>
      </div>
    </div>
  );
}

/** Tag DMG / Support d'un skill (flag `offensive` de la donnée). */
export function SkillTag({ offensive, labels }: { offensive: boolean; labels: DcLabels }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide uppercase ${
        offensive
          ? 'border-danger/40 bg-danger/10 text-danger'
          : 'border-line-subtle bg-surface-sunken/60 text-content-subtle'
      }`}
    >
      {offensive ? labels.skills.dmg : labels.skills.support}
    </span>
  );
}
