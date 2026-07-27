'use client';

/**
 * Damage Calculator — client, PHASE UI SEULE.
 *
 * Tout ce qui s'affiche est RÉEL (roster, kits, passifs, presets de cible) mais
 * AUCUN dégât n'est calculé : le moteur `src/lib/damage` ne sera branché
 * qu'avec les extracteurs damage (docs/specs/damage-report-inputs.md § 6). La
 * colonne Rapport rend la mise en page finale avec des valeurs « — » et un
 * bandeau l'assumant. Aucune donnée n'est localisée ici : tout vient du wrapper.
 *
 * Décisions produit (Sevih, 26/07/2026) :
 *   - stats SAISIES depuis la fiche du jeu → l'UI ne montre que ce que la fiche
 *     ne porte pas (sets de combat, arme/accessoire, EE, Rogue's Charm, quirks) ;
 *   - niveaux de skill INDÉPENDANTS (S1/S2/S3, chain+dual partagés) ;
 *   - quirks de COMPTE : réglage persistant (localStorage) sur les arbres réels ;
 *   - 4 unités max sur le terrain (attaquant + 3 alliés, cibles 1–4).
 */

import { Fragment, useMemo, useRef, useState, useEffect, type ReactNode } from 'react';
import LZString from 'lz-string';
import { img, ELEMENT_ORDER, transcendStarRow } from '@/lib/images';
import { useStoredState, type StoreSpec } from '@/lib/client-storage';
import { EquipmentIcon } from '@/components/equipment/EquipmentIcon';
import { EffectIconTile } from '@/components/character/EffectChips';
import { SearchField } from '@/components/character/filters/FilterAtoms';
import { FilterPill } from '@/components/character/filters/FilterPill';
import { GameText } from '@/components/ui/GameText';
import { DebugHarness } from './DebugHarness';

// ── Contrats wrapper → client ──────────────────────────────────────────────

/** Palier de transcendance (forme compacte de `TranscendTierView`) — la rangée
 *  d'étoiles se reconstruit via `transcendStarRow` de `@/lib/images`. */
export interface DcTranscendTier {
  label: string;
  star: number;
  color: string;
}

export interface DcChar {
  id: string;
  label: string;
  element: string;
  cls: string;
  rarity: number;
  /** Stats de la fiche à SAISIR pour ce perso (slugs, ordre de la fiche). */
  statKeys: string[];
  /** Paliers de transcendance réels (barème de la rareté ou override). */
  transcend: DcTranscendTier[];
}

export interface DcSkillRow {
  slot: string;
  name: string;
  iconSrc?: string;
  offensive: boolean;
  /** Multi-cible (RangeType all/double) — conditionne « cibles touchées ». */
  aoe?: boolean;
  maxLevel: number;
}

export interface DcGear {
  slug: string;
  label: string;
  icon: string;
  grade: string;
  /** Étoiles du haut de famille (tuile « comme partout »). */
  star: number;
  /** Icône d'effet du passif, posée en overlay sur la tuile. */
  overlayIcon?: string;
  classLimits: string[];
  /** Texte du passif à T0..T4. */
  tiers: string[];
  /** Variantes par classe (Briareos/Gorgon) — remplace `tiers` si la classe matche. */
  classTiers?: Record<string, string[]>;
}

export interface DcSet {
  id: string;
  label: string;
  icon: string;
  /** Texte 2P par état (index 0 = base, 1 = enchanté) — null si pas d'effet 2P. */
  p2: (string | null)[];
  p4: (string | null)[];
  /** Effet fonction des PV manquants → l'UI demande les PV actuels. */
  hpScaled?: boolean;
}

/** Buff/débuff de scénario STANDARDISÉ (magnitude fixe du glossaire du jeu). */
export interface DcBuffOption {
  key: string;
  name: string;
  /** Desc officielle (porte la magnitude : « Increases Attack by 30%. »). */
  desc: string;
  /** Sprite IG_Buff_* (rendu EffectIconTile). */
  icon: string;
  debuff: boolean;
  /** Slug de la fiche : le chip n'apparaît que si pertinent pour l'attaquant. */
  stat?: string;
}

export interface DcTalisman {
  slug: string;
  label: string;
  icon: string;
  grade: string;
  star: number;
  /** Icône d'effet du passif, posée en overlay sur la tuile. */
  overlayIcon?: string;
  text: string | null;
}

export interface DcEERow {
  /** Niveau d'objet de déblocage du palier (1 = base, 10 = +10). */
  level: number;
  /** Vrai si ce palier S'AJOUTE au précédent (sinon il le remplace). */
  isAdd: boolean;
  /** Texte rempli, balises <color> du jeu conservées (rendu GameText). */
  html: string;
}

export interface DcEE {
  name: string;
  src: string;
  grade: string;
  star: number;
  rows: DcEERow[];
  /** Main « dégâts vs élément » (absente de la fiche perso) : montant en ‰
   *  par niveau d'enchant (index 0 = +0 … 10 = +10). */
  dmgMain?: { label: string; levels: number[] };
}

export interface DcSpawn {
  label: string;
  level: number;
  /** Stats défensives EFFECTIVES au spawn (niveau + adv + bossHp appliqués). */
  stats: { hp: number; def: number; dmgRed: number; cdmgRed: number };
}

export interface DcTarget {
  id: string;
  /** Libellé de MODE localisé (glossaire du jeu) — premier niveau du picker. */
  mode: string;
  /** CASCADE de selects sous le mode quand la donnée la porte (Saison puis
   *  Épisode en histoire, ligue de world boss, phase de guild raid…). */
  path?: string[];
  /** Entrée de la liste : le donjon (« Floor N » en infiltration). */
  label: string;
  /** Classe du boss (overlay de portrait, comme les persos). */
  cls: string;
  /** Boss de la vague principale. */
  name: string;
  iconSrc: string;
  element: string;
  spawns: DcSpawn[];
}

export interface DcStatField {
  key: string;
  label: string;
  percent: boolean;
}

/** Nœud de quirk à IMPACT (les hausses de stats pures sont déjà dans la fiche). */
export interface DcQuirkNode {
  id: number;
  iconSrc: string;
  color: string;
  name: string;
  maxLevel: number;
  /** Texte de l'effet par niveau (index 0 = Lv1), balises <color> conservées. */
  texts: string[];
}

export interface DcQuirkGroup {
  key: string;
  label: string;
  nodes: DcQuirkNode[];
}

export interface DcLabels {
  search: string;
  select: string;
  noMatches: string;
  clear: string;
  panels: { attacker: string; target: string; team: string; result: string };
  title: string;
  pick: string;
  skills: { title: string; dmg: string; support: string };
  settings: {
    title: string;
    subtitle: string;
    quirks: string;
    reset: string;
    activateAll: string;
  };
  equipment: {
    title: string;
    sets: string;
    weapon: string;
    accessory: string;
    ee: string;
    eeNone: string;
    noPassive: string;
    pickWeapon: string;
    pickAccessory: string;
    talisman: string;
    lv0: string;
    lv10: string;
    p2: string;
    p4: string;
  };
  stats: { title: string; sheetNote: string; final: string; finalNote: string };
  target: {
    preset: string;
    manual: string;
    element: string;
    copyFromSelected: string;
    all: string;
    mode: string;
    lv: string;
    stage: string;
    fight: string;
    bossFlag: string;
  };
  toolbar: { reset: string; copy: string; copied: string };
  context: {
    title: string;
    targetsHit: string;
    attackerHp: string;
    targetHp: string;
  };
  team: { emptySlot: string; eeOwned: string; eePlus: string };
  buffs: {
    fromKits: string;
    kitsSoon: string;
    awaitPick: string;
    atkBuff: string;
    atkDebuff: string;
    tgtBuff: string;
    tgtDebuff: string;
  };
  report: {
    empty: string;
    wip: string;
    branchesNote: string;
    normal: string;
    critical: string;
    miss: string;
    supportSkills: string;
  };
}

interface Props {
  chars: DcChar[];
  kits: Record<string, DcSkillRow[]>;
  weapons: DcGear[];
  amulets: DcGear[];
  sets: DcSet[];
  talismans: DcTalisman[];
  ees: Record<string, DcEE>;
  targets: DcTarget[];
  statFields: DcStatField[];
  /** Stats défensives de la CIBLE (affichage preset + saisie manuelle). */
  targetStatFields: DcStatField[];
  /** Main stats de talisman proposées pour les ALLIÉS (slug + libellé). */
  talismanMains: { key: string; label: string }[];
  /** Buffs/débuffs de scénario standardisés à impact (chips à bascule),
   *  par côté ET par sens : buffs/débuffs du lanceur, buffs/débuffs de la cible. */
  buffOptions: {
    atkBuff: DcBuffOption[];
    atkDebuff: DcBuffOption[];
    tgtBuff: DcBuffOption[];
    tgtDebuff: DcBuffOption[];
  };
  quirks: DcQuirkGroup[];
  labels: DcLabels;
}

/** Niveaux de quirks POSSÉDÉS par nœud — réglage de compte, partagé entre
 *  sessions (et demain entre outils) via localStorage. */
const QUIRKS_STORE: StoreSpec<Record<number, number>> = {
  key: 'outerpedia:damage-calculator:quirks',
  version: 1,
  fallback: {},
};

// ── Briques d'affichage ────────────────────────────────────────────────────

const vars = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-content-subtle text-[10px] font-bold tracking-[0.14em] uppercase">
      {children}
    </span>
  );
}

