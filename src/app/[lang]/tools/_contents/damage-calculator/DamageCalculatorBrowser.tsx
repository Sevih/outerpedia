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

import { useMemo, useRef, useState, useEffect } from 'react';
import { img } from '@/lib/images';
import { useStoredState, type StoreSpec } from '@/lib/client-storage';
import { EquipmentIcon } from '@/components/equipment/EquipmentIcon';
import { SearchField } from '@/components/character/filters/FilterAtoms';
import { GameText } from '@/components/ui/GameText';

// ── Contrats wrapper → client ──────────────────────────────────────────────

export interface DcChar {
  id: string;
  label: string;
  element: string;
  cls: string;
  rarity: number;
  /** Stats de la fiche à SAISIR pour ce perso (slugs, ordre de la fiche). */
  statKeys: string[];
}

export interface DcSkillRow {
  slot: string;
  name: string;
  iconSrc?: string;
  offensive: boolean;
  maxLevel: number;
}

export interface DcGear {
  slug: string;
  label: string;
  icon: string;
  grade: string;
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
}

export interface DcTalisman {
  slug: string;
  label: string;
  icon: string;
  grade: string;
  star: number;
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
}

export interface DcSpawn {
  label: string;
  level: number;
  hpLines?: number;
  /** Avantage de spawn pré-formaté (« ATK +15% · DEF +15% »). */
  advLabel?: string;
}