function Card({
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

function Stepper({
  value,
  min,
  max,
  onChange,
  format,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const btn =
    'text-content-muted hover:text-accent h-6 w-5 cursor-pointer text-sm leading-none transition';
  return (
    <span className="border-line-subtle bg-surface-sunken/70 inline-flex items-center overflow-hidden rounded-md border">
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
function Modal({
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
function SlotTile({
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
        className={`border-line-subtle bg-surface-sunken/70 hover:border-accent grid cursor-pointer place-items-center overflow-hidden rounded-lg border transition ${
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

const ROW_CLASS =
  'hover:bg-surface-raised/80 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition';
const SELECT_CLASS =
  'border-line-subtle bg-surface-sunken/70 text-content focus:border-accent h-8 w-full cursor-pointer rounded-lg border px-2 text-xs focus:outline-none';

function NoMatches({ label }: { label: string }) {
  return <p className="text-content-subtle px-2 py-3 text-center text-xs">{label}</p>;
}

/**
 * Overlays de portrait façon `CharacterPortrait` — posés SUR la tuile pour
 * libérer la place des icônes à côté des noms (demande Sevih 27/07/2026).
 * Colonne de droite : élément, puis classe, puis niveau (cibles) ; la bannière
 * BOSS (sprite éditorial `MT_Boss`, 60×20) traverse le haut et décale la
 * colonne. À poser dans un conteneur `relative`.
 */
function TileOverlays({
  element,
  cls,
  boss,
  level,
}: {
  element?: string;
  cls?: string;
  /** Bannière BOSS — cibles de preset (tous les presets ciblent un boss). */
  boss?: boolean;
  /** Niveau du spawn résolu, sous l'icône de classe. */
  level?: number;
}) {
  return (
    <>
      {boss && (
        <img
          src={img.tag('MT_Boss')}
          alt="boss"
          className="absolute top-0 left-0 h-[20%] w-auto drop-shadow-md"
        />
      )}
      {element && (
        <img
          src={img.element(element)}
          alt={element}
          className="absolute top-0 right-0 h-[34%] w-[34%] drop-shadow-md"
        />
      )}
      {cls && (
        <img
          src={img.klass(cls)}
          alt={cls}
          className="absolute top-[40%] right-0 h-[24%] w-[24%] drop-shadow-md"
        />
      )}
      {level != null && (
        <span className="bg-scrim/70 text-content absolute top-[64%] right-0 rounded-l px-0.5 font-mono text-[9px] font-bold tabular-nums">
          {level}
        </span>
      )}
    </>
  );
}

/**
 * Picker de personnage (attaquant, allié, cible perso) : ancre compacte →
 * MODALE à grille de faces (recherche + filtres élément/classe), comme le pool
 * du tier-list-maker (demande Sevih 27/07/2026 — plus de select).
 */
function CharPicker({
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
          {current ? (
            <span className="relative block h-full w-full">
              <img src={img.face(current.id)} alt="" className="h-full w-full" loading="lazy" />
              <TileOverlays element={current.element} cls={current.cls} />
            </span>
          ) : null}
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
                <span className="relative">
                  <img
                    src={img.face(c.id)}
                    alt=""
                    className={`group-hover:border-accent h-16 w-16 rounded-lg border transition ${
                      c.id === value ? 'border-accent' : 'border-line-subtle'
                    }`}
                    loading="lazy"
                  />
                  <TileOverlays element={c.element} cls={c.cls} />
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
function TranscendSlider({
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
function SkillTag({ offensive, labels }: { offensive: boolean; labels: DcLabels }) {
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

// ── État ───────────────────────────────────────────────────────────────────

/** Un set choisi : le nombre de picks décide des pièces (1 → 4P, 2 → 2P+2P). */
interface SetPick {
  setId: string;
  tier: number;
}

/** Un allié : perso + transcendance + main stat & enhancement (+0 à +10) du
 *  talisman porté + EE possédé / +10 (certains EE portent sur l'équipe) —
 *  tout est une entrée du moteur (Sevih 27/07/2026). */
interface AllyPick {
  id: string | null;
  transcend: number;
  talisman: string | null;
  talismanLv: number;
  ee: boolean;
  eePlus: boolean;
}
const EMPTY_ALLY: AllyPick = {
  id: null,
  transcend: 0,
  talisman: null,
  talismanLv: 10,
  ee: true,
  eePlus: true,
};

/**
 * État sérialisé dans l'URL (`?z=` lz-string, motif team-planner) — clés
 * COURTES, valeurs par défaut omises : un refresh ne perd plus le scénario.
 * Tout est REVALIDÉ à l'hydratation (ids inconnus écartés, nombres bornés).
 */
interface UrlState {
  /** Attaquant + palier de transcendance + niveaux de skill. */
  a?: string;
  x?: number;
  k?: Record<string, number>;
  /** Arme / accessoire (slug + breakthrough). */
  w?: string;
  y?: number;
  m?: string;
  q?: number;
  /** Sets choisis ([id, enchanté 0/1]) · Rogue's Charm · EE absent · niveau d'EE. */
  s?: [string, number][];
  t?: 1;
  eo?: 0;
  e?: number;
  /** Stats saisies · PV actuels (%). */
  v?: Record<string, string>;
  h?: string;
  /** Cible : onglet manuel, preset + stage, élément + stats manuelles + flag
   *  boss (manuel) + PV actuels (%). */
  g?: 1;
  ti?: string;
  si?: number;
  te?: string;
  tv?: Record<string, string>;
  tb?: 1;
  th?: string;
  /** Cibles touchées · alliés ([id, palier, main talisman, enhancement,
   *  EE possédé 0/1, EE+10 0/1]) · buffs actifs. */
  n?: number;
  al?: [string, number, string, number, number, number][];
  b?: string[];
  d?: string[];
}

// ── Composant principal ────────────────────────────────────────────────────

export function DamageCalculatorBrowser({
  chars,
  kits,
  weapons,
  amulets,
  sets,
  talismans,
  ees,
  targets,
  statFields,
  targetStatFields,
  talismanMains,
  buffOptions,
  quirks,
  labels: L,
}: Props) {
  const [tab, setTab] = useState<'calc' | 'settings'>('calc');
  // Feedback du bouton « copier le lien » (l'URL porte déjà tout le scénario).
  const [copied, setCopied] = useState(false);
  const [attackerId, setAttackerId] = useState<string | null>(null);
  // INDEX dans les paliers de transcendance du perso (défaut : palier max).
  const [transcend, setTranscend] = useState(0);
  const [skillLvls, setSkillLvls] = useState<Record<string, number>>({});
  // Sets choisis (0 à 2) : 4 pièces d'armure au total → un seul 4P, ou 2P+2P.
  const [setPicks, setSetPicks] = useState<SetPick[]>([]);
  const [weaponSlug, setWeaponSlug] = useState<string | null>(null);
  const [weaponTier, setWeaponTier] = useState(0);
  const [amuletSlug, setAmuletSlug] = useState<string | null>(null);
  const [amuletTier, setAmuletTier] = useState(0);
  // Rogue's Charm +10 : simple interrupteur (seul talisman à toucher aux dégâts).
  const [talismanOn, setTalismanOn] = useState(false);
  // EE possédé ou non — +0 ≠ absent : le passif Lv0 s'applique dès qu'on le porte.
  const [eeOwned, setEeOwned] = useState(true);
  // Niveau d'enchant de l'EE (+0..+10) — ne sert qu'aux mains « dégâts vs élément ».
  const [eeLevel, setEeLevel] = useState(10);
  const [statVals, setStatVals] = useState<Record<string, string>>({});
  const [quirkLvls, setQuirkLvls] = useStoredState(QUIRKS_STORE);
  // Cible : preset (donjon réel) OU saisie manuelle — le type de contenu se
  // DÉDUIT du preset choisi, le PvP est hors périmètre (Sevih 27/07/2026).
  const [targetTab, setTargetTab] = useState<'preset' | 'manual'>('preset');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [spawnIdx, setSpawnIdx] = useState(0);
  // Cible MANUELLE : élément + stats défensives (mêmes champs que le preset)
  // + flag boss (conditionnels « vs boss » — les presets sont TOUS des boss).
  const [tgtElement, setTgtElement] = useState<string | null>(null);
  const [tgtStats, setTgtStats] = useState<Record<string, string>>({});
  const [tgtBoss, setTgtBoss] = useState(false);
  // PV actuels de la cible (%) — skills qui tapent sur PV max/actuels/manquants.
  const [tgtHpPct, setTgtHpPct] = useState('100');
  const [targetsHit, setTargetsHit] = useState(1);
  const [allies, setAllies] = useState<AllyPick[]>([EMPTY_ALLY, EMPTY_ALLY, EMPTY_ALLY]);
  // Buffs/débuffs de scénario ACTIFS (clés de DcBuffOption), par côté.
  const [atkFx, setAtkFx] = useState<string[]>([]);
  const [tgtFx, setTgtFx] = useState<string[]>([]);
  // PV actuels de l'attaquant (%) — ne sert qu'aux sets « missing Health ».
  const [hpPct, setHpPct] = useState('100');

  const attacker = attackerId ? chars.find((c) => c.id === attackerId) : undefined;
  const kit = attackerId ? (kits[attackerId] ?? []) : [];
  const ee = attackerId ? ees[attackerId] : undefined;
  const weapon = weaponSlug ? weapons.find((w) => w.slug === weaponSlug) : undefined;
  const amulet = amuletSlug ? amulets.find((a) => a.slug === amuletSlug) : undefined;
  const talisman = talismans[0];

  // Saisie/stats finales : SEULES les stats qui pilotent les dégâts de CE perso
  // (`statKeys`, dérivé des kits par damage-scaling.json). Le select des buffs
  // garde la liste complète : il sert aussi la CIBLE (DEF down…).
  const sheetFields = attacker
    ? statFields.filter((f) => attacker.statKeys.includes(f.key))
    : statFields;

  // Cibles : modes distincts (ordre du jeu) — pastilles de filtre du picker.
  const modes = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const tg of targets)
      if (!seen.has(tg.mode)) {
        seen.add(tg.mode);
        out.push(tg.mode);
      }
    return out;
  }, [targets]);
  const target = targetId ? targets.find((tg) => tg.id === targetId) : undefined;
  const spawn = target?.spawns[Math.min(spawnIdx, target.spawns.length - 1)];
  // Les buffs/débuffs de scénario attendent les DEUX combattants (Sevih
  // 27/07/2026) — en manuel, la cible « existe » dès l'onglet.
  const targetReady = targetTab === 'manual' || Boolean(target);

  // Armes/accessoires filtrés par la classe de l'attaquant (classLimit du jeu).
  // Pas de useMemo : le React Compiler mémoïse seul (et refuse de préserver une
  // mémoïsation manuelle depuis que `attacker` alimente aussi le cadre debug).
  const pickableWeapons = attacker
    ? weapons.filter((w) => !w.classLimits.length || w.classLimits.includes(attacker.cls))
    : weapons;
  const pickableAmulets = attacker
    ? amulets.filter((a) => !a.classLimits.length || a.classLimits.includes(attacker.cls))
    : amulets;

  const pickAttacker = (id: string) => {
    setAttackerId(id);
    setTranscend((chars.find((c) => c.id === id)?.transcend.length ?? 1) - 1);
    const lvls: Record<string, number> = {};
    for (const row of kits[id] ?? []) lvls[row.slot] = row.maxLevel;
    setSkillLvls(lvls);
    setWeaponSlug(null);
    setAmuletSlug(null);
    setEeOwned(true);
    setEeLevel(10);
  };

  // Reset du SCÉNARIO (Sevih 27/07/2026) — les quirks (réglage de COMPTE) et
  // l'onglet courant ne bougent pas ; l'URL se nettoie via l'effet débouncé.
  const resetScenario = () => {
    setAttackerId(null);
    setTranscend(0);
    setSkillLvls({});
    setSetPicks([]);
    setWeaponSlug(null);
    setWeaponTier(0);
    setAmuletSlug(null);
    setAmuletTier(0);
    setTalismanOn(false);
    setEeOwned(true);
    setEeLevel(10);
    setStatVals({});
    setHpPct('100');
    setTargetTab('preset');
    setTargetId(null);
    setSpawnIdx(0);
    setTgtElement(null);
    setTgtStats({});
    setTgtBoss(false);
    setTgtHpPct('100');
    setTargetsHit(1);
    setAllies([EMPTY_ALLY, EMPTY_ALLY, EMPTY_ALLY]);
    setAtkFx([]);
    setTgtFx([]);
  };

  // Chips proposés : même filtre de pertinence que la saisie des stats.
  const relevantFx = (options: DcBuffOption[]) =>
    options.filter((o) => !o.stat || !attacker || attacker.statKeys.includes(o.stat));
  const toggleFx = (set: (fn: (prev: string[]) => string[]) => void, key: string) =>
    set((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));

  // ── Persistance URL (`?z=` lz-string, motif team-planner) ────────────────
  // Hydratation UNE fois au mount, puis écriture DÉBOUNCÉE à chaque
  // changement : un refresh ne perd plus le scénario (demande Sevih
  // 27/07/2026). Les QUIRKS restent en localStorage — réglage de COMPTE.
  const didHydrate = useRef(false);
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    const zRaw = new URLSearchParams(window.location.search).get('z');
    if (!zRaw) return;
    let parsed: UrlState | null = null;
    try {
      parsed = JSON.parse(
        LZString.decompressFromEncodedURIComponent(zRaw) || 'null',
      ) as UrlState | null;
    } catch {
      parsed = null;
    }
    if (!parsed || typeof parsed !== 'object') return;
    const st = parsed;
    // Règle set-state-in-effect : la pose d'état est déférée en microtâche.
    void Promise.resolve().then(() => {
      const char = st.a ? chars.find((c) => c.id === st.a) : undefined;
      if (char) {
        setAttackerId(char.id);
        const maxIdx = Math.max(char.transcend.length - 1, 0);
        setTranscend(typeof st.x === 'number' ? Math.min(Math.max(st.x, 0), maxIdx) : maxIdx);
        const lvls: Record<string, number> = {};
        for (const row of kits[char.id] ?? []) {
          const v = st.k?.[row.slot];
          lvls[row.slot] =
            typeof v === 'number' ? Math.min(Math.max(v, 1), row.maxLevel) : row.maxLevel;
        }
        setSkillLvls(lvls);
        if (st.w && weapons.some((x) => x.slug === st.w)) setWeaponSlug(st.w);
        if (typeof st.y === 'number') setWeaponTier(Math.min(Math.max(st.y, 0), 4));
        if (st.m && amulets.some((x) => x.slug === st.m)) setAmuletSlug(st.m);
        if (typeof st.q === 'number') setAmuletTier(Math.min(Math.max(st.q, 0), 4));
        if (Array.isArray(st.s))
          setSetPicks(
            st.s
              .filter(
                (p): p is [string, number] => Array.isArray(p) && sets.some((x) => x.id === p[0]),
              )
              .slice(0, 2)
              .map(([setId, tier]) => ({ setId, tier: tier ? 1 : 0 })),
          );
        if (st.t) setTalismanOn(true);
        if (st.eo === 0) setEeOwned(false);
        if (typeof st.e === 'number') setEeLevel(Math.min(Math.max(st.e, 0), 10));
        if (st.v && typeof st.v === 'object')
          setStatVals(
            Object.fromEntries(Object.entries(st.v).filter(([, v]) => typeof v === 'string')),
          );
        if (typeof st.h === 'string') setHpPct(st.h);
        if (Array.isArray(st.b)) setAtkFx(st.b.filter((x): x is string => typeof x === 'string'));
        if (Array.isArray(st.d)) setTgtFx(st.d.filter((x): x is string => typeof x === 'string'));
      }
      if (st.g) setTargetTab('manual');
      if (st.ti && targets.some((tg) => tg.id === st.ti)) {
        setTargetId(st.ti);
        if (typeof st.si === 'number') setSpawnIdx(Math.max(st.si, 0));
      }
      if (st.te && (ELEMENT_ORDER as readonly string[]).includes(st.te)) setTgtElement(st.te);
      if (st.tv && typeof st.tv === 'object')
        setTgtStats(
          Object.fromEntries(Object.entries(st.tv).filter(([, v]) => typeof v === 'string')),
        );
      if (st.tb) setTgtBoss(true);
      if (typeof st.th === 'string') setTgtHpPct(st.th);
      if (typeof st.n === 'number') setTargetsHit(Math.min(Math.max(st.n, 1), 4));
      if (Array.isArray(st.al))
        setAllies(
          Array.from({ length: 3 }, (_, i) => {
            const row = st.al?.[i];
            if (!Array.isArray(row)) return EMPTY_ALLY;
            const [id, tx, tal, tlv, eo, ep] = row;
            const c = typeof id === 'string' ? chars.find((x) => x.id === id) : undefined;
            if (!c) return EMPTY_ALLY;
            const maxIdx = Math.max(c.transcend.length - 1, 0);
            const ee = typeof eo === 'number' ? Boolean(eo) : true;
            return {
              id: c.id,
              transcend: typeof tx === 'number' ? Math.min(Math.max(tx, 0), maxIdx) : maxIdx,
              talisman:
                typeof tal === 'string' && talismanMains.some((mn) => mn.key === tal) ? tal : null,
              talismanLv: typeof tlv === 'number' ? Math.min(Math.max(tlv, 0), 10) : 10,
              ee,
              eePlus: ee && (typeof ep === 'number' ? Boolean(ep) : true),
            };
          }),
        );
    });
  }, [chars, kits, weapons, amulets, sets, targets, talismanMains]);

  useEffect(() => {
    if (!didHydrate.current) return;
    const timer = window.setTimeout(() => {
      const z: UrlState = {};
      if (attackerId) {
        z.a = attackerId;
        z.x = transcend;
        z.k = skillLvls;
        if (weaponSlug) {
          z.w = weaponSlug;
          if (weaponTier) z.y = weaponTier;
        }
        if (amuletSlug) {
          z.m = amuletSlug;
          if (amuletTier) z.q = amuletTier;
        }
        if (setPicks.length) z.s = setPicks.map((p) => [p.setId, p.tier]);
        if (talismanOn) z.t = 1;
        if (!eeOwned) z.eo = 0;
        if (eeLevel !== 10) z.e = eeLevel;
        const vals = Object.fromEntries(Object.entries(statVals).filter(([, v]) => v !== ''));
        if (Object.keys(vals).length) z.v = vals;
        if (hpPct !== '100') z.h = hpPct;
        if (atkFx.length) z.b = atkFx;
        if (tgtFx.length) z.d = tgtFx;
      }
      if (targetTab === 'manual') z.g = 1;
      if (targetId) {
        z.ti = targetId;
        if (spawnIdx) z.si = spawnIdx;
      }
      if (tgtElement) z.te = tgtElement;
      const tv = Object.fromEntries(Object.entries(tgtStats).filter(([, v]) => v !== ''));
      if (Object.keys(tv).length) z.tv = tv;
      if (tgtBoss) z.tb = 1;
      if (tgtHpPct !== '100') z.th = tgtHpPct;
      if (targetsHit > 1) z.n = targetsHit;
      if (allies.some((a) => a.id))
        z.al = allies.map((a) => [
          a.id ?? '',
          a.transcend,
          a.talisman ?? '',
          a.talismanLv,
          Number(a.ee),
          Number(a.eePlus),
        ]);
      const packed = Object.keys(z).length
        ? `?z=${LZString.compressToEncodedURIComponent(JSON.stringify(z))}`
        : '';
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${packed}${window.location.hash}`,
      );
    }, 400);
    return () => window.clearTimeout(timer);
  }, [
    attackerId,
    transcend,
    skillLvls,
    weaponSlug,
    weaponTier,
    amuletSlug,
    amuletTier,
    setPicks,
    talismanOn,
    eeOwned,
    eeLevel,
    statVals,
    hpPct,
    targetTab,
    targetId,
    spawnIdx,
    tgtElement,
    tgtStats,
    tgtBoss,
    tgtHpPct,
    targetsHit,
    allies,
    atkFx,
    tgtFx,
  ]);

  const offensiveSkills = kit.filter((s) => s.offensive);
  const supportSkills = kit.filter((s) => !s.offensive);

  const wellClass = 'border-line-subtle bg-surface-sunken/70 rounded-lg border';

  // Cadre de DEBUG (Sevih 27/07/2026) : l'état exact que le moteur consommera
  // — savoir ce qu'on a et ce qui est actif pendant le branchement du rapport.
  const debugState = {
    attacker: attacker
      ? {
          id: attacker.id,
          transcend: attacker.transcend[transcend]?.label ?? null,
          skills: skillLvls,
          weapon: weapon ? { slug: weapon.slug, tier: weaponTier } : null,
          amulet: amulet ? { slug: amulet.slug, tier: amuletTier } : null,
          sets: setPicks,
          roguesCharm: talismanOn,
          ee: ee && eeOwned ? { level: eeLevel } : null,
          stats: statVals,
          hpPct,
        }
      : null,
    target:
      targetTab === 'manual'
        ? { manual: { element: tgtElement, stats: tgtStats, boss: tgtBoss, hpPct: tgtHpPct } }
        : target
          ? {
              id: target.id,
              mode: target.mode,
              spawn: spawn ? { label: spawn.label, level: spawn.level, stats: spawn.stats } : null,
              hpPct: tgtHpPct,
            }
          : null,
    context: { targetsHit, attackerFx: atkFx, targetFx: tgtFx },
    team: allies
      .filter((a) => a.id)
      .map((a) => ({
        id: a.id,
        transcend: chars.find((c) => c.id === a.id)?.transcend[a.transcend]?.label ?? null,
        talisman: a.talisman ? { main: a.talisman, lv: a.talismanLv } : null,
        ee: a.id && ees[a.id] ? { owned: a.ee, plus10: a.eePlus } : null,
      })),
    quirks: Object.fromEntries(Object.entries(quirkLvls).filter(([, v]) => v > 0)),
  };

  return (
    <div className="mx-auto w-full max-w-400 space-y-4">
      {/* Bandeau : le moteur n'est PAS branché — l'UI est la seule chose livrée. */}
      <div className="border-warn/30 bg-warn/10 text-warn rounded-lg border px-4 py-2.5 text-center text-sm">
        {L.report.wip}
      </div>

      {/* Onglets : le calculateur, et le réglage de COMPTE (quirks) à côté. */}
      <div className="border-line-subtle bg-surface-sunken/70 mx-auto grid w-full max-w-md grid-cols-2 gap-1 rounded-lg border p-1">
        {(['calc', 'settings'] as const).map((tb) => (
          <button
            key={tb}
            type="button"
            className={`h-8 cursor-pointer rounded-md text-xs font-bold transition ${
              tab === tb ? 'bg-accent text-surface-base' : 'text-content-muted hover:text-content'
            }`}
            onClick={() => setTab(tb)}
          >
            {tb === 'calc' ? L.title : L.settings.title}
          </button>
        ))}
      </div>

      {tab === 'settings' && (
        <div className="mx-auto w-full max-w-3xl space-y-4">
          <p className="text-content-subtle text-center text-xs">{L.settings.subtitle}</p>
          {/* Tout à 0 / tout au max — réglage de COMPTE, pas de scénario. */}
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setQuirkLvls({})}
              className="border-line-subtle text-content-subtle hover:text-content h-8 cursor-pointer rounded-lg border border-dashed px-3 text-xs"
            >
              {L.settings.reset}
            </button>
            <button
              type="button"
              onClick={() =>
                setQuirkLvls(
                  Object.fromEntries(quirks.flatMap((g) => g.nodes.map((n) => [n.id, n.maxLevel]))),
                )
              }
              className="border-line-subtle text-content-subtle hover:text-content h-8 cursor-pointer rounded-lg border border-dashed px-3 text-xs"
            >
              {L.settings.activateAll}
            </button>
          </div>
          {quirks.map((g) => (
            <Card key={g.key} title={g.label}>
              <div className="space-y-1.5">
                {g.nodes.map((n) => {
                  const lvl = Math.max(0, Math.min(quirkLvls[n.id] ?? 0, n.maxLevel));
                  return (
                    <div
                      key={n.id}
                      className={`border-line-subtle bg-surface-sunken/70 flex items-center gap-2.5 rounded-lg border px-2.5 py-2 ${lvl ? '' : 'opacity-60'}`}
                    >
                      <span
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                        style={{
                          background: `radial-gradient(circle, color-mix(in srgb, ${n.color} 22%, #0b0e14) 0%, #0b0e14 78%)`,
                          border: `2px solid ${n.color}`,
                        }}
                      >
                        <img src={n.iconSrc} alt="" className="h-4.5 w-4.5" draggable={false} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-content truncate text-xs font-semibold">{n.name}</p>
                        {/* À 0 : aperçu de l'effet Lv1 (le nœud dit ce qu'il ferait). */}
                        <GameText
                          text={n.texts[Math.max(1, lvl) - 1] ?? ''}
                          className="text-content-muted text-[11px] leading-relaxed whitespace-pre-line"
                        />
                      </div>
                      <Stepper
                        value={lvl}
                        min={0}
                        max={n.maxLevel}
                        onChange={(v) => setQuirkLvls((prev) => ({ ...prev, [n.id]: v }))}
                        format={(v) => `${v}/${n.maxLevel}`}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'calc' && (
        // Reset du scénario + partage : l'URL EST l'état (Sevih 27/07/2026).
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={resetScenario}
            className="border-line-subtle text-content-subtle hover:text-content h-7 cursor-pointer rounded-lg border border-dashed px-3 text-xs"
          >
            {L.toolbar.reset}
          </button>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(window.location.href).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              });
            }}
            className="border-line-subtle text-content-subtle hover:text-content h-7 cursor-pointer rounded-lg border border-dashed px-3 text-xs"
          >
            {copied ? L.toolbar.copied : L.toolbar.copy}
          </button>
        </div>
      )}

      {tab === 'calc' && (
        <div className="grid items-start gap-4 xl:grid-cols-[7fr_6fr_12fr]">
          {/* ═══ COLONNE 1 — ATTAQUANT ═══ */}
          <div className="min-w-0 space-y-4">
            <Card title={L.panels.attacker}>
              <CharPicker
                chars={chars}
                value={attackerId}
                onPick={pickAttacker}
                onClear={() => setAttackerId(null)}
                placeholder={L.pick}
                labels={L}
                aside={
                  // Transcendance : les PALIERS RÉELS du perso, même slider que
                  // la fiche (demande Sevih 27/07/2026), logé sous le nom.
                  attacker && attacker.transcend.length > 0 ? (
                    <TranscendSlider
                      tiers={attacker.transcend}
                      idx={transcend}
                      onIdx={setTranscend}
                    />
                  ) : undefined
                }
              />
            </Card>

            {/* Ordre de la colonne (Sevih 27/07/2026) : perso → stats → skills
              → équipement. */}
            {attacker && (
              <Card
                title={L.stats.title}
                right={<span className="text-content-subtle text-[10px]">{L.stats.sheetNote}</span>}
              >
                <div className="grid grid-cols-2 gap-2">
                  {sheetFields.map((f) => (
                    <label key={f.key} className="min-w-0 space-y-1">
                      <span className="text-content-subtle block truncate font-mono text-[9px] tracking-wide uppercase">
                        {f.label}
                      </span>
                      <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-8 w-full min-w-0 items-center gap-1 rounded-lg border px-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={statVals[f.key] ?? ''}
                          onChange={(e) => setStatVals((s) => ({ ...s, [f.key]: e.target.value }))}
                          className="text-content w-full min-w-0 flex-1 bg-transparent font-mono text-sm font-bold tabular-nums outline-none"
                        />
                        {f.percent && <span className="text-content-subtle text-xs">%</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </Card>
            )}

            {attacker && (
              <Card title={L.skills.title}>
                {/* Niveaux de skill indépendants (chain/dual hors périmètre),
                  en COLONNES : slot / icône / tag / niveau, côte à côte. */}
                <div className="grid grid-cols-3 gap-1.5">
                  {kit.map((row) => (
                    <div
                      key={row.slot}
                      className={`${wellClass} flex flex-col items-center gap-1.5 px-1 py-2`}
                      title={row.name}
                    >
                      <span className="text-content-subtle font-mono text-[10px] font-bold">
                        {row.slot}
                      </span>
                      {row.iconSrc ? (
                        <img
                          src={row.iconSrc}
                          alt={row.name}
                          className="h-9 w-9 rounded-lg"
                          loading="lazy"
                        />
                      ) : (
                        <span className="border-line-subtle bg-surface-raised/60 h-9 w-9 rounded-lg border" />
                      )}
                      <SkillTag offensive={row.offensive} labels={L} />
                      <Stepper
                        value={skillLvls[row.slot] ?? row.maxLevel}
                        min={1}
                        max={row.maxLevel}
                        onChange={(v) => setSkillLvls((s) => ({ ...s, [row.slot]: v }))}
                        format={(v) => `Lv ${v}`}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {attacker && (
              <Card title={L.equipment.title}>
                {/* 6 cases (Sevih 27/07/2026) : arme / accessoire, set 1 / set 2,
                  EE / talisman. Sets de COMBAT seuls (les sets de stats sont
                  dans la fiche). */}
                <div className="grid gap-1.5 sm:grid-cols-2">
                  <GearSlot
                    title={L.equipment.weapon}
                    placeholder={L.equipment.pickWeapon}
                    options={pickableWeapons}
                    value={weapon}
                    tier={weaponTier}
                    attackerCls={attacker.cls}
                    onPick={(slug) => {
                      setWeaponSlug(slug);
                      setWeaponTier(0);
                    }}
                    onClear={() => setWeaponSlug(null)}
                    onTier={setWeaponTier}
                    labels={L}
                  />
                  <GearSlot
                    title={L.equipment.accessory}
                    placeholder={L.equipment.pickAccessory}
                    options={pickableAmulets}
                    value={amulet}
                    tier={amuletTier}
                    attackerCls={attacker.cls}
                    onPick={(slug) => {
                      setAmuletSlug(slug);
                      setAmuletTier(0);
                    }}
                    onClear={() => setAmuletSlug(null)}
                    onTier={setAmuletTier}
                    labels={L}
                  />

                  <SetsSlot sets={sets} picks={setPicks} onChange={setSetPicks} labels={L} />

                  <div className={`${wellClass} space-y-1.5 p-2`}>
                    <div className="flex items-center gap-2">
                      <Eyebrow>{L.equipment.ee}</Eyebrow>
                      <span className="flex-1" />
                      {/* Le niveau ne sert qu'aux mains « dégâts vs élément »
                        (les autres mains sont déjà dans la fiche saisie). */}
                      {eeOwned && ee?.dmgMain && (
                        <Stepper
                          value={eeLevel}
                          min={0}
                          max={10}
                          onChange={setEeLevel}
                          format={(v) => `+${v}`}
                        />
                      )}
                    </div>
                    {ee ? (
                      <>
                        {/* Même motif que le talisman : checkbox « possédé »
                          (+0 ≠ absent : le passif Lv0 s'applique dès qu'on le
                          porte), en-tête icône + nom, puis les descriptions en
                          PLEINE LARGEUR de la case (demande Sevih 27/07/2026). */}
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={eeOwned}
                            onChange={() => setEeOwned(!eeOwned)}
                            className="accent-accent h-3.5 w-3.5 cursor-pointer"
                          />
                          <EquipmentIcon src={ee.src} grade={ee.grade} size={34} />
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-semibold wrap-break-word ${eeOwned ? 'text-content' : 'text-content-subtle'}`}
                            >
                              {ee.name}
                            </p>
                            {eeOwned && ee.dmgMain && (
                              <p className="text-accent font-mono text-[11px] font-bold tabular-nums">
                                {ee.dmgMain.label} +{(ee.dmgMain.levels[eeLevel] ?? 0) / 10}%
                              </p>
                            )}
                          </div>
                        </label>
                        {/* Un palier par ligne : Lv0 / Lv10 SÉPARÉS (le palier
                          +10 remplace le précédent), « + » quand il s'AJOUTE. */}
                        {ee.rows.map((row, i) => (
                          <div
                            key={i}
                            className={`flex items-start gap-1.5 ${eeOwned ? '' : 'opacity-60'}`}
                          >
                            <span className="border-line-subtle text-accent mt-0.5 rounded border px-1 font-mono text-[9px] font-bold whitespace-nowrap">
                              {row.isAdd ? '+' : ''}
                              {row.level >= 10 ? L.equipment.lv10 : L.equipment.lv0}
                            </span>
                            <GameText
                              text={row.html}
                              className={`min-w-0 flex-1 text-[11px] leading-relaxed whitespace-pre-line ${eeOwned ? 'text-content-muted' : 'text-content-subtle'}`}
                            />
                          </div>
                        ))}
                      </>
                    ) : (
                      <p className="text-content-subtle text-[11px]">{L.equipment.eeNone}</p>
                    )}
                  </div>

                  {/* Rogue's Charm : une CASE À COCHER — équipé au +10 ou non
                    (seul son passif +10, dégâts sur cible break, compte). */}
                  <div className={`${wellClass} space-y-1 p-2`}>
                    <Eyebrow>{L.equipment.talisman}</Eyebrow>
                    {talisman && (
                      <>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={talismanOn}
                            onChange={() => setTalismanOn(!talismanOn)}
                            className="accent-accent h-3.5 w-3.5 cursor-pointer"
                          />
                          <EquipmentIcon
                            icon={talisman.icon}
                            grade={talisman.grade}
                            size={34}
                            stars={talisman.star}
                            overlayIcon={talisman.overlayIcon}
                          />
                          <span
                            className={`min-w-0 text-xs font-semibold wrap-break-word ${talismanOn ? 'text-content' : 'text-content-subtle'}`}
                          >
                            {talisman.label} +10
                          </span>
                        </label>
                        {talisman.text && (
                          <GameText
                            text={talisman.text}
                            className={`text-[11px] leading-relaxed whitespace-pre-line ${talismanOn ? 'text-content-muted' : 'text-content-subtle opacity-60'}`}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* ═══ COLONNE 2 — CIBLE (et l'équipe sur le terrain) ═══ */}
          <div className="min-w-0 space-y-4">
            <Card title={L.panels.target}>
              {/* Preset (donjon réel) OU saisie manuelle (Sevih 27/07/2026). */}
              <div className="border-line-subtle bg-surface-sunken/70 grid grid-cols-2 gap-1 rounded-lg border p-1">
                {(['preset', 'manual'] as const).map((tb) => (
                  <button
                    key={tb}
                    type="button"
                    className={`h-7 cursor-pointer rounded-md text-xs font-bold transition ${
                      targetTab === tb
                        ? 'bg-accent text-surface-base'
                        : 'text-content-muted hover:text-content'
                    }`}
                    onClick={() => setTargetTab(tb)}
                  >
                    {tb === 'preset' ? L.target.preset : L.target.manual}
                  </button>
                ))}
              </div>

              {targetTab === 'preset' ? (
                <div className="space-y-2">
                  <TargetPicker
                    targets={targets}
                    modes={modes}
                    value={target}
                    level={spawn?.level}
                    onPick={(id) => {
                      setTargetId(id);
                      setSpawnIdx(0);
                    }}
                    onClear={() => setTargetId(null)}
                    labels={L}
                  />

                  {target && (
                    <>
                      {target.spawns.length > 1 && (
                        <label className="block space-y-1">
                          <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                            {L.target.stage}
                          </span>
                          <select
                            value={spawnIdx}
                            onChange={(e) => setSpawnIdx(Number(e.target.value))}
                            className={SELECT_CLASS}
                          >
                            {target.spawns.map((s, i) => (
                              <option key={i} value={i}>
                                {s.label || vars(L.target.fight, { n: i + 1 })} · {L.target.lv}{' '}
                                {s.level}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      {spawn && (
                        // Stats défensives EFFECTIVES du spawn (adv/bossHp déjà
                        // appliqués) — celles qui pèsent sur les dégâts, en
                        // clair et SANS troncature (demande Sevih 27/07/2026).
                        <div className="grid grid-cols-2 gap-1.5">
                          {targetStatFields.map((f) => (
                            <div key={f.key} className={`${wellClass} min-w-0 px-2.5 py-1.5`}>
                              <span className="text-content-subtle block font-mono text-[9px] tracking-wide uppercase">
                                {f.label}
                              </span>
                              <span className="text-content block font-mono text-sm font-bold tabular-nums">
                                {f.percent
                                  ? `${spawn.stats[f.key as keyof DcSpawn['stats']] / 10}%`
                                  : spawn.stats[f.key as keyof DcSpawn['stats']].toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="text-content-subtle block font-mono text-[9px] tracking-wide uppercase">
                      {L.target.element}
                    </span>
                    <div className="flex gap-1.5">
                      {ELEMENT_ORDER.map((el) => (
                        <FilterPill
                          key={el}
                          active={tgtElement === el}
                          onClick={() => setTgtElement(tgtElement === el ? null : el)}
                          className="h-8 w-8 px-0"
                          title={el}
                        >
                          <img
                            src={img.element(el)}
                            alt={el}
                            className="h-5 w-5"
                            width={20}
                            height={20}
                          />
                        </FilterPill>
                      ))}
                    </div>
                  </div>

                  {/* Conditionnels « vs boss » — les presets sont TOUS des
                    boss, en manuel il faut le dire (Sevih 27/07/2026). */}
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tgtBoss}
                      onChange={() => setTgtBoss(!tgtBoss)}
                      className="accent-accent h-3.5 w-3.5 cursor-pointer"
                    />
                    <span className="text-content-muted text-xs">{L.target.bossFlag}</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {targetStatFields.map((f) => (
                      <label key={f.key} className="min-w-0 space-y-1">
                        <span className="text-content-subtle block truncate font-mono text-[9px] tracking-wide uppercase">
                          {f.label}
                        </span>
                        <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-8 w-full min-w-0 items-center gap-1 rounded-lg border px-2">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={tgtStats[f.key] ?? ''}
                            onChange={(e) =>
                              setTgtStats((s) => ({ ...s, [f.key]: e.target.value }))
                            }
                            className="text-content w-full min-w-0 flex-1 bg-transparent font-mono text-sm font-bold tabular-nums outline-none"
                          />
                          {f.percent && <span className="text-content-subtle text-xs">%</span>}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Pré-remplit depuis le preset sélectionné (spawn courant). */}
                  <button
                    type="button"
                    disabled={!spawn}
                    onClick={() => {
                      if (!spawn || !target) return;
                      setTgtElement(target.element);
                      setTgtStats(
                        Object.fromEntries(
                          targetStatFields.map((f) => {
                            const v = spawn.stats[f.key as keyof DcSpawn['stats']];
                            return [f.key, String(f.percent ? v / 10 : v)];
                          }),
                        ),
                      );
                    }}
                    className="border-line-subtle text-content-subtle not-disabled:hover:text-content h-8 w-full rounded-lg border border-dashed text-xs not-disabled:cursor-pointer disabled:opacity-40"
                  >
                    {L.target.copyFromSelected}
                  </button>
                </div>
              )}
            </Card>

            <Card
              title={L.panels.team}
              right={<span className="text-content-subtle font-mono text-[9px]">1 + 3</span>}
            >
              <div className="space-y-1.5">
                {/* Par allié : perso + transcendance + main stat du talisman
                  porté — les trois pèsent sur le rapport (Sevih 27/07/2026). */}
                {allies.map((ally, i) => {
                  const patch = (p: Partial<AllyPick>) =>
                    setAllies((all) => all.map((a, j) => (j === i ? { ...a, ...p } : a)));
                  const allyChar = ally.id ? chars.find((c) => c.id === ally.id) : undefined;
                  return (
                    <div key={i} className={ally.id ? `${wellClass} space-y-1.5 p-2` : undefined}>
                      <CharPicker
                        chars={chars.filter(
                          (c) =>
                            c.id !== attackerId && !allies.some((a, j) => j !== i && a.id === c.id),
                        )}
                        value={ally.id}
                        onPick={(id) =>
                          patch({
                            id,
                            // Palier max du perso choisi par défaut.
                            transcend: (chars.find((c) => c.id === id)?.transcend.length ?? 1) - 1,
                          })
                        }
                        onClear={() => patch({ id: null })}
                        placeholder={vars(L.team.emptySlot, { n: i + 2 })}
                        labels={L}
                        aside={
                          allyChar && allyChar.transcend.length > 0 ? (
                            <TranscendSlider
                              tiers={allyChar.transcend}
                              idx={ally.transcend}
                              onIdx={(v) => patch({ transcend: v })}
                            />
                          ) : undefined
                        }
                      />
                      {allyChar && (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={ally.talisman ?? ''}
                            onChange={(e) => patch({ talisman: e.target.value || null })}
                            className={`${SELECT_CLASS} min-w-0 flex-7`}
                            title={L.equipment.talisman}
                          >
                            <option value="">{L.equipment.talisman}</option>
                            {talismanMains.map((m) => (
                              <option key={m.key} value={m.key}>
                                {m.label}
                              </option>
                            ))}
                          </select>
                          {/* Enhancement +0…+10 : le montant de la main stat en
                            dépend (Sevih 27/07/2026). */}
                          {ally.talisman && (
                            <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-8 min-w-0 flex-3 items-center gap-0.5 rounded-lg border px-1.5">
                              <span className="text-content-subtle text-xs">+</span>
                              <input
                                type="number"
                                min={0}
                                max={10}
                                value={ally.talismanLv}
                                onChange={(e) =>
                                  patch({
                                    talismanLv: Math.min(
                                      Math.max(Math.trunc(Number(e.target.value) || 0), 0),
                                      10,
                                    ),
                                  })
                                }
                                className="text-content w-full min-w-0 flex-1 bg-transparent text-right font-mono text-xs font-bold tabular-nums outline-none"
                              />
                            </span>
                          )}
                        </div>
                      )}
                      {/* EE possédé / +10 : certains EE portent sur l'équipe
                        (Sevih 27/07/2026) — seulement si le perso en a un. */}
                      {allyChar && ees[allyChar.id] && (
                        <div className="flex items-center gap-4 px-0.5">
                          <label className="flex cursor-pointer items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={ally.ee}
                              onChange={() =>
                                patch(ally.ee ? { ee: false, eePlus: false } : { ee: true })
                              }
                              className="accent-accent h-3.5 w-3.5 cursor-pointer"
                            />
                            <span className="text-content-muted text-xs">{L.team.eeOwned}</span>
                          </label>
                          <label
                            className={`flex items-center gap-1.5 ${ally.ee ? 'cursor-pointer' : 'opacity-40'}`}
                          >
                            <input
                              type="checkbox"
                              checked={ally.eePlus}
                              disabled={!ally.ee}
                              onChange={() => patch({ eePlus: !ally.eePlus })}
                              className="accent-accent h-3.5 w-3.5 not-disabled:cursor-pointer"
                            />
                            <span className="text-content-muted text-xs">{L.team.eePlus}</span>
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* ═══ COLONNE 3 — RÉGLAGES (méca + buffs), puis RAPPORT dessous
            (disposition Sevih 27/07/2026 : Attaquant / Cible / Réglages, le
            résultat sous les réglages). ═══ */}
          <div className="min-w-0 space-y-4">
            {/* CONTEXTE = tout ce qui entoure le combat (fusion Sevih
              27/07/2026) : cibles touchées + buffs/débuffs de scénario. Le
              type de contenu se déduit du preset, le PvP est hors périmètre. */}
            <Card
              title={L.context.title}
              right={
                <span className="text-content-subtle font-mono text-[9px]">
                  {atkFx.length + tgtFx.length}
                </span>
              }
            >
              {/* Les buffs STANDARDISÉS du jeu, à bascule — seulement ceux qui
                pèsent sur les dégâts, filtrés comme la saisie des stats.
                DEUX colonnes avec portrait — l'attaquant et la cible — chacune
                avec ses buffs puis ses débuffs ; rien ne s'affiche tant que les
                deux combattants ne sont pas choisis (Sevih 27/07/2026). */}
              {!attacker || !targetReady ? (
                <p className="text-content-subtle px-2 py-6 text-center text-xs">
                  {L.buffs.awaitPick}
                </p>
              ) : (
                <>
                  {/* PV actuels des deux combattants — c'est du CONTEXTE (Sevih
                    27/07/2026) : sets « missing Health » côté attaquant, skills
                    sur PV max/actuels/manquants côté cible. */}
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { label: L.context.attackerHp, value: hpPct, set: setHpPct },
                        { label: L.context.targetHp, value: tgtHpPct, set: setTgtHpPct },
                      ] as const
                    ).map((f) => (
                      <label key={f.label} className="min-w-0 space-y-1">
                        <span className="text-content-subtle block truncate font-mono text-[9px] tracking-wide uppercase">
                          {f.label}
                        </span>
                        <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-8 w-full min-w-0 items-center gap-1 rounded-lg border px-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={f.value}
                            onChange={(e) => f.set(e.target.value)}
                            className="text-content w-full min-w-0 flex-1 bg-transparent font-mono text-sm font-bold tabular-nums outline-none"
                          />
                          <span className="text-content-subtle text-xs">%</span>
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Cibles touchées : SEULEMENT si le kit a un skill offensif
                    multi-cible — la décroissance AoE ne concerne pas les kits
                    mono-cible (décision Sevih 27/07/2026). */}
                  {offensiveSkills.some((s) => s.aoe) && (
                    <div className="space-y-1">
                      <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                        {L.context.targetsHit}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={`h-7 flex-1 cursor-pointer rounded-md border font-mono text-xs font-bold transition ${
                              targetsHit === n
                                ? 'border-accent bg-accent/15 text-accent'
                                : 'border-line-subtle bg-surface-sunken/70 text-content-subtle hover:text-content'
                            }`}
                            onClick={() => setTargetsHit(n)}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2 sm:grid-cols-2">
                    {(
                      [
                        {
                          key: 'atk',
                          portrait: (
                            <span className="relative h-16 w-16 shrink-0">
                              <img
                                src={img.face(attacker.id)}
                                alt=""
                                className="border-line-subtle h-full w-full rounded-lg border"
                                loading="lazy"
                              />
                              <TileOverlays element={attacker.element} cls={attacker.cls} />
                            </span>
                          ),
                          name: attacker.label,
                          groups: [
                            { title: L.buffs.atkBuff, options: buffOptions.atkBuff },
                            { title: L.buffs.atkDebuff, options: buffOptions.atkDebuff },
                          ],
                          on: atkFx,
                          set: setAtkFx,
                        },
                        {
                          key: 'tgt',
                          portrait: target ? (
                            <span className="relative h-16 w-16 shrink-0">
                              <img
                                src={target.iconSrc}
                                alt=""
                                className="border-line-subtle h-full w-full rounded-lg border object-cover"
                                loading="lazy"
                              />
                              <TileOverlays
                                element={target.element}
                                cls={target.cls}
                                boss
                                level={spawn?.level}
                              />
                            </span>
                          ) : tgtElement ? (
                            <span className="border-line-subtle grid h-16 w-16 shrink-0 place-items-center rounded-lg border">
                              <img
                                src={img.element(tgtElement)}
                                alt={tgtElement}
                                className="h-8 w-8"
                              />
                            </span>
                          ) : (
                            <span className="border-line-subtle text-content-subtle grid h-16 w-16 shrink-0 place-items-center rounded-lg border text-lg font-bold">
                              ?
                            </span>
                          ),
                          name: target ? target.name : L.target.manual,
                          groups: [
                            { title: L.buffs.tgtBuff, options: buffOptions.tgtBuff },
                            { title: L.buffs.tgtDebuff, options: buffOptions.tgtDebuff },
                          ],
                          on: tgtFx,
                          set: setTgtFx,
                        },
                      ] as const
                    ).map((side) => (
                      <div key={side.key} className={`${wellClass} space-y-2 p-2.5`}>
                        <div className="flex items-center gap-2">
                          {side.portrait}
                          <span className="text-content min-w-0 text-xs font-semibold wrap-break-word">
                            {side.name}
                          </span>
                        </div>
                        {side.groups.map((group) => (
                          <div key={group.title} className="space-y-1">
                            <Eyebrow>{group.title}</Eyebrow>
                            <div className="flex flex-wrap gap-1.5">
                              {relevantFx(group.options).map((o) => {
                                const on = side.on.includes(o.key);
                                return (
                                  <button
                                    key={o.key}
                                    type="button"
                                    aria-pressed={on}
                                    title={o.desc}
                                    onClick={() => toggleFx(side.set, o.key)}
                                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition ${
                                      on
                                        ? o.debuff
                                          ? 'border-danger bg-danger/10 text-content'
                                          : 'border-accent bg-accent/10 text-content'
                                        : 'border-line-subtle bg-surface-raised/70 text-content-muted hover:text-content'
                                    }`}
                                  >
                                    <EffectIconTile
                                      icon={o.icon}
                                      isDebuff={o.debuff}
                                      className="h-5 w-5"
                                    />
                                    <span>{o.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled
                    className="border-line-subtle text-content-subtle h-8 w-full cursor-not-allowed rounded-lg border border-dashed text-xs"
                    title={L.buffs.kitsSoon}
                  >
                    {L.buffs.fromKits} · {L.buffs.kitsSoon}
                  </button>

                  {/* Stats FINALES des deux combattants — SORTIE du moteur
                    (buffs & co appliqués), pas branchée en phase UI. C'est du
                    contexte, comme les PV actuels (Sevih 27/07/2026). */}
                  <div className={`${wellClass} space-y-1.5 p-2.5`}>
                    <div className="flex items-baseline gap-2">
                      <span className="text-accent font-mono text-[10px] font-bold tracking-wide uppercase">
                        {L.stats.final}
                      </span>
                      <span className="text-content-subtle text-[10px]">{L.stats.finalNote}</span>
                    </div>
                    <div className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
                      {(
                        [
                          { title: L.panels.attacker, fields: sheetFields },
                          { title: L.panels.target, fields: targetStatFields },
                        ] as const
                      ).map((col) => (
                        <div key={col.title} className="min-w-0 space-y-0.5">
                          <span className="text-content-subtle block font-mono text-[9px] tracking-wide uppercase">
                            {col.title}
                          </span>
                          {col.fields.map((f) => (
                            <span key={f.key} className="flex items-baseline gap-2 text-[11px]">
                              <span className="text-content-subtle truncate">{f.label}</span>
                              <span className="flex-1" />
                              <span className="text-content-muted font-mono font-bold tabular-nums">
                                —
                              </span>
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>

            <div className="flex items-center gap-2">
              <Eyebrow>{L.panels.result}</Eyebrow>
              <span className="text-content-subtle font-mono text-[10px]">
                {L.report.branchesNote}
              </span>
            </div>

            {!attacker ? (
              <div className="border-line-subtle bg-surface-raised/40 text-content-subtle rounded-xl border px-4 py-10 text-center text-sm">
                {L.report.empty}
              </div>
            ) : (
              <>
                {/* Table COMPACTE (Sevih 27/07/2026) : une ligne par skill
                  offensif, trois colonnes de branches — rien de plus. */}
                <div className="border-line bg-surface-raised/60 overflow-hidden rounded-xl border">
                  <div className="bg-line-subtle grid grid-cols-[auto_1fr_1fr_1fr] gap-px">
                    <div className="bg-surface-sunken/60 px-3 py-2" />
                    {[L.report.normal, L.report.critical, L.report.miss].map((branch, i) => (
                      <div
                        key={branch}
                        className={`bg-surface-sunken/60 grid place-items-center px-2 py-2 text-center font-mono text-[9px] tracking-wide uppercase ${
                          i === 1 ? 'text-warn' : 'text-content-subtle'
                        }`}
                      >
                        {branch}
                      </div>
                    ))}
                    {offensiveSkills.map((sk) => (
                      <Fragment key={sk.slot}>
                        <div
                          className="bg-surface-raised/80 flex items-center gap-2 px-3 py-1.5"
                          title={sk.name}
                        >
                          {sk.iconSrc ? (
                            <img
                              src={sk.iconSrc}
                              alt=""
                              className="h-7 w-7 rounded-md"
                              loading="lazy"
                            />
                          ) : (
                            <span className="border-line-subtle bg-surface-sunken/70 h-7 w-7 rounded-md border" />
                          )}
                          <span className="text-content-subtle font-mono text-[10px] font-bold">
                            {sk.slot}
                          </span>
                        </div>
                        {[0, 1, 2].map((b) => (
                          <div
                            key={b}
                            className="bg-surface-raised/80 grid place-items-center px-2 py-1.5"
                          >
                            <span className="text-content-muted font-mono text-sm font-bold tabular-nums">
                              —
                            </span>
                          </div>
                        ))}
                      </Fragment>
                    ))}
                  </div>
                </div>

                {supportSkills.length > 0 && (
                  <p className="text-content-subtle text-center text-[11px]">
                    {vars(L.report.supportSkills, {
                      names: supportSkills.map((s) => s.name).join(', '),
                    })}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* DEV ONLY (Sevih 27/07/2026) — maquette Claude Design implémentée,
        spec docs/specs/damage-debug-harness.md ; libellés en dur (§ 5). */}
      {tab === 'calc' && process.env.NODE_ENV !== 'production' && (
        <DebugHarness
          state={debugState}
          skills={offensiveSkills.map((s) => ({ slot: s.slot, name: s.name }))}
        />
      )}
    </div>
  );
}

// ── Sous-composants dépendant des types ci-dessus ──────────────────────────

/** Slot d'arme/accessoire : picker + breakthrough T0–T4 + texte du passif
 *  (variante de CLASSE de l'attaquant quand la famille en a). */
function GearSlot({
  title,
  placeholder,
  options,
  value,
  tier,
  attackerCls,
  onPick,
  onClear,
  onTier,
  labels,
}: {
  title: string;
  placeholder: string;
  options: DcGear[];
  value: DcGear | undefined;
  tier: number;
  attackerCls: string;
  onPick: (slug: string) => void;
  onClear: () => void;
  onTier: (v: number) => void;
  labels: DcLabels;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  const tiers = value ? (value.classTiers?.[attackerCls] ?? value.tiers) : undefined;
  const close = () => {
    setOpen(false);
    setSearch('');
  };
  return (
    <div className="border-line-subtle bg-surface-sunken/70 space-y-1.5 rounded-lg border p-2">
      <div className="flex items-center gap-2">
        <Eyebrow>{title}</Eyebrow>
        <span className="flex-1" />
        {value && (
          <>
            <Stepper value={tier} min={0} max={4} onChange={onTier} format={(v) => `T${v}`} />
            <button
              type="button"
              className="text-content-subtle hover:text-danger cursor-pointer text-xs"
              onClick={onClear}
              title={labels.clear}
            >
              ✕
            </button>
          </>
        )}
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <SlotTile onClick={() => setOpen(true)} title={value?.label ?? placeholder}>
          {value ? (
            <EquipmentIcon
              icon={value.icon}
              grade={value.grade}
              size={44}
              stars={value.star}
              overlayIcon={value.overlayIcon}
              classType={gearClassOf(value, attackerCls)}
            />
          ) : null}
        </SlotTile>
        <span
          className={`min-w-0 text-xs wrap-break-word ${value ? 'text-content font-semibold' : 'text-content-subtle'}`}
        >
          {value ? value.label : placeholder}
        </span>
      </div>
      <Modal open={open} onClose={close} title={placeholder}>
        <SearchField value={search} onChange={setSearch} placeholder={labels.search} />
        {filtered.length ? (
          <GearGrid
            items={filtered.map((o) => ({
              key: o.slug,
              icon: o.icon,
              grade: o.grade,
              label: o.label,
              star: o.star,
              overlayIcon: o.overlayIcon,
              classType: gearClassOf(o, attackerCls),
              selected: o.slug === value?.slug,
            }))}
            onPick={(slug) => {
              onPick(slug);
              close();
            }}
          />
        ) : (
          <NoMatches label={labels.noMatches} />
        )}
      </Modal>
      {value && tiers && (
        <GameText
          text={tiers[tier] || labels.equipment.noPassive}
          className="text-content-muted text-[11px] leading-relaxed whitespace-pre-line"
        />
      )}
    </div>
  );
}

/** Grille de tuiles d'équipement d'une modale (tuile « comme partout » :
 *  cadre de grade + étoiles + icône d'effet + classe — façon pool). */
function GearGrid({
  items,
  onPick,
}: {
  items: {
    key: string;
    icon: string;
    grade: string;
    label: string;
    star?: number;
    overlayIcon?: string;
    classType?: string;
    selected?: boolean;
    /** Choix neutralisé (ex. duo de sets déjà complet). */
    disabled?: boolean;
  }[];
  onPick: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-1.5">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          disabled={it.disabled}
          className="group flex flex-col items-center gap-1 not-disabled:cursor-pointer disabled:opacity-40"
          title={it.label}
          onClick={() => onPick(it.key)}
        >
          <span
            className={`group-hover:border-accent rounded-lg border transition ${
              it.selected ? 'border-accent' : 'border-transparent'
            }`}
          >
            {it.grade ? (
              <EquipmentIcon
                icon={it.icon}
                grade={it.grade}
                size={56}
                stars={it.star}
                overlayIcon={it.overlayIcon}
                classType={it.classType}
              />
            ) : (
              <img
                src={img.equipment(it.icon)}
                alt=""
                className="h-14 w-14"
                loading="lazy"
                width={56}
                height={56}
              />
            )}
          </span>
          <span className="text-content-muted group-hover:text-content w-full text-center text-[10px] leading-tight wrap-break-word">
            {it.label}
          </span>
        </button>
      ))}
    </div>
  );
}

/** Icône de classe d'une tuile d'arme/accessoire : restriction unique, ou la
 *  classe de l'ATTAQUANT quand la famille varie par classe (Briareos/Gorgon). */
function gearClassOf(o: DcGear, attackerCls: string): string | undefined {
  if (o.classLimits.length === 1) return o.classLimits[0];
  return o.classTiers ? attackerCls : undefined;
}

/** Un set n'est appariable que s'il a un bonus 2P (Revenge/Patience : 4P seul). */
const has2P = (s: DcSet) => s.p2.some(Boolean);
const has4P = (s: DcSet) => s.p4.some(Boolean);

/**
 * Case UNIQUE des sets, SANS modale : les icônes des sets de combat sont
 * toutes affichées — cliquer valide/retire un set, et ce qui n'est plus
 * combinable se grise. 4 pièces d'armure au total : un duo n'est possible
 * qu'entre sets à bonus 2P (2P+2P) ; un set 4P-only (Revenge, Patience)
 * occupe tout et reste seul — jamais 4P+2P ni 4P+4P (décision Sevih
 * 27/07/2026). Le bonus est DÉRIVÉ : duo → 2P chacun ; seul → 4P si le set en
 * a un, sinon son 2P.
 */
function SetsSlot({
  sets,
  picks,
  onChange,
  labels,
}: {
  sets: DcSet[];
  picks: SetPick[];
  onChange: (picks: SetPick[]) => void;
  labels: DcLabels;
}) {
  const first = picks.length === 1 ? sets.find((s) => s.id === picks[0].setId) : undefined;
  const piecesOf = (view: DcSet) =>
    picks.length === 2 || !has4P(view) ? ('2P' as const) : ('4P' as const);
  const pickable = (s: DcSet) => {
    if (picks.length >= 2) return false;
    if (!first) return true;
    return has2P(first) && has2P(s);
  };
  const toggle = (id: string) => {
    const has = picks.some((p) => p.setId === id);
    const view = sets.find((s) => s.id === id);
    if (!has && (!view || !pickable(view))) return;
    onChange(has ? picks.filter((p) => p.setId !== id) : [...picks, { setId: id, tier: 0 }]);
  };
  return (
    <div className="border-line-subtle bg-surface-sunken/70 space-y-1.5 rounded-lg border p-2 sm:col-span-2">
      <div className="flex items-center gap-2">
        <Eyebrow>{labels.equipment.sets}</Eyebrow>
        <span className="flex-1" />
        {picks.length > 0 && (
          <button
            type="button"
            className="text-content-subtle hover:text-danger cursor-pointer text-xs"
            onClick={() => onChange([])}
            title={labels.clear}
          >
            ✕
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sets.map((s) => {
          const on = picks.some((p) => p.setId === s.id);
          return (
            <button
              key={s.id}
              type="button"
              disabled={!on && !pickable(s)}
              aria-pressed={on}
              title={s.label}
              onClick={() => toggle(s.id)}
              className={`grid h-11 w-11 place-items-center rounded-lg border transition not-disabled:cursor-pointer disabled:opacity-40 ${
                on
                  ? 'border-accent bg-accent/10'
                  : 'border-line-subtle bg-surface-raised/60 hover:border-accent'
              }`}
            >
              <img src={img.equipment(s.icon)} alt={s.label} className="h-8 w-8" loading="lazy" />
            </button>
          );
        })}
      </div>
      {picks.length > 0 && (
        // Un set par LIGNE (pas côte à côte) : les textes d'effet respirent.
        <div className="space-y-1.5">
          {picks.map((pick, i) => {
            const view = sets.find((s) => s.id === pick.setId);
            if (!view) return null;
            const p = piecesOf(view);
            const stateIdx = pick.tier >= 4 ? 1 : 0;
            const effect =
              (p === '2P' ? view.p2[stateIdx] : view.p4[stateIdx]) ?? labels.equipment.noPassive;
            return (
              <div key={pick.setId} className="space-y-1">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-content min-w-0 flex-1 text-xs font-semibold wrap-break-word">
                    {view.label}
                  </span>
                  <span className="border-line-subtle text-accent rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold">
                    {p === '2P' ? labels.equipment.p2 : labels.equipment.p4}
                  </span>
                  <Stepper
                    value={pick.tier}
                    min={0}
                    max={4}
                    onChange={(v) =>
                      onChange(picks.map((p2, j) => (j === i ? { ...p2, tier: v } : p2)))
                    }
                    format={(v) => `T${v}`}
                  />
                </div>
                <GameText
                  text={effect}
                  className="text-content-muted text-[11px] leading-relaxed"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Picker de cible en MODALE, tout en SELECTS (demande Sevih 27/07/2026) :
 * mode → cascade portée par la donnée (`path` : Saison puis Épisode en
 * histoire, ligue de world boss, phase de guild raid, élément…) → liste des
 * entrées. Chaque niveau n'apparaît que si le mode le porte, et se vide quand
 * l'amont change. La recherche traverse la sélection courante.
 */
function TargetPicker({
  targets,
  modes,
  value,
  level,
  onPick,
  onClear,
  labels,
}: {
  targets: DcTarget[];
  modes: string[];
  value: DcTarget | undefined;
  /** Niveau du spawn RÉSOLU — affiché à droite du nom (Sevih 27/07/2026). */
  level?: number;
  onPick: (id: string) => void;
  onClear: () => void;
  labels: DcLabels;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('');
  const [path, setPath] = useState<string[]>([]);
  const inMode = useMemo(
    () => (mode ? targets.filter((tg) => tg.mode === mode) : targets),
    [targets, mode],
  );
  // Options de chaque niveau de cascade, dépendantes des choix amont : le
  // niveau i+1 ne se peuple qu'une fois le niveau i choisi.
  const levels: string[][] = [];
  if (mode) {
    let cascade = inMode;
    for (let i = 0; ; i++) {
      const seen = new Set<string>();
      const opts: string[] = [];
      for (const tg of cascade) {
        const v = tg.path?.[i];
        if (v && !seen.has(v)) {
          seen.add(v);
          opts.push(v);
        }
      }
      if (!opts.length) break;
      levels.push(opts);
      const sel = path[i];
      if (!sel) break;
      cascade = cascade.filter((tg) => tg.path?.[i] === sel);
    }
  }
  const q = search.trim().toLowerCase();
  const pool = inMode.filter((tg) => path.every((p, i) => !p || tg.path?.[i] === p));
  const filtered = q
    ? pool.filter((o) => o.label.toLowerCase().includes(q) || o.name.toLowerCase().includes(q))
    : pool;
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
          onClear={value ? onClear : undefined}
          clearTitle={labels.clear}
          title={value?.name ?? labels.select}
        >
          {value ? (
            <span className="relative block h-full w-full">
              <img
                src={value.iconSrc}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {/* Tous les presets ciblent un BOSS (role de la donnée). */}
              <TileOverlays element={value.element} cls={value.cls} boss level={level} />
            </span>
          ) : null}
        </SlotTile>
        {value ? (
          <span className="min-w-0 flex-1">
            <span className="text-content block text-sm font-semibold wrap-break-word">
              {value.name}
            </span>
            <span className="text-content-subtle block text-[11px] wrap-break-word">
              {[...(value.path ?? []), value.label].join(' · ')}
            </span>
          </span>
        ) : (
          <span className="text-content-subtle min-w-0 text-sm wrap-break-word">
            {labels.select}
          </span>
        )}
      </div>
      <Modal open={open} onClose={close} title={labels.panels.target}>
        <SearchField value={search} onChange={setSearch} placeholder={labels.search} />
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block space-y-1">
            <Eyebrow>{labels.target.mode}</Eyebrow>
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                setPath([]);
              }}
              className={SELECT_CLASS}
            >
              <option value="">{labels.target.all}</option>
              {modes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          {levels.map((opts, i) => (
            <label key={i} className="block space-y-1 self-end">
              <select
                value={path[i] ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setPath((prev) => {
                    const next = prev.slice(0, i);
                    if (v) next[i] = v;
                    return next;
                  });
                }}
                className={SELECT_CLASS}
              >
                <option value="">{labels.target.all}</option>
                {opts.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        {filtered.length ? (
          <div className="grid gap-0.5 sm:grid-cols-2">
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                className={ROW_CLASS}
                onClick={() => {
                  onPick(o.id);
                  close();
                }}
              >
                <img src={o.iconSrc} alt="" className="h-8 w-8 rounded" loading="lazy" />
                <span className="min-w-0 flex-col">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate font-semibold">{o.name}</span>
                    <img
                      src={img.element(o.element)}
                      alt={o.element}
                      className="h-3.5 w-3.5 shrink-0"
                    />
                  </span>
                  <span className="text-content-subtle block truncate text-[10px]">
                    {[mode ? null : o.mode, ...(o.path ?? []), o.label].filter(Boolean).join(' · ')}
                  </span>
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