export interface DcTarget {
  id: string;
  /** Libellé de MODE localisé (glossaire du jeu) — premier niveau du picker. */
  mode: string;
  /** Donjon (+ difficulté éventuelle). */
  label: string;
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
  panels: { attacker: string; target: string; team: string; buffs: string; result: string };
  title: string;
  pick: string;
  pickCharacter: string;
  transcend: string;
  skills: { title: string; dmg: string; support: string };
  settings: { title: string; subtitle: string; quirks: string };
  equipment: {
    title: string;
    sets: string;
    addSet: string;
    breakthrough: string;
    weapon: string;
    accessory: string;
    ee: string;
    eeNone: string;
    noPassive: string;
    pickWeapon: string;
    pickAccessory: string;
    pickTalisman: string;
    talisman: string;
    lv0: string;
    lv10: string;
    p2: string;
    p4: string;
  };
  stats: { title: string; sheetNote: string; final: string; finalNote: string };
  target: {
    monster: string;
    character: string;
    mode: string;
    resolved: string;
    lv: string;
    boss: string;
    hpBars: string;
    stage: string;
    fight: string;
  };
  context: {
    title: string;
    contentType: string;
    types: { pve: string; arena: string; rtpvp: string; worldboss: string };
    targetsHit: string;
    penaltyCycle: string;
    penaltyNote: string;
  };
  team: { emptySlot: string };
  buffs: {
    fromKits: string;
    kitsSoon: string;
    onAttacker: string;
    onTarget: string;
    value: string;
    stacks: string;
  };
  report: {
    empty: string;
    wip: string;
    branchesNote: string;
    normal: string;
    critical: string;
    miss: string;
    expected: string;
    expectedNote: string;
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
function DropPicker({
  anchor,
  open,
  setOpen,
  search,
  setSearch,
  searchPlaceholder,
  children,
}: {
  anchor: React.ReactNode;
  open: boolean;
  setOpen: (v: boolean) => void;
  search: string;
  setSearch: (v: string) => void;
  searchPlaceholder: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, setOpen]);
  return (
    <div className="relative" ref={ref}>
      {anchor}
      {open && (
        <div className="border-line-subtle bg-surface-overlay/95 absolute z-30 mt-1 w-full min-w-64 rounded-lg border shadow-xl backdrop-blur-sm">
          <div className="border-line-subtle border-b p-2">
            <SearchField value={search} onChange={setSearch} placeholder={searchPlaceholder} />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">{children}</div>
        </div>
      )}
    </div>
  );
}

const ANCHOR_CLASS =
  'border-line-subtle bg-surface-sunken/70 hover:border-line-strong text-content flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border px-2 text-left text-sm transition';
const ROW_CLASS =
  'hover:bg-surface-raised/80 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition';
const SELECT_CLASS =
  'border-line-subtle bg-surface-sunken/70 text-content focus:border-accent h-8 w-full cursor-pointer rounded-lg border px-2 text-xs focus:outline-none';

function NoMatches({ label }: { label: string }) {
  return <p className="text-content-subtle px-2 py-3 text-center text-xs">{label}</p>;
}

/** Picker de personnage (attaquant, allié, cible perso). */
function CharPicker({
  chars,
  value,
  onPick,
  onClear,
  placeholder,
  labels,
}: {
  chars: DcChar[];
  value: string | null;
  onPick: (id: string) => void;
  onClear?: () => void;
  placeholder: string;
  labels: DcLabels;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const current = value ? chars.find((c) => c.id === value) : undefined;
  const q = search.trim().toLowerCase();
  const filtered = q ? chars.filter((c) => c.label.toLowerCase().includes(q)) : chars;
  return (
    <DropPicker
      anchor={
        <div className="flex items-center gap-1.5">
          <button type="button" className={ANCHOR_CLASS} onClick={() => setOpen(!open)}>
            {current ? (
              <>
                <img src={img.face(current.id)} alt="" className="h-6 w-6 rounded" loading="lazy" />
                <span className="truncate font-semibold">{current.label}</span>
                <img src={img.element(current.element)} alt={current.element} className="h-4 w-4" />
              </>
            ) : (
              <span className="text-content-subtle truncate">{placeholder}</span>
            )}
            <span className="text-content-subtle ml-auto text-[9px]">▾</span>
          </button>
          {current && onClear && (
            <button
              type="button"
              className="text-content-subtle hover:text-danger cursor-pointer text-xs"
              onClick={onClear}
              title={labels.clear}
            >
              ✕
            </button>
          )}
        </div>
      }
      open={open}
      setOpen={setOpen}
      search={search}
      setSearch={setSearch}
      searchPlaceholder={labels.search}
    >
      {filtered.length ? (
        filtered.map((c) => (
          <button
            key={c.id}
            type="button"
            className={ROW_CLASS}
            onClick={() => {
              onPick(c.id);
              setOpen(false);
              setSearch('');
            }}
          >
            <img src={img.face(c.id)} alt="" className="h-7 w-7 rounded" loading="lazy" />
            <span className="truncate">{c.label}</span>
            <span className="flex-1" />
            <img src={img.element(c.element)} alt={c.element} className="h-4 w-4" />
            <img src={img.klass(c.cls)} alt={c.cls} className="h-4 w-4" />
          </button>
        ))
      ) : (
        <NoMatches label={labels.noMatches} />
      )}
    </DropPicker>
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

interface SetState {
  setId: string;
  pieces: '2P' | '4P';
  tier: number;
  on: boolean;
}

interface BuffChip {
  id: number;
  stat: string;
  value: string;
  stacks: number;
}

type ContentType = 'pve' | 'arena' | 'rtpvp' | 'worldboss';

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
  quirks,
  labels: L,
}: Props) {
  const [tab, setTab] = useState<'calc' | 'settings'>('calc');
  const [attackerId, setAttackerId] = useState<string | null>(null);
  const [transcend, setTranscend] = useState(6);
  const [skillLvls, setSkillLvls] = useState<Record<string, number>>({});
  const [setsState, setSetsState] = useState<SetState[]>([]);
  const [setPickerOpen, setSetPickerOpen] = useState(false);
  const [setSearch, setSetSearch] = useState('');
  const [weaponSlug, setWeaponSlug] = useState<string | null>(null);
  const [weaponTier, setWeaponTier] = useState(0);
  const [amuletSlug, setAmuletSlug] = useState<string | null>(null);
  const [amuletTier, setAmuletTier] = useState(0);
  const [talismanSlug, setTalismanSlug] = useState<string | null>(null);
  const [statVals, setStatVals] = useState<Record<string, string>>({});
  const [quirkLvls, setQuirkLvls] = useStoredState(QUIRKS_STORE);
  const [targetMode, setTargetMode] = useState<'monster' | 'character'>('monster');
  const [modeSel, setModeSel] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [spawnIdx, setSpawnIdx] = useState(0);
  const [targetCharId, setTargetCharId] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ContentType>('pve');
  const [targetsHit, setTargetsHit] = useState(1);
  const [cycle, setCycle] = useState(1);
  const [allies, setAllies] = useState<(string | null)[]>([null, null, null]);
  const [atkBuffs, setAtkBuffs] = useState<BuffChip[]>([]);
  const [tgtBuffs, setTgtBuffs] = useState<BuffChip[]>([]);
  const [buffStat, setBuffStat] = useState(statFields[0]?.key ?? 'atk');
  const [buffValue, setBuffValue] = useState('');
  const [buffStacks, setBuffStacks] = useState(1);
  const nextBuffId = useRef(1);

  const attacker = attackerId ? chars.find((c) => c.id === attackerId) : undefined;
  const kit = attackerId ? (kits[attackerId] ?? []) : [];
  const ee = attackerId ? ees[attackerId] : undefined;
  const weapon = weaponSlug ? weapons.find((w) => w.slug === weaponSlug) : undefined;
  const amulet = amuletSlug ? amulets.find((a) => a.slug === amuletSlug) : undefined;
  const talisman = talismanSlug ? talismans.find((tl) => tl.slug === talismanSlug) : undefined;
  const isPvP = contentType === 'arena' || contentType === 'rtpvp';

  // Saisie/stats finales : SEULES les stats qui pilotent les dégâts de CE perso
  // (`statKeys`, dérivé des kits par damage-scaling.json). Le select des buffs
  // garde la liste complète : il sert aussi la CIBLE (DEF down…).
  const sheetFields = attacker
    ? statFields.filter((f) => attacker.statKeys.includes(f.key))
    : statFields;

  // Cibles : modes distincts (ordre du jeu) → donjons du mode choisi.
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
  const activeMode = modeSel ?? modes[0] ?? '';
  const modeTargets = useMemo(
    () => targets.filter((tg) => tg.mode === activeMode),
    [targets, activeMode],
  );
  const target = targetId ? targets.find((tg) => tg.id === targetId) : undefined;
  const spawn = target?.spawns[Math.min(spawnIdx, target.spawns.length - 1)];

  // Armes/accessoires filtrés par la classe de l'attaquant (classLimit du jeu).
  const pickableWeapons = useMemo(
    () =>
      attacker
        ? weapons.filter((w) => !w.classLimits.length || w.classLimits.includes(attacker.cls))
        : weapons,
    [weapons, attacker],
  );
  const pickableAmulets = useMemo(
    () =>
      attacker
        ? amulets.filter((a) => !a.classLimits.length || a.classLimits.includes(attacker.cls))
        : amulets,
    [amulets, attacker],
  );

  const pickAttacker = (id: string) => {
    setAttackerId(id);
    const lvls: Record<string, number> = {};
    for (const row of kits[id] ?? []) lvls[row.slot] = row.maxLevel;
    setSkillLvls(lvls);
    setWeaponSlug(null);
    setAmuletSlug(null);
  };

  const addBuff = (side: 'atk' | 'tgt') => {
    const value = buffValue.trim();
    if (!value) return;
    const stat = statFields.find((f) => f.key === buffStat)?.label ?? buffStat;
    const chip: BuffChip = { id: nextBuffId.current++, stat, value, stacks: buffStacks };
    if (side === 'atk') setAtkBuffs((b) => [...b, chip]);
    else setTgtBuffs((b) => [...b, chip]);
    setBuffValue('');
    setBuffStacks(1);
  };

  const offensiveSkills = kit.filter((s) => s.offensive);
  const supportSkills = kit.filter((s) => !s.offensive);

  const filteredSets = setSearch.trim()
    ? sets.filter((s) => s.label.toLowerCase().includes(setSearch.trim().toLowerCase()))
    : sets;

  const wellClass = 'border-line-subtle bg-surface-sunken/70 rounded-lg border';

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4">
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
              />

              {attacker && (
                <>
                  {/* Transcendance : de la rareté du héros à 6 */}
                  <div className="flex items-center gap-2">
                    <span className="text-content-muted text-xs">{L.transcend}</span>
                    <span className="flex-1" />
                    <Stepper
                      value={Math.max(transcend, attacker.rarity)}
                      min={attacker.rarity}
                      max={6}
                      onChange={setTranscend}
                      format={(v) => `★${v}`}
                    />
                  </div>

                  {/* Niveaux de skill indépendants (chain/dual hors périmètre),
                    en COLONNES : slot / icône / tag / niveau, côte à côte. */}
                  <div className="space-y-1.5">
                    <Eyebrow>{L.skills.title}</Eyebrow>
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
                  </div>
                </>
              )}
            </Card>

            {attacker && (
              <Card title={L.equipment.title}>
                {/* Sets à passif de combat (les sets de stats sont dans la fiche) */}
                <div className="space-y-1.5">
                  <Eyebrow>{L.equipment.sets}</Eyebrow>
                  {setsState.map((st, i) => {
                    const view = sets.find((s) => s.id === st.setId);
                    if (!view) return null;
                    const stateIdx = st.tier >= 4 ? 1 : 0;
                    const effect =
                      (st.pieces === '2P' ? view.p2[stateIdx] : view.p4[stateIdx]) ??
                      (st.pieces === '2P' ? view.p2[0] : view.p4[0]) ??
                      L.equipment.noPassive;
                    return (
                      <div key={`${st.setId}-${i}`} className={`${wellClass} space-y-1.5 p-2`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={st.on}
                            onChange={() =>
                              setSetsState((all) =>
                                all.map((x, j) => (j === i ? { ...x, on: !x.on } : x)),
                              )
                            }
                            className="accent-accent h-3.5 w-3.5 cursor-pointer"
                          />
                          <img
                            src={img.equipment(view.icon)}
                            alt=""
                            className="h-6 w-6"
                            loading="lazy"
                          />
                          <span
                            className={`min-w-0 truncate text-xs font-semibold ${st.on ? 'text-content' : 'text-content-subtle'}`}
                          >
                            {view.label}
                          </span>
                          <button
                            type="button"
                            className="border-line-subtle text-accent cursor-pointer rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold"
                            onClick={() =>
                              setSetsState((all) =>
                                all.map((x, j) =>
                                  j === i ? { ...x, pieces: x.pieces === '2P' ? '4P' : '2P' } : x,
                                ),
                              )
                            }
                          >
                            {st.pieces === '2P' ? L.equipment.p2 : L.equipment.p4}
                          </button>
                          <span className="flex-1" />
                          <span className="text-content-subtle font-mono text-[9px] uppercase">
                            {L.equipment.breakthrough}
                          </span>
                          <Stepper
                            value={st.tier}
                            min={0}
                            max={4}
                            onChange={(v) =>
                              setSetsState((all) =>
                                all.map((x, j) => (j === i ? { ...x, tier: v } : x)),
                              )
                            }
                            format={(v) => `T${v}`}
                          />
                          <button
                            type="button"
                            className="text-content-subtle hover:text-danger cursor-pointer text-xs"
                            onClick={() => setSetsState((all) => all.filter((_, j) => j !== i))}
                            title={L.clear}
                          >
                            ✕
                          </button>
                        </div>
                        <p
                          className={`pl-6 font-mono text-[11px] tabular-nums ${st.on ? 'text-content-muted' : 'text-content-subtle'}`}
                        >
                          {effect}
                        </p>
                      </div>
                    );
                  })}
                  <DropPicker
                    anchor={
                      <button
                        type="button"
                        className="border-line-subtle text-content-subtle hover:border-accent hover:text-accent h-8 w-full cursor-pointer rounded-lg border border-dashed text-xs font-semibold transition"
                        onClick={() => setSetPickerOpen(!setPickerOpen)}
                      >
                        {L.equipment.addSet}
                      </button>
                    }
                    open={setPickerOpen}
                    setOpen={setSetPickerOpen}
                    search={setSearch}
                    setSearch={setSetSearch}
                    searchPlaceholder={L.search}
                  >
                    {filteredSets.length ? (
                      filteredSets.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className={ROW_CLASS}
                          onClick={() => {
                            setSetsState((all) => [
                              ...all,
                              { setId: s.id, pieces: s.p4[0] ? '4P' : '2P', tier: 0, on: true },
                            ]);
                            setSetPickerOpen(false);
                            setSetSearch('');
                          }}
                        >
                          <img
                            src={img.equipment(s.icon)}
                            alt=""
                            className="h-6 w-6"
                            loading="lazy"
                          />
                          <span className="truncate">{s.label}</span>
                        </button>
                      ))
                    ) : (
                      <NoMatches label={L.noMatches} />
                    )}
                  </DropPicker>
                </div>

                {/* Arme & accessoire — passif par palier de breakthrough */}
                <div className="space-y-1.5">
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
                </div>

                {/* EE + Talisman */}
                <div className="grid gap-1.5 sm:grid-cols-2">
                  <div className={`${wellClass} space-y-1.5 p-2`}>
                    <Eyebrow>{L.equipment.ee}</Eyebrow>
                    {ee ? (
                      <div className="flex items-start gap-2">
                        <EquipmentIcon src={ee.src} grade={ee.grade} size={34} />
                        <div className="min-w-0 space-y-1">
                          <p className="text-content truncate text-xs font-semibold">{ee.name}</p>
                          {/* Un palier par ligne : Lv0 / Lv10 SÉPARÉS (le palier
                            +10 remplace le précédent), « + » quand il s'AJOUTE. */}
                          {ee.rows.map((row, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <span className="border-line-subtle text-accent mt-0.5 rounded border px-1 font-mono text-[9px] font-bold whitespace-nowrap">
                                {row.isAdd ? '+' : ''}
                                {row.level >= 10 ? L.equipment.lv10 : L.equipment.lv0}
                              </span>
                              <GameText
                                text={row.html}
                                className="text-content-muted text-[11px] leading-relaxed whitespace-pre-line"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-content-subtle text-[11px]">{L.equipment.eeNone}</p>
                    )}
                  </div>

                  <div className={`${wellClass} space-y-1 p-2`}>
                    <div className="flex items-center gap-2">
                      <Eyebrow>{L.equipment.talisman}</Eyebrow>
                      <span className="flex-1" />
                      {talisman && (
                        <button
                          type="button"
                          className="text-content-subtle hover:text-danger cursor-pointer text-xs"
                          onClick={() => setTalismanSlug(null)}
                          title={L.clear}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <TalismanPicker
                      talismans={talismans}
                      value={talisman}
                      onPick={setTalismanSlug}
                      labels={L}
                    />
                    {talisman?.text && (
                      <p className="text-content-muted text-[11px] leading-relaxed whitespace-pre-line">
                        {talisman.text}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

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

                {/* Stats finales — SORTIE du moteur, pas branchée en phase UI */}
                <div className={`${wellClass} space-y-1.5 p-2.5`}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-accent font-mono text-[10px] font-bold tracking-wide uppercase">
                      {L.stats.final}
                    </span>
                    <span className="text-content-subtle text-[10px]">{L.stats.finalNote}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {sheetFields.map((f) => (
                      <span key={f.key} className="flex items-baseline gap-2 text-[11px]">
                        <span className="text-content-subtle truncate">{f.label}</span>
                        <span className="flex-1" />
                        <span className="text-content-muted font-mono font-bold tabular-nums">
                          —
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* ═══ COLONNE 2 — SCÉNARIO ═══ */}
          <div className="min-w-0 space-y-4">
            <Card title={L.panels.target}>
              <div className="border-line-subtle bg-surface-sunken/70 grid grid-cols-2 gap-1 rounded-lg border p-1">
                {(['monster', 'character'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`h-7 cursor-pointer rounded-md text-xs font-bold transition ${
                      targetMode === mode
                        ? 'bg-accent text-surface-base'
                        : 'text-content-muted hover:text-content'
                    }`}
                    onClick={() => setTargetMode(mode)}
                  >
                    {mode === 'monster' ? L.target.monster : L.target.character}
                  </button>
                ))}
              </div>

              {targetMode === 'monster' ? (
                <div className="space-y-2">
                  <label className="block space-y-1">
                    <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                      {L.target.mode}
                    </span>
                    <select
                      value={activeMode}
                      onChange={(e) => {
                        setModeSel(e.target.value);
                        setTargetId(null);
                        setSpawnIdx(0);
                      }}
                      className={SELECT_CLASS}
                    >
                      {modes.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </label>

                  <TargetPicker
                    targets={modeTargets}
                    value={target}
                    onPick={(id) => {
                      setTargetId(id);
                      setSpawnIdx(0);
                    }}
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
                        <div className={`${wellClass} flex items-center gap-2 px-2.5 py-2`}>
                          <span className="text-content-subtle font-mono text-[9px] uppercase">
                            {L.target.resolved}
                          </span>
                          <span className="text-content-muted min-w-0 flex-1 truncate text-right font-mono text-[11px] tabular-nums">
                            {[
                              `${L.target.lv} ${spawn.level}`,
                              spawn.hpLines ? vars(L.target.hpBars, { n: spawn.hpLines }) : null,
                              spawn.advLabel ?? null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <CharPicker
                  chars={chars}
                  value={targetCharId}
                  onPick={setTargetCharId}
                  onClear={() => setTargetCharId(null)}
                  placeholder={L.pickCharacter}
                  labels={L}
                />
              )}
            </Card>

            <Card title={L.context.title}>
              <label className="block space-y-1">
                <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                  {L.context.contentType}
                </span>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  className={SELECT_CLASS}
                >
                  <option value="pve">{L.context.types.pve}</option>
                  <option value="arena">{L.context.types.arena}</option>
                  <option value="rtpvp">{L.context.types.rtpvp}</option>
                  <option value="worldboss">{L.context.types.worldboss}</option>
                </select>
              </label>

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

              {isPvP && (
                <div className="border-accent/35 bg-surface-sunken/70 space-y-1 rounded-lg border p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-mono text-[9px] font-bold tracking-wide uppercase">
                      {L.context.penaltyCycle}
                    </span>
                    <span className="flex-1" />
                    <Stepper value={cycle} min={1} max={99} onChange={setCycle} />
                  </div>
                  <p className="text-content-subtle text-[11px]">{L.context.penaltyNote}</p>
                </div>
              )}
            </Card>

            <Card
              title={L.panels.team}
              right={<span className="text-content-subtle font-mono text-[9px]">1 + 3</span>}
            >
              <div className="space-y-1.5">
                {allies.map((ally, i) => (
                  <CharPicker
                    key={i}
                    chars={chars.filter(
                      (c) => c.id !== attackerId && !allies.some((a, j) => j !== i && a === c.id),
                    )}
                    value={ally}
                    onPick={(id) => setAllies((all) => all.map((a, j) => (j === i ? id : a)))}
                    onClear={() => setAllies((all) => all.map((a, j) => (j === i ? null : a)))}
                    placeholder={vars(L.team.emptySlot, { n: i + 2 })}
                    labels={L}
                  />
                ))}
              </div>
            </Card>

            <Card
              title={L.panels.buffs}
              right={
                <span className="text-content-subtle font-mono text-[9px]">
                  {atkBuffs.length + tgtBuffs.length}
                </span>
              }
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <select
                  value={buffStat}
                  onChange={(e) => setBuffStat(e.target.value)}
                  className="border-line-subtle bg-surface-sunken/70 text-content focus:border-accent h-8 min-w-0 flex-1 cursor-pointer rounded-lg border px-2 text-xs focus:outline-none"
                >
                  {statFields.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={buffValue}
                  onChange={(e) => setBuffValue(e.target.value)}
                  placeholder={L.buffs.value}
                  className="border-line-subtle bg-surface-sunken/70 text-content placeholder:text-content-subtle focus:border-accent h-8 w-20 rounded-lg border px-2 font-mono text-xs focus:outline-none"
                />
                <Stepper
                  value={buffStacks}
                  min={1}
                  max={9}
                  onChange={setBuffStacks}
                  format={(v) => `×${v}`}
                />
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  className="border-line-subtle bg-surface-sunken/70 text-content-muted hover:border-accent hover:text-accent h-7 flex-1 cursor-pointer rounded-md border text-xs font-semibold transition"
                  onClick={() => addBuff('atk')}
                >
                  {L.buffs.onAttacker}
                </button>
                <button
                  type="button"
                  className="border-line-subtle bg-surface-sunken/70 text-content-muted hover:border-danger hover:text-danger h-7 flex-1 cursor-pointer rounded-md border text-xs font-semibold transition"
                  onClick={() => addBuff('tgt')}
                >
                  {L.buffs.onTarget}
                </button>
              </div>

              {(atkBuffs.length > 0 || tgtBuffs.length > 0) && (
                <div className="space-y-2">
                  <BuffChips
                    title={L.buffs.onAttacker}
                    chips={atkBuffs}
                    tone="buff"
                    onRemove={(id) => setAtkBuffs((b) => b.filter((x) => x.id !== id))}
                  />
                  <BuffChips
                    title={L.buffs.onTarget}
                    chips={tgtBuffs}
                    tone="debuff"
                    onRemove={(id) => setTgtBuffs((b) => b.filter((x) => x.id !== id))}
                  />
                </div>
              )}

              <button
                type="button"
                disabled
                className="border-line-subtle text-content-subtle h-8 w-full cursor-not-allowed rounded-lg border border-dashed text-xs"
                title={L.buffs.kitsSoon}
              >
                {L.buffs.fromKits} · {L.buffs.kitsSoon}
              </button>
            </Card>
          </div>

          {/* ═══ COLONNE 3 — RAPPORT ═══ */}
          <div className="min-w-0 space-y-4">
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
                {offensiveSkills.map((sk) => (
                  <div
                    key={sk.slot}
                    className="border-line bg-surface-raised/60 overflow-hidden rounded-xl border"
                  >
                    <div className="border-line-subtle flex items-center gap-2.5 border-b px-3.5 py-2.5">
                      {sk.iconSrc ? (
                        <img
                          src={sk.iconSrc}
                          alt=""
                          className="h-9 w-9 rounded-lg"
                          loading="lazy"
                        />
                      ) : (
                        <span className="border-line-subtle bg-surface-sunken/70 h-9 w-9 rounded-lg border" />
                      )}
                      <div className="min-w-0">
                        <p className="text-content truncate text-sm font-bold">{sk.name}</p>
                        <p className="text-content-subtle font-mono text-[10px]">
                          {sk.slot} · Lv {skillLvls[sk.slot] ?? sk.maxLevel}
                        </p>
                      </div>
                    </div>

                    <div className="bg-line-subtle grid grid-cols-3 gap-px">
                      {[L.report.normal, L.report.critical, L.report.miss].map((branch, i) => (
                        <div key={branch} className="bg-surface-sunken/60 space-y-1 px-3.5 py-3">
                          <p
                            className={`font-mono text-[9px] tracking-wide uppercase ${i === 1 ? 'text-warn' : 'text-content-subtle'}`}
                          >
                            {branch}
                          </p>
                          <p className="text-content-muted font-mono text-2xl font-bold tabular-nums">
                            —
                          </p>
                          <p className="text-content-subtle font-mono text-[10px] tabular-nums">
                            —%
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-accent/30 from-accent/12 flex items-center gap-3 border-t bg-linear-to-r to-transparent px-3.5 py-3">
                      <div>
                        <p className="text-accent font-mono text-[10px] font-bold tracking-wide uppercase">
                          {L.report.expected}
                        </p>
                        <p className="text-content-subtle font-mono text-[10px]">
                          {L.report.expectedNote}
                        </p>
                      </div>
                      <span className="flex-1" />
                      <span className="text-content-muted font-mono text-3xl font-bold tabular-nums">
                        —
                      </span>
                    </div>
                  </div>
                ))}

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
  return (
    <div className="border-line-subtle bg-surface-sunken/70 space-y-1.5 rounded-lg border p-2">
      <div className="flex items-center gap-2">
        <Eyebrow>{title}</Eyebrow>
        <span className="flex-1" />
        {value && (
          <>
            <span className="text-content-subtle font-mono text-[9px] uppercase">
              {labels.equipment.breakthrough}
            </span>
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
      <DropPicker
        anchor={
          <button type="button" className={ANCHOR_CLASS} onClick={() => setOpen(!open)}>
            {value ? (
              <>
                <EquipmentIcon icon={value.icon} grade={value.grade} size={26} />
                <span className="truncate font-semibold">{value.label}</span>
              </>
            ) : (
              <span className="text-content-subtle truncate">{placeholder}</span>
            )}
            <span className="text-content-subtle ml-auto text-[9px]">▾</span>
          </button>
        }
        open={open}
        setOpen={setOpen}
        search={search}
        setSearch={setSearch}
        searchPlaceholder={labels.search}
      >
        {filtered.length ? (
          filtered.map((o) => (
            <button
              key={o.slug}
              type="button"
              className={ROW_CLASS}
              onClick={() => {
                onPick(o.slug);
                setOpen(false);
                setSearch('');
              }}
            >
              <EquipmentIcon icon={o.icon} grade={o.grade} size={28} />
              <span className="truncate">{o.label}</span>
            </button>
          ))
        ) : (
          <NoMatches label={labels.noMatches} />
        )}
      </DropPicker>
      {value && tiers && (
        <p className="text-content-muted font-mono text-[11px] leading-relaxed whitespace-pre-line tabular-nums">
          {tiers[tier] || labels.equipment.noPassive}
        </p>
      )}
    </div>
  );
}

function TalismanPicker({
  talismans,
  value,
  onPick,
  labels,
}: {
  talismans: DcTalisman[];
  value: DcTalisman | undefined;
  onPick: (slug: string) => void;
  labels: DcLabels;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();
  const filtered = q ? talismans.filter((o) => o.label.toLowerCase().includes(q)) : talismans;
  return (
    <DropPicker
      anchor={
        <button type="button" className={ANCHOR_CLASS} onClick={() => setOpen(!open)}>
          {value ? (
            <>
              <EquipmentIcon icon={value.icon} grade={value.grade} size={26} />
              <span className="truncate font-semibold">{value.label}</span>
              <span className="text-warn font-mono text-[10px] font-bold">★{value.star}</span>
            </>
          ) : (
            <span className="text-content-subtle truncate">{labels.equipment.pickTalisman}</span>
          )}
          <span className="text-content-subtle ml-auto text-[9px]">▾</span>
        </button>
      }
      open={open}
      setOpen={setOpen}
      search={search}
      setSearch={setSearch}
      searchPlaceholder={labels.search}
    >
      {filtered.length ? (
        filtered.map((o) => (
          <button
            key={o.slug}
            type="button"
            className={ROW_CLASS}
            onClick={() => {
              onPick(o.slug);
              setOpen(false);
              setSearch('');
            }}
          >
            <EquipmentIcon icon={o.icon} grade={o.grade} size={28} />
            <span className="truncate">{o.label}</span>
          </button>
        ))
      ) : (
        <NoMatches label={labels.noMatches} />
      )}
    </DropPicker>
  );
}

function TargetPicker({
  targets,
  value,
  onPick,
  labels,
}: {
  targets: DcTarget[];
  value: DcTarget | undefined;
  onPick: (id: string) => void;
  labels: DcLabels;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();
  const filtered = q
    ? targets.filter((o) => o.label.toLowerCase().includes(q) || o.name.toLowerCase().includes(q))
    : targets;
  return (
    <DropPicker
      anchor={
        <button type="button" className={ANCHOR_CLASS} onClick={() => setOpen(!open)}>
          {value ? (
            <>
              <img src={value.iconSrc} alt="" className="h-6 w-6 rounded" loading="lazy" />
              <span className="truncate font-semibold">{value.name}</span>
              <span className="text-content-subtle truncate text-[11px]">{value.label}</span>
              <img src={img.element(value.element)} alt={value.element} className="h-4 w-4" />
            </>
          ) : (
            <span className="text-content-subtle truncate">{labels.select}</span>
          )}
          <span className="text-content-subtle ml-auto text-[9px]">▾</span>
        </button>
      }
      open={open}
      setOpen={setOpen}
      search={search}
      setSearch={setSearch}
      searchPlaceholder={labels.search}
    >
      {filtered.length ? (
        filtered.map((o) => (
          <button
            key={o.id}
            type="button"
            className={ROW_CLASS}
            onClick={() => {
              onPick(o.id);
              setOpen(false);
              setSearch('');
            }}
          >
            <img src={o.iconSrc} alt="" className="h-7 w-7 rounded" loading="lazy" />
            <span className="min-w-0 flex-col">
              <span className="block truncate">{o.name}</span>
              <span className="text-content-subtle block truncate text-[10px]">{o.label}</span>
            </span>
            <span className="flex-1" />
            <span className="text-warn border-warn/35 bg-warn/10 rounded border px-1 font-mono text-[9px] font-bold uppercase">
              {labels.target.boss}
            </span>
          </button>
        ))
      ) : (
        <NoMatches label={labels.noMatches} />
      )}
    </DropPicker>
  );
}

function BuffChips({
  title,
  chips,
  tone,
  onRemove,
}: {
  title: string;
  chips: BuffChip[];
  tone: 'buff' | 'debuff';
  onRemove: (id: number) => void;
}) {
  if (!chips.length) return null;
  const chipClass =
    tone === 'buff'
      ? 'border-accent/40 bg-accent/10 text-accent'
      : 'border-danger/40 bg-danger/10 text-danger';
  return (
    <div className="space-y-1">
      <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
        {title}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <span
            key={c.id}
            className={`inline-flex items-center gap-1.5 rounded-full border py-0.5 pr-2 pl-2.5 font-mono text-[11px] font-bold tabular-nums ${chipClass}`}
          >
            {c.stat} {c.value}
            {c.stacks > 1 ? ` ×${c.stacks}` : ''}
            <button
              type="button"
              className="hover:text-content cursor-pointer text-[10px]"
              onClick={() => onRemove(c.id)}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
